import { useRef, useEffect } from 'react';
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

export function EvaSessionView({
  messages, subtitleText, speakerInfo, activeMode, isSpeaking, sessionStatus,
  toolEvents, activeMusic, activeTimer,
  waveCanvasRef, onSendText, onDismissEvent, onSwitchMode, t,
}: EvaSessionViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, subtitleText]);

  const isActive = sessionStatus === 'active' || sessionStatus === 'connecting';

  return (
    <>
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

      {/* Mode switch bar */}
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
              onClick={() => onSwitchMode(mode)}
              aria-label={`Modo ${label}`}
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

      {/* Waveform bar */}
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

      {/* Quick Actions + SOS */}
      {isActive && <EvaQuickActions onAction={onSendText} />}
      {isActive && <EvaSOS onSOS={() => onSendText('emergência')} />}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto py-6">
        {/* Service dashboard cards */}
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
                        : 'bg-gray-50 border-gray-200 opacity-60'
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
        <MusicPlayer event={activeMusic} onClose={() => onDismissEvent(activeMusic.id)} />
      )}
      {activeTimer && isActive && (
        <TimerPlayer event={activeTimer} onClose={() => onDismissEvent(activeTimer.id)} />
      )}

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
}
