import { useRef, useEffect, memo } from 'react';
import { Mic, Monitor, Camera, User } from 'lucide-react';
import { EvaToolCard } from './EvaToolCard';
import { MusicPlayer } from './players/MusicPlayer';
import { TimerPlayer } from './players/TimerPlayer';
import type { SessionMode, SessionStatus, ChatMessage, SpeakerInfo } from '../../types/eva-session';
import type { ToolEvent } from '../../types/eva-tools';

interface EvaSessionViewProps {
  messages: ChatMessage[];
  subtitleText: string;
  speakerInfo: SpeakerInfo | null;
  activeMode: SessionMode | null;
  isSpeaking: boolean;
  sessionStatus: SessionStatus;
  toolEvents: ToolEvent[];
  activeMusic: ToolEvent | null;
  activeTimer: ToolEvent | null;
  waveCanvasRef: React.RefObject<HTMLCanvasElement>;
  onDismissEvent: (id: string) => void;
  onSwitchMode: (mode: SessionMode) => void;
  t: (key: string) => string;
}

export const EvaSessionView = memo(function EvaSessionView({
  messages, subtitleText, activeMode, isSpeaking, sessionStatus,
  toolEvents, activeMusic, activeTimer,
  waveCanvasRef, onDismissEvent, onSwitchMode, t, speakerInfo,
}: EvaSessionViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollThrottleRef = useRef(false);

  // Throttled scroll — max 1x per 200ms to avoid layout thrashing during rapid audio/text
  useEffect(() => {
    if (scrollThrottleRef.current) return;
    scrollThrottleRef.current = true;
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => { scrollThrottleRef.current = false; }, 200);
    });
  }, [messages, subtitleText]);

  const isActive = sessionStatus === 'active' || sessionStatus === 'connecting';

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Speaker recognition badge */}
      {speakerInfo && isActive && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
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

      {/* Mode switch bar */}
      {sessionStatus === 'active' && (
        <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-400 mr-2">Modo:</span>
          {([
            { mode: 'voice' as SessionMode, icon: Mic, label: 'Voz', active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' },
            { mode: 'screen' as SessionMode, icon: Monitor, label: 'Tela', active: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' },
            { mode: 'camera' as SessionMode, icon: Camera, label: 'Câmera', active: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300' },
          ]).map(({ mode, icon: Icon, label, active }) => (
            <button
              key={mode}
              onClick={() => onSwitchMode(mode)}
              aria-label={`Modo ${label}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeMode === mode
                  ? active
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Waveform bar */}
      {isActive && (
        <div className="shrink-0 px-4 pt-3 pb-2 border-b border-gray-100">
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

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-y-auto py-4">
        {/* Transcription messages + Tool cards */}
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

            {toolEvents.map(ev => (
              <div key={ev.id} className="flex justify-start">
                <EvaToolCard event={ev} />
              </div>
            ))}

            {subtitleText && (
              <div className="flex justify-start">
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl rounded-bl-sm text-sm leading-relaxed ${
                  activeMode === 'voice' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-blue-50 text-blue-900 border border-blue-100'
                }`} aria-live="polite">
                  {subtitleText}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1 align-middle" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Persistent players */}
      {activeMusic && isActive && (
        <div className="shrink-0">
          <MusicPlayer event={activeMusic} onClose={() => onDismissEvent(activeMusic.id)} isSpeaking={isSpeaking} />
        </div>
      )}
      {activeTimer && isActive && (
        <div className="shrink-0">
          <TimerPlayer event={activeTimer} onClose={() => onDismissEvent(activeTimer.id)} />
        </div>
      )}
    </div>
  );
});
