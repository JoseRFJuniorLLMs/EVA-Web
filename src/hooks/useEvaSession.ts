import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useToolEvents } from './useToolEvents';
import { useUiActions } from './useUiActions';
import { useAudioEngine } from './useAudioEngine';
import { useVideoCapture } from './useVideoCapture';
import type { SessionMode, SessionStatus, ChatMessage, SpeakerInfo } from '../types/eva-session';

const MAX_MESSAGES = 500;
const MAX_RECONNECT = 5;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

function getWsUrl(): string {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws/browser`;
}

function playConnectedBeep() {
  try {
    const ctx = new AudioContext();
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
    osc2.onended = () => ctx.close();
  } catch { /* audio not available */ }
}

export function useEvaSession(cpf: string, t: (key: string) => string) {
  const [activeMode, setActiveMode] = useState<SessionMode | null>(null);
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [subtitleText, setSubtitleText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [speakerInfo, setSpeakerInfo] = useState<SpeakerInfo | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const activeRef = useRef(false);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audioEngine = useAudioEngine();
  const videoCapture = useVideoCapture();
  const { toolEvents, activeMusic, activeTimer, emergencyActive, setEmergencyActive, handleToolEvent, clearEvents, dismissEvent } = useToolEvents();

  // sendFrame helper: sends a video frame via WebSocket
  const sendFrame = useCallback((base64: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'video', data: base64 }));
    }
  }, []);

  // switchMode mid-session
  const switchMode = useCallback(async (newMode: SessionMode) => {
    if (newMode === activeMode) return;
    const ok = await videoCapture.switchVideoMode(newMode, sendFrame, () => switchMode('voice'));
    if (!ok && newMode !== 'voice') return;
    setActiveMode(newMode);
    toast.info(`Modo: ${newMode === 'voice' ? 'Voz' : newMode === 'screen' ? 'Tela' : 'Câmera'}`);
  }, [activeMode, videoCapture, sendFrame]);

  const { executeAction } = useUiActions({ onSwitchMode: switchMode });

  // cleanup all resources
  const cleanup = useCallback(() => {
    activeRef.current = false;
    if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
    audioEngine.cleanupAudio();
    videoCapture.stopVideoCapture();
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
  }, [audioEngine, videoCapture]);

  const stopSession = useCallback(() => {
    cleanup();
    reconnectCountRef.current = 0;
    setActiveMode(null);
    setSessionStatus('idle');
    setSubtitleText('');
    setMessages([]);
    setSpeakerInfo(null);
    clearEvents();
  }, [cleanup, clearEvents]);

  const sendTextMessage = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'text', text, data: 'user_typed' }));
    setMessages(msgs => {
      const next = [...msgs, { text, from: 'user' as const }];
      return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
    });
  }, []);

  const startSession = useCallback(async (mode: SessionMode) => {
    setActiveMode(mode);
    setSessionStatus('connecting');
    setShowVideoOptions(false);
    setMessages([]);
    setSubtitleText('');
    reconnectCountRef.current = 0;

    try {
      const micStream = await audioEngine.initAudio();

      // Video
      if (mode === 'screen' || mode === 'camera') {
        const ok = await videoCapture.startVideoCapture(
          mode,
          sendFrame,
          mode === 'screen' ? () => stopSession() : undefined
        );
        if (!ok) {
          audioEngine.cleanupAudio();
          setActiveMode(null);
          setSessionStatus('idle');
          return;
        }
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
                reconnectCountRef.current = 0;
                setSessionStatus('active');
                playConnectedBeep();
                audioEngine.setupMicCapture(micStream, (blob) => {
                  if (!activeRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
                  wsRef.current.send(JSON.stringify({ type: 'audio', data: blob.data }));
                });
                if (mode !== 'voice') {
                  videoCapture.startFrameCapture(sendFrame);
                }
              } else if (msg.text === 'interrupted') {
                audioEngine.handleInterrupted();
              } else if (msg.text === 'turn_complete') {
                setTimeout(() => {
                  audioEngine.setIsSpeaking(false);
                  setSubtitleText(prev => {
                    if (prev.trim()) {
                      setMessages(msgs => {
                        const next = [...msgs, { text: prev.trim(), from: 'eva' as const }];
                        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
                      });
                    }
                    return '';
                  });
                }, 500);
              } else if (msg.text?.startsWith('error')) {
                setSessionStatus('error');
              }
              break;
            case 'text':
              if (msg.text) {
                if (msg.data === 'user') {
                  setMessages(msgs => {
                    const next = [...msgs, { text: msg.text, from: 'user' as const }];
                    return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
                  });
                } else {
                  setSubtitleText(msg.text);
                }
              }
              break;
            case 'audio':
              if (msg.data) await audioEngine.playAudioChunk(msg.data);
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
        } catch { /* ignore parse errors */ }
      };

      ws.onclose = () => {
        if (activeRef.current) {
          // Attempt reconnect with exponential backoff
          if (reconnectCountRef.current < MAX_RECONNECT) {
            const delay = RECONNECT_DELAYS[reconnectCountRef.current] || 16000;
            reconnectCountRef.current++;
            setSessionStatus('connecting');
            toast.warning(t('eva.disconnected'), {
              description: `Reconectando em ${delay / 1000}s...`,
              duration: delay,
            });
            reconnectTimerRef.current = setTimeout(() => {
              cleanup();
              startSession(mode);
            }, delay);
          } else {
            cleanup();
            setSessionStatus('error');
            toast.warning(t('eva.disconnected'), {
              description: t('eva.disconnectedDesc'),
              duration: 6000,
            });
          }
        }
      };

      ws.onerror = (event) => {
        console.error('EvaSession: WebSocket error:', event);
        // onclose will fire after onerror, reconnect logic is there
      };

    } catch (err) {
      console.error('EvaSession: start failed:', err);
      cleanup();
      setActiveMode(null);
      setSessionStatus('idle');
    }
  }, [cpf, audioEngine, videoCapture, sendFrame, stopSession, cleanup, handleToolEvent, executeAction, t]);

  // Cleanup on unmount only (ref avoids re-running on every render)
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => cleanupRef.current(), []);

  return {
    // State
    activeMode,
    showVideoOptions,
    sessionStatus,
    subtitleText,
    messages,
    speakerInfo,
    isSpeaking: audioEngine.isSpeaking,

    // Refs for component binding
    waveCanvasRef: audioEngine.waveCanvasRef,
    videoRef: videoCapture.videoRef,
    canvasRef: videoCapture.canvasRef,

    // Tool events pass-through
    toolEvents,
    activeMusic,
    activeTimer,
    emergencyActive,
    setEmergencyActive,
    dismissEvent,

    // Actions
    startSession,
    stopSession,
    sendTextMessage,
    switchMode,
    setShowVideoOptions,
  };
}
