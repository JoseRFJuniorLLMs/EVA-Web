import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Monitor, Camera, Sparkles, ArrowRight, LogOut, X, User, ChevronDown, ChevronUp, Brain, Mail, Calendar, PlayCircle, HardDrive, Search, MapPin, MessageSquare, Bell } from 'lucide-react';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useToolEvents } from '../hooks/useToolEvents';
import { useUiActions } from '../hooks/useUiActions';
import { EvaTextInput } from '../components/eva/EvaTextInput';
import { EvaToolCard } from '../components/eva/EvaToolCard';
import { EvaQuickActions } from '../components/eva/EvaQuickActions';
import { EvaSOS } from '../components/eva/EvaSOS';
import { MusicPlayer } from '../components/eva/players/MusicPlayer';
import { TimerPlayer } from '../components/eva/players/TimerPlayer';

// Service dashboard cards — always visible during session
const SERVICE_CARDS = [
  { id: 'email', icon: Mail, label: 'Gmail', color: 'red', tools: ['send_email', 'new_email'] },
  { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'blue', tools: ['manage_calendar_event'] },
  { id: 'video', icon: PlayCircle, label: 'YouTube', color: 'red', tools: ['search_videos', 'play_video'] },
  { id: 'drive', icon: HardDrive, label: 'Drive', color: 'green', tools: ['save_to_drive'] },
  { id: 'search', icon: Search, label: 'Web Search', color: 'indigo', tools: ['web_search'] },
  { id: 'maps', icon: MapPin, label: 'Maps', color: 'emerald', tools: ['find_nearby_places'] },
  { id: 'messaging', icon: MessageSquare, label: 'Messages', color: 'purple', tools: ['send_whatsapp', 'send_telegram'] },
  { id: 'reminders', icon: Bell, label: 'Reminders', color: 'amber', tools: ['schedule_task', 'list_scheduled_tasks'] },
] as const;

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; icon: string; activeBg: string }> = {
  red:     { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     icon: 'text-red-500',     activeBg: 'bg-red-100' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    icon: 'text-blue-500',    activeBg: 'bg-blue-100' },
  green:   { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-700',   icon: 'text-green-500',   activeBg: 'bg-green-100' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  icon: 'text-indigo-500',  activeBg: 'bg-indigo-100' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', activeBg: 'bg-emerald-100' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  icon: 'text-purple-500',  activeBg: 'bg-purple-100' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   icon: 'text-amber-500',   activeBg: 'bg-amber-100' },
};

function getWsUrl(): string {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws/browser`;
}

type SessionMode = 'voice' | 'screen' | 'camera';

export function EvaPage() {
  const { t } = useLanguage();
  const [cpf, setCpf] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeMode, setActiveMode] = useState<SessionMode | null>(null);
  const [showVideoOptions, setShowVideoOptions] = useState(false);

  // Google OAuth state
  const [loginStep, setLoginStep] = useState<'cpf' | 'google' | 'ready'>('cpf');
  const [idosoData, setIdosoData] = useState<{ id: number; nome: string } | null>(null);
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email: string } | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Session state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [subtitleText, setSubtitleText] = useState('');
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'eva' }[]>([]);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');

  // Capabilities panel
  const [capabilities, setCapabilities] = useState<{ id: string; content: string }[]>([]);
  const [capLoading, setCapLoading] = useState(false);
  const [showCaps, setShowCaps] = useState(true);

  // Tool events (Phases 0-7)
  const { toolEvents, activeMusic, activeTimer, emergencyActive, setEmergencyActive, handleToolEvent, clearEvents, dismissEvent } = useToolEvents();

  // Speaker recognition
  const [speakerInfo, setSpeakerInfo] = useState<{
    name: string; confidence: number; emotion: string;
    pitchHz: number; energy: number; stressLevel: number; isNew: boolean;
  } | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const activeRef = useRef(false);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);

  // Sync isSpeaking state -> ref para uso dentro do requestAnimationFrame
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, subtitleText]);

  // drawWaveform: le dados de tempo do AnalyserNode e desenha a onda no canvas
  // Alterna entre mic do utilizador (verde claro) e voz da EVA (verde esmeralda)
  const drawWaveform = useCallback(() => {
    // Agenda o proximo frame SEMPRE, mesmo sem canvas — o loop nao pode morrer
    animFrameRef.current = requestAnimationFrame(drawWaveform);

    const canvas = waveCanvasRef.current;
    if (!canvas || canvas.offsetWidth === 0) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    // Sincroniza buffer do canvas com tamanho real (DPR incluido)
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
      ctx2d.strokeStyle = speaking ? '#10b981' : '#6ee7b7'; // emerald-500 / emerald-300
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
      // Linha plana quando sem audio
      ctx2d.beginPath();
      ctx2d.strokeStyle = '#d1fae5';
      ctx2d.lineWidth = 1.5;
      ctx2d.moveTo(0, H / 2);
      ctx2d.lineTo(W, H / 2);
      ctx2d.stroke();
    }
  }, []);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;
    if (frameIntervalRef.current) { clearInterval(frameIntervalRef.current); frameIntervalRef.current = null; }
    if (videoStreamRef.current) { videoStreamRef.current.getTracks().forEach(t => t.stop()); videoStreamRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (workletNodeRef.current) { workletNodeRef.current.disconnect(); workletNodeRef.current.port.postMessage('STOP'); workletNodeRef.current = null; }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* */ } });
    sourcesRef.current.clear();
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
  }, []);

  const stopSession = useCallback(() => {
    cleanup();
    setActiveMode(null);
    setSessionStatus('idle');
    setIsSpeaking(false);
    setSubtitleText('');
    setMessages([]);
    setSpeakerInfo(null);
    clearEvents();
  }, [cleanup, clearEvents]);

  const captureAndSendFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ws = wsRef.current;
    if (!video || !canvas || !ws || ws.readyState !== WebSocket.OPEN) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const maxSize = 768;
    let w = video.videoWidth, h = video.videoHeight;
    if (w > maxSize || h > maxSize) { const scale = maxSize / Math.max(w, h); w = Math.round(w * scale); h = Math.round(h * scale); }
    canvas.width = w; canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    ws.send(JSON.stringify({ type: 'video', data: base64 }));
  }, []);

  // Switch mode mid-session: stop video stream, start new one, keep WS + audio alive
  const switchMode = useCallback(async (newMode: SessionMode) => {
    if (newMode === activeMode) return;
    // Stop current video stream
    if (frameIntervalRef.current) { clearInterval(frameIntervalRef.current); frameIntervalRef.current = null; }
    if (videoStreamRef.current) { videoStreamRef.current.getTracks().forEach(t => t.stop()); videoStreamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;

    // Start new video stream if needed
    if (newMode === 'screen') {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        videoStreamRef.current = stream;
        stream.getVideoTracks()[0].onended = () => switchMode('voice');
        if (videoRef.current) videoRef.current.srcObject = stream;
        frameIntervalRef.current = setInterval(captureAndSendFrame, 1000);
      } catch { /* user cancelled screen picker */ return; }
    } else if (newMode === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        frameIntervalRef.current = setInterval(captureAndSendFrame, 1000);
      } catch { return; }
    }
    // voice mode = no video stream, just audio (already running)

    setActiveMode(newMode);
    toast.info(`Modo: ${newMode === 'voice' ? 'Voz' : newMode === 'screen' ? 'Tela' : 'Câmera'}`);
  }, [activeMode, captureAndSendFrame]);

  // UI actions handler (EVA can control the interface)
  const { executeAction } = useUiActions({
    onSwitchMode: switchMode,
  });

  // Send text message via WebSocket (typed input or quick action)
  const sendTextMessage = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'text', text, data: 'user_typed' }));
    setMessages(msgs => [...msgs, { text, from: 'user' }]);
  }, []);

  const startSession = useCallback(async (mode: SessionMode) => {
    setActiveMode(mode);
    setSessionStatus('connecting');
    setShowVideoOptions(false);
    setMessages([]);
    setSubtitleText('');

    try {
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      outputNodeRef.current = outputNode;

      // Analysers para visualizacao de waveform em tempo real
      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 1024;
      inputAnalyser.smoothingTimeConstant = 0.8;
      inputAnalyserRef.current = inputAnalyser;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 1024;
      outputAnalyser.smoothingTimeConstant = 0.8;
      outputAnalyserRef.current = outputAnalyser;
      // Tap na saida da EVA (sem interferir no caminho principal)
      outputNode.connect(outputAnalyser);

      // Inicia loop de animacao da waveform
      animFrameRef.current = requestAnimationFrame(drawWaveform);

      if (!inputCtx.audioWorklet) { setSessionStatus('error'); return; }
      await inputCtx.audioWorklet.addModule('/audio-processor.js');
      await inputCtx.resume();
      await outputCtx.resume();

      // Mic
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      // Video: screen share ou camera
      if (mode === 'screen') {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        videoStreamRef.current = stream;
        stream.getVideoTracks()[0].onended = () => stopSession();
        if (videoRef.current) videoRef.current.srcObject = stream;
      } else if (mode === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      }

      // WebSocket
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'config', text: '', data: cpf.replace(/\D/g, '') }));
      };

      ws.onmessage = async (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'status':
              if (msg.text === 'ready') {
                activeRef.current = true;
                setSessionStatus('active');
                // Start audio capture
                const audioCtx = inputAudioCtxRef.current!;
                const source = audioCtx.createMediaStreamSource(micStream);
                const workletNode = new AudioWorkletNode(audioCtx, 'audio-processor');
                workletNode.port.onmessage = (e: MessageEvent) => {
                  if (!activeRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
                  try {
                    const blob = createBlob(e.data);
                    wsRef.current.send(JSON.stringify({ type: 'audio', data: blob.data }));
                  } catch { /* */ }
                };
                // Tap no mic para visualizacao (ramo separado do processamento)
                if (inputAnalyserRef.current) source.connect(inputAnalyserRef.current);
                source.connect(workletNode);
                workletNode.connect(audioCtx.destination);
                workletNodeRef.current = workletNode;
                // Start frame capture for screen/camera
                if (mode !== 'voice') {
                  frameIntervalRef.current = setInterval(captureAndSendFrame, 1000);
                }
              } else if (msg.text === 'interrupted') {
                setIsSpeaking(false);
                sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* */ } });
                sourcesRef.current.clear();
                if (outputAudioCtxRef.current) nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
              } else if (msg.text === 'turn_complete') {
                setTimeout(() => {
                  setIsSpeaking(false);
                  setSubtitleText(prev => {
                    if (prev.trim()) setMessages(msgs => [...msgs, { text: prev.trim(), from: 'eva' }]);
                    return '';
                  });
                }, 500);
              } else if (msg.text?.startsWith('error')) {
                setSessionStatus('error');
              }
              break;
            case 'text':
              if (msg.text) {
                if (msg.data === 'user') setMessages(msgs => [...msgs, { text: msg.text, from: 'user' }]);
                else setSubtitleText(msg.text);
              }
              break;
            case 'audio':
              if (msg.data) {
                setIsSpeaking(true);
                const ctx = outputAudioCtxRef.current;
                if (!ctx) return;
                if (ctx.state === 'suspended') await ctx.resume();
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                try {
                  const audioBuffer = await decodeAudioData(decode(msg.data), ctx, 24000, 1);
                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputNodeRef.current!);
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  sourcesRef.current.add(source);
                  source.onended = () => sourcesRef.current.delete(source);
                } catch { /* */ }
              }
              break;
            case 'speaker':
              setSpeakerInfo({
                name: msg.name || t('common.unknown'),
                confidence: msg.confidence || 0,
                emotion: msg.emotion || 'neutro',
                pitchHz: msg.pitch_hz || 0,
                energy: msg.energy || 0,
                stressLevel: msg.stress_level || 0,
                isNew: msg.is_new || false,
              });
              break;
            case 'tool_event':
              handleToolEvent(msg);
              toast.success(`Tool: ${msg.tool}`, { duration: 3000 });
              break;
            case 'ui_action':
              executeAction(msg);
              break;
          }
        } catch { /* */ }
      };

      ws.onclose = () => {
        if (activeRef.current) {
          cleanup();
          setSessionStatus('error');
          toast.warning(t('eva.disconnected'), {
            description: t('eva.disconnectedDesc'),
            duration: 6000,
          });
        }
      };
      ws.onerror = () => {
        setSessionStatus('error');
        toast.error(t('eva.connectionError'), {
          description: t('eva.connectionErrorDesc'),
          duration: 6000,
        });
      };

    } catch (err) {
      console.error('EvaPage: session start failed:', err);
      cleanup();
      setActiveMode(null);
      setSessionStatus('idle');
    }
  }, [cpf, cleanup, stopSession, captureAndSendFrame, t]);

  // Fetch capabilities after login
  useEffect(() => {
    if (!isAuthenticated) return;
    setCapLoading(true);
    fetch('/api/v1/self/memories?type=capability&limit=50')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.memories)) {
          setCapabilities(data.memories.map((m: { id: string; content: string }) => ({ id: m.id, content: m.content })));
        }
      })
      .catch(() => { /* silently ignore */ })
      .finally(() => setCapLoading(false));
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  // ── Capability ID formatter ──
  // cap_comunicacao → Comunicação, cap_web_realtime → Web Realtime
  const formatCapId = (id: string) =>
    id.replace(/^cap_/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // ── CPF Login ──
  const formatCpf = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  // Handle CPF submit — validate locally, check Google, show step
  const handleCpfSubmit = async () => {
    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) return;

    setIdosoData({ id: 0, nome: '' });

    // Try Google status check (EVA-Mind backend via nginx proxy)
    try {
      setGoogleLoading(true);
      const res = await fetch(`/api/v1/idosos/by-cpf/${rawCpf}/google-status`);
      if (res.ok) {
        const data = await res.json();
        setGoogleStatus(data);
        if (data.connected) {
          // Already connected — go to session
          setLoginStep('ready');
          setIsAuthenticated(true);
          setGoogleLoading(false);
          return;
        }
      }
    } catch { /* ignore — show Google step anyway */ }
    setGoogleLoading(false);

    // Show Google connection step
    setLoginStep('google');
  };

  // Open Google OAuth in popup
  const handleConnectGoogle = () => {
    const rawCpf = cpf.replace(/\D/g, '');
    const width = 500, height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `/api/v1/oauth/authorize?cpf=${rawCpf}`,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // If popup blocked, redirect in same tab
    if (!popup) {
      window.location.href = `/api/v1/oauth/authorize?cpf=${rawCpf}`;
      return;
    }

    // Poll for popup close, then re-check Google status
    const pollTimer = setInterval(async () => {
      if (popup.closed) {
        clearInterval(pollTimer);
        try {
          const res = await fetch(`/api/v1/idosos/by-cpf/${rawCpf}/google-status`);
          const status = await res.json();
          setGoogleStatus(status);
          if (status.connected) {
            toast.success(t('eva.googleConnected'));
            setLoginStep('ready');
            setIsAuthenticated(true);
          }
        } catch { /* ignore */ }
      }
    }, 1000);
  };

  // Detect ?google=success/error from OAuth callback redirect (in popup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleResult = params.get('google');
    if (googleResult) {
      window.history.replaceState({}, '', '/eva');
      if (window.opener) {
        // This is the popup — close it
        window.close();
      } else if (googleResult === 'success') {
        toast.success(t('eva.googleConnected'));
      } else if (googleResult === 'error') {
        const reason = params.get('reason') || '';
        toast.error(`${t('eva.googleError')}${reason ? ` (${reason})` : ''}`);
      }
    }
  }, [t]);

  // ── Login screens (CPF + Google) ──
  if (!isAuthenticated) {
    // Step 1: CPF entry
    if (loginStep === 'cpf') {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-7rem)]">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">EVA</h1>
              <p className="text-sm text-gray-500 mt-1">{t('eva.subtitle')}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('eva.cpfLabel')}</label>
              <input
                type="text"
                value={cpf}
                onChange={e => setCpf(formatCpf(e.target.value))}
                onKeyDown={e => { if (e.key === 'Enter') handleCpfSubmit(); }}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 text-lg text-center tracking-wider border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                autoFocus
              />
              <button
                onClick={handleCpfSubmit}
                disabled={cpf.replace(/\D/g, '').length !== 11}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('auth.login')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Google connection
    if (loginStep === 'google') {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-7rem)]">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">EVA</h1>
              {idosoData && <p className="text-sm text-gray-500 mt-1">{t('eva.welcome')}, {idosoData.nome}!</p>}
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {/* Google access required notice */}
              <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-5">
                <p className="text-sm text-amber-800 font-semibold">{t('eva.googleRequired')}</p>
                <p className="text-xs text-amber-600 mt-1.5 leading-relaxed">{t('eva.googleRequiredDesc')}</p>
              </div>

              {/* Google connect button */}
              <button
                onClick={handleConnectGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="font-medium text-gray-700">{t('eva.connectGoogle')}</span>
              </button>

              {/* Google status (if already connected) */}
              {googleStatus?.connected && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-700 font-medium">{googleStatus.email}</span>
                </div>
              )}

              {/* Skip Google */}
              <button
                onClick={() => { setLoginStep('ready'); setIsAuthenticated(true); }}
                className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              >
                {t('eva.skipGoogle')}
              </button>

              {/* Back to CPF */}
              <button
                onClick={() => { setLoginStep('cpf'); setIdosoData(null); setGoogleStatus(null); }}
                className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              >
                {t('common.back')}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // ── Page content ──
  const isActive = sessionStatus === 'active' || sessionStatus === 'connecting';
  const modeLabel = activeMode === 'voice' ? t('eva.audio') : activeMode === 'screen' ? t('eva.screen') : activeMode === 'camera' ? t('eva.camera') : '';
  const modeColor = activeMode === 'voice' ? 'emerald' : 'blue';

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Hidden video/canvas */}
      <video ref={videoRef} autoPlay playsInline muted className="absolute w-px h-px opacity-0 pointer-events-none" />
      <canvas ref={canvasRef} className="absolute w-px h-px opacity-0 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EVA</h1>
            <p className="text-xs text-gray-500">
              CPF: {cpf}
              {googleStatus?.connected && (
                <span className="ml-2 text-emerald-600">| {googleStatus.email}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-600">
                {sessionStatus === 'connecting' ? t('eva.connecting') : `${modeLabel} — ${isSpeaking ? t('eva.speaking') : t('eva.listening')}`}
              </span>
              <button onClick={stopSession} className="ml-1 text-gray-400 hover:text-red-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {sessionStatus === 'error' && (
            <span className="text-xs text-red-500 px-3 py-1.5 bg-red-50 rounded-lg">{t('common.error')} — <button onClick={stopSession} className="underline cursor-pointer">{t('common.back')}</button></span>
          )}
          <button
            onClick={() => { cleanup(); setIsAuthenticated(false); setCpf(''); setActiveMode(null); setSessionStatus('idle'); }}
            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speaker recognition badge */}
      {speakerInfo && isActive && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">
              {speakerInfo.name}{speakerInfo.isNew ? ` ${t('eva.newSpeaker')}` : ''}
            </span>
            {speakerInfo.confidence > 0 && (
              <span className="text-xs text-gray-400">
                {Math.round(speakerInfo.confidence * 100)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              speakerInfo.emotion === 'estresse' ? 'bg-red-100 text-red-700' :
              speakerInfo.emotion === 'tristeza' ? 'bg-blue-100 text-blue-700' :
              speakerInfo.emotion === 'energia' ? 'bg-yellow-100 text-yellow-700' :
              speakerInfo.emotion === 'calma' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {speakerInfo.emotion}
            </span>
            {speakerInfo.pitchHz > 0 && (
              <span className="text-xs text-gray-400">{Math.round(speakerInfo.pitchHz)} Hz</span>
            )}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden" title="Energia">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(speakerInfo.energy * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode switch bar — switch between voice/screen/camera mid-session */}
      {sessionStatus === 'active' && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-400 mr-2">Modo:</span>
          {([
            { mode: 'voice' as SessionMode, icon: Mic, label: 'Voz', color: 'emerald' },
            { mode: 'screen' as SessionMode, icon: Monitor, label: 'Tela', color: 'blue' },
            { mode: 'camera' as SessionMode, icon: Camera, label: 'Câmera', color: 'indigo' },
          ]).map(({ mode, icon: Icon, label, color }) => (
            <button
              key={mode}
              onClick={() => switchMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeMode === mode
                  ? `bg-${color}-100 text-${color}-700 ring-1 ring-${color}-300`
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Waveform bar — visivel sempre que a sessao esta activa */}
      {(sessionStatus === 'active' || sessionStatus === 'connecting') && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <canvas
            ref={waveCanvasRef}
            style={{ width: '100%', height: '52px', display: 'block' }}
            className="rounded-xl bg-gray-50"
          />
          <p className="text-center text-xs mt-1.5" style={{ color: isSpeaking ? '#10b981' : '#9ca3af' }}>
            {sessionStatus === 'connecting' ? t('eva.connecting') : isSpeaking ? t('eva.evaSpeaking') : t('eva.listening')}
          </p>
        </div>
      )}

      {/* Quick Actions sidebar (when session active) */}
      {isActive && <EvaQuickActions onAction={sendTextMessage} />}

      {/* SOS button (when session active) */}
      {isActive && <EvaSOS onSOS={() => sendTextMessage('emergência')} />}

      {/* Buttons + Messages area */}
      <div className="flex-1 overflow-y-auto py-6">

        {/* Mode selection (when no session active) */}
        {!isActive && sessionStatus !== 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-4">

            {/* ── Capabilities panel ── */}
            <div className="w-full max-w-2xl px-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Panel header */}
                <button
                  onClick={() => setShowCaps(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-800">
                      {capLoading
                        ? t('eva.resourcesLoading')
                        : `${capabilities.length || 33} ${t('eva.resources')}`}
                    </span>
                  </div>
                  {showCaps
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {/* Panel body */}
                {showCaps && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 max-h-64 overflow-y-auto">
                    {capLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {capabilities.map((cap, i) => (
                          <div
                            key={cap.id}
                            className="flex flex-col gap-0.5 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100"
                            title={cap.content}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-xs font-semibold text-gray-800 truncate">
                                {formatCapId(cap.id)}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-tight line-clamp-2 pl-5">
                              {cap.content.split('.')[0].slice(0, 70)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mode buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg w-full px-4">
              {/* Audio */}
              <button
                onClick={() => startSession('voice')}
                className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-emerald-400 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">{t('eva.audio')}</h3>
                  <p className="text-xs text-gray-500 mt-1">{t('eva.voiceDesc')}</p>
                </div>
              </button>

              {/* Video */}
              {!showVideoOptions ? (
                <button
                  onClick={() => setShowVideoOptions(true)}
                  className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-400 hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Monitor className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">Video</h3>
                    <p className="text-xs text-gray-500 mt-1">{t('eva.videoDesc')}</p>
                  </div>
                </button>
              ) : (
                <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-lg border-2 border-blue-200">
                  <p className="text-xs text-gray-500 text-center font-medium">{t('eva.chooseMode')}</p>
                  <button
                    onClick={() => startSession('screen')}
                    className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Monitor className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{t('eva.screen')}</p>
                      <p className="text-xs text-gray-500">{t('eva.shareScreen')}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => startSession('camera')}
                    className="flex items-center gap-3 px-4 py-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-indigo-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{t('eva.camera')}</p>
                      <p className="text-xs text-gray-500">{t('eva.liveCamera')}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowVideoOptions(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1 cursor-pointer"
                  >
                    {t('common.back')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service dashboard cards — always visible during session */}
        {isActive && (
          <div className="px-2 py-3">
            <div className="grid grid-cols-4 gap-2">
              {SERVICE_CARDS.map(card => {
                const colors = COLOR_MAP[card.color] || COLOR_MAP.blue;
                const Icon = card.icon;
                const count = toolEvents.filter(ev => (card.tools as readonly string[]).includes(ev.tool)).length;
                const hasData = count > 0;
                return (
                  <div
                    key={card.id}
                    className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl border transition-all ${
                      hasData
                        ? `${colors.activeBg} ${colors.border} shadow-sm`
                        : `bg-gray-50 border-gray-200 opacity-60`
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${hasData ? colors.icon : 'text-gray-400'}`} />
                    <span className={`text-[10px] font-semibold ${hasData ? colors.text : 'text-gray-500'}`}>{card.label}</span>
                    {hasData && (
                      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${
                        card.color === 'red' ? 'bg-red-500' :
                        card.color === 'blue' ? 'bg-blue-500' :
                        card.color === 'green' ? 'bg-green-500' :
                        card.color === 'indigo' ? 'bg-indigo-500' :
                        card.color === 'emerald' ? 'bg-emerald-500' :
                        card.color === 'purple' ? 'bg-purple-500' :
                        'bg-amber-500'
                      }`}>
                        {count}
                      </span>
                    )}
                    {!hasData && (
                      <span className="text-[9px] text-gray-400">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transcription messages + Tool cards (when session active) */}
        {isActive && (
          <div className="space-y-3 px-2">
            {messages.length === 0 && !subtitleText && toolEvents.length === 0 && sessionStatus === 'active' && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">{t('eva.startTalking')}</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'rounded-br-sm bg-emerald-600 text-white'
                    : 'rounded-bl-sm bg-white text-gray-800 border border-gray-100 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Tool event cards — rendered inline in the conversation */}
            {toolEvents.map(ev => (
              <div key={ev.id} className="flex justify-start">
                <EvaToolCard event={ev} />
              </div>
            ))}

            {subtitleText && (
              <div className="flex justify-start">
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl rounded-bl-sm text-sm leading-relaxed ${
                  activeMode === 'voice' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-blue-50 text-blue-900 border border-blue-100'
                }`}>
                  {subtitleText}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1 align-middle" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Persistent players (music / timer) — bottom bar */}
      {activeMusic && isActive && (
        <MusicPlayer event={activeMusic} onClose={() => dismissEvent(activeMusic.id)} />
      )}
      {activeTimer && isActive && (
        <TimerPlayer event={activeTimer} onClose={() => dismissEvent(activeTimer.id)} />
      )}

      {/* Text input bar (when session active) */}
      {isActive && (
        <EvaTextInput
          onSend={sendTextMessage}
          disabled={sessionStatus !== 'active'}
          placeholder={t('eva.startTalking')}
        />
      )}
    </div>
  );
}
