import { useRef, useEffect, useMemo, memo } from 'react';
import { Mic, Monitor, Camera, User, Mail, Calendar, PlayCircle, HardDrive, Search, MapPin, MessageSquare, Bell } from 'lucide-react';
import { EvaTextInput } from './EvaTextInput';
import { EvaToolCard } from './EvaToolCard';
import { EvaQuickActions } from './EvaQuickActions';
import { EvaSOS } from './EvaSOS';
import { MusicPlayer } from './players/MusicPlayer';
import { TimerPlayer } from './players/TimerPlayer';
import type { SessionMode, SessionStatus, ChatMessage, SpeakerInfo } from '../../types/eva-session';
import type { ToolEvent } from '../../types/eva-tools';

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
  messages, subtitleText, speakerInfo, activeMode, isSpeaking, sessionStatus,
  toolEvents, activeMusic, activeTimer,
  waveCanvasRef, onSendText, onDismissEvent, onSwitchMode, t,
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

  // Memoize service card counts — avoid 8x .filter() on every re-render
  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const card of SERVICE_CARDS) {
      counts[card.id] = toolEvents.filter(ev => (card.tools as readonly string[]).includes(ev.tool)).length;
    }
    return counts;
  }, [toolEvents]);

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
