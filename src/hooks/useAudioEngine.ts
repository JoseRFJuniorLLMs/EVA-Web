import { useState, useRef, useCallback, useEffect } from 'react';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

const MAX_SOURCES = 64;

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
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state -> ref for requestAnimationFrame
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  const drawWaveform = useCallback(() => {
    animFrameRef.current = requestAnimationFrame(drawWaveform);

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
      const data = new Uint8Array(len);
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
    const inputCtx = new AudioContext({ sampleRate: 16000 });
    const outputCtx = new AudioContext({ sampleRate: 24000 });
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
    await inputCtx.audioWorklet.addModule('/audio-processor.js');
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
    const audioCtx = inputAudioCtxRef.current!;
    const source = audioCtx.createMediaStreamSource(micStream);
    const workletNode = new AudioWorkletNode(audioCtx, 'audio-processor');
    workletNode.port.onmessage = (e: MessageEvent) => {
      try {
        onAudioBlob(createBlob(e.data));
      } catch { /* ignore */ }
    };
    if (inputAnalyserRef.current) source.connect(inputAnalyserRef.current);
    source.connect(workletNode);
    workletNode.connect(audioCtx.destination);
    workletNodeRef.current = workletNode;
  }, []);

  const playAudioChunk = useCallback(async (base64Data: string) => {
    setIsSpeaking(true);
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
    try {
      const audioBuffer = await decodeAudioData(decode(base64Data), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputNodeRef.current!);
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      sourcesRef.current.add(source);
      source.onended = () => sourcesRef.current.delete(source);
      // Prevent unbounded growth
      if (sourcesRef.current.size > MAX_SOURCES) {
        const oldest = sourcesRef.current.values().next().value;
        if (oldest) { try { oldest.stop(); } catch { /* */ } sourcesRef.current.delete(oldest); }
      }
    } catch { /* ignore decode errors */ }
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
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    setIsSpeaking,
    waveCanvasRef,
    initAudio,
    setupMicCapture,
    playAudioChunk,
    handleInterrupted,
    cleanupAudio,
  };
}
