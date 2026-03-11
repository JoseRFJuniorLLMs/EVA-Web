import { useState, useRef, useCallback, useEffect } from 'react';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

/** Draw waveform at ~15fps instead of 60fps to avoid starving the audio thread */
const WAVEFORM_INTERVAL_MS = 66;

export function useAudioEngine() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);

  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const animFrameRef = useRef<number | null>(null);
  const lastDrawTimeRef = useRef(0);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Sync state -> ref for requestAnimationFrame
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  const drawWaveform = useCallback(() => {
    animFrameRef.current = requestAnimationFrame(drawWaveform);

    // Throttle canvas draws to ~15fps — frees main thread for audio decoding
    const now = performance.now();
    if (now - lastDrawTimeRef.current < WAVEFORM_INTERVAL_MS) return;
    lastDrawTimeRef.current = now;

    const canvas = waveCanvasRef.current;
    if (!canvas || canvas.offsetWidth === 0) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = Math.round(canvas.offsetWidth * dpr);
    const displayH = Math.round(canvas.offsetHeight * dpr);
    if (canvas.width !== displayW || canvas.height !== displayH) {
      canvas.width = displayW;
      canvas.height = displayH;
    }

    const W = canvas.width;
    const H = canvas.height;
    ctx2d.clearRect(0, 0, W, H);

    const speaking = isSpeakingRef.current;
    const analyser = speaking ? outputAnalyserRef.current : inputAnalyserRef.current;

    if (analyser) {
      const len = analyser.frequencyBinCount;
      if (!waveDataRef.current || waveDataRef.current.length !== len) {
        waveDataRef.current = new Uint8Array(len);
      }
      const data = waveDataRef.current;
      analyser.getByteTimeDomainData(data);

      ctx2d.beginPath();
      ctx2d.strokeStyle = speaking ? '#10b981' : '#6ee7b7';
      ctx2d.lineWidth = 2;
      ctx2d.lineCap = 'round';
      ctx2d.lineJoin = 'round';

      for (let i = 0; i < len; i++) {
        const x = (i / (len - 1)) * W;
        const y = H / 2 + ((data[i] - 128) / 128) * (H * 0.42);
        i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
    } else {
      ctx2d.beginPath();
      ctx2d.strokeStyle = '#d1fae5';
      ctx2d.lineWidth = 1.5;
      ctx2d.moveTo(0, H / 2);
      ctx2d.lineTo(W, H / 2);
      ctx2d.stroke();
    }
  }, []);

  const initAudio = useCallback(async (): Promise<MediaStream> => {
    // Guard: close any existing contexts to prevent AudioContext leak
    if (inputAudioCtxRef.current) { inputAudioCtxRef.current.close().catch(() => {}); }
    if (outputAudioCtxRef.current) { outputAudioCtxRef.current.close().catch(() => {}); }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); }

    const inputCtx = new AudioContext({ sampleRate: 16000 });
    const outputCtx = new AudioContext({ sampleRate: 24000, latencyHint: 'playback' });
    inputAudioCtxRef.current = inputCtx;
    outputAudioCtxRef.current = outputCtx;

    const outputNode = outputCtx.createGain();
    outputNode.connect(outputCtx.destination);
    outputNodeRef.current = outputNode;

    const inputAnalyser = inputCtx.createAnalyser();
    inputAnalyser.fftSize = 1024;
    inputAnalyser.smoothingTimeConstant = 0.8;
    inputAnalyserRef.current = inputAnalyser;

    const outputAnalyser = outputCtx.createAnalyser();
    outputAnalyser.fftSize = 1024;
    outputAnalyser.smoothingTimeConstant = 0.8;
    outputAnalyserRef.current = outputAnalyser;
    outputNode.connect(outputAnalyser);

    animFrameRef.current = requestAnimationFrame(drawWaveform);

    if (!inputCtx.audioWorklet) throw new Error('AudioWorklet not supported');
    await inputCtx.audioWorklet.addModule(import.meta.env.BASE_URL + 'audio-processor.js');
    await inputCtx.resume();
    await outputCtx.resume();

    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = micStream;

    return micStream;
  }, [drawWaveform]);

  const setupMicCapture = useCallback((
    micStream: MediaStream,
    onAudioBlob: (blob: { data: string; mimeType: string }) => void
  ) => {
    const audioCtx = inputAudioCtxRef.current;
    if (!audioCtx) return;
    const source = audioCtx.createMediaStreamSource(micStream);
    const workletNode = new AudioWorkletNode(audioCtx, 'audio-processor');
    workletNode.port.onmessage = (e: MessageEvent) => {
      try {
        onAudioBlob(createBlob(e.data));
      } catch (err) {
        console.warn('[AudioEngine] mic capture error:', err);
      }
    };
    if (inputAnalyserRef.current) source.connect(inputAnalyserRef.current);
    source.connect(workletNode);
    workletNode.connect(audioCtx.destination);
    workletNodeRef.current = workletNode;
  }, []);

  const playAudioChunk = useCallback(async (base64Data: string) => {
    // Only trigger React state update on transition from false→true
    if (!isSpeakingRef.current) setIsSpeaking(true);
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
    try {
      const audioBuffer = await decodeAudioData(decode(base64Data), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      const outNode = outputNodeRef.current;
      if (!outNode) return;
      source.connect(outNode);
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      sourcesRef.current.add(source);
      source.onended = () => sourcesRef.current.delete(source);
    } catch (err) {
      console.warn('[AudioEngine] audio decode error (chunk dropped):', err);
    }
  }, []);

  /** Play a short connection beep using the EXISTING output AudioContext (no new context) */
  const playBeep = useCallback(() => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx || ctx.state === 'closed') return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 523;
      osc.type = 'sine';
      gain.gain.value = 0.12;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 784;
      osc2.type = 'sine';
      gain2.gain.value = 0.12;
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.4);
    } catch { /* audio not available */ }
  }, []);

  const handleInterrupted = useCallback(() => {
    setIsSpeaking(false);
    sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* */ } });
    sourcesRef.current.clear();
    if (outputAudioCtxRef.current) nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
  }, []);

  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (workletNodeRef.current) { workletNodeRef.current.disconnect(); workletNodeRef.current.port.postMessage('STOP'); workletNodeRef.current = null; }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* */ } });
    sourcesRef.current.clear();
    if (inputAudioCtxRef.current) { inputAudioCtxRef.current.close().catch(() => {}); inputAudioCtxRef.current = null; }
    if (outputAudioCtxRef.current) { outputAudioCtxRef.current.close().catch(() => {}); outputAudioCtxRef.current = null; }
    outputNodeRef.current = null;
    nextStartTimeRef.current = 0;
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    setIsSpeaking,
    waveCanvasRef,
    initAudio,
    setupMicCapture,
    playAudioChunk,
    playBeep,
    handleInterrupted,
    cleanupAudio,
  };
}
