import { useRef, useEffect, memo } from 'react';
import { EvaTextInput } from './EvaTextInput';
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
  onSendText: (text: string) => void;
  onDismissEvent: (id: string) => void;
  onSwitchMode: (mode: SessionMode) => void;
  t: (key: string) => string;
}

export const EvaSessionView = memo(function EvaSessionView({
  messages, subtitleText, speakerInfo: _speakerInfo, activeMode: _activeMode, isSpeaking, sessionStatus,
  toolEvents: _toolEvents, activeMusic: _activeMusic, activeTimer: _activeTimer,
  waveCanvasRef, onSendText, onDismissEvent: _onDismissEvent, onSwitchMode: _onSwitchMode, t,
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

  // === MODO DIAGNÓSTICO: só o básico para isolar problema de áudio ===
  // TODO: reativar componentes após confirmar que corte é do backend
  return (
    <>
      {/* Waveform bar — leve (2D canvas) */}
      {isActive && (
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

      {/* Content area — só subtitle e mensagens, sem cards/tools/speaker */}
      <div className="flex-1 overflow-y-auto py-6">
        {isActive && (
          <div className="space-y-3 px-2">
            {messages.length === 0 && !subtitleText && sessionStatus === 'active' && (
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

            {subtitleText && (
              <div className="flex justify-start">
                <div className="max-w-[75%] px-4 py-2 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-emerald-50 text-emerald-900 border border-emerald-100" aria-live="polite">
                  {subtitleText}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Text input bar */}
      {isActive && (
        <EvaTextInput
          onSend={onSendText}
          disabled={sessionStatus !== 'active'}
          placeholder={t('eva.startTalking')}
        />
      )}
    </>
  );
});
