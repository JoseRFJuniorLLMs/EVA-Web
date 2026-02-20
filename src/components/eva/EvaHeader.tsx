import { Sparkles, LogOut, X } from 'lucide-react';
import type { SessionMode, SessionStatus, GoogleStatus } from '../../types/eva-session';

interface EvaHeaderProps {
  cpf: string;
  googleStatus: GoogleStatus | null;
  sessionStatus: SessionStatus;
  activeMode: SessionMode | null;
  isSpeaking: boolean;
  onStop: () => void;
  onLogout: () => void;
  t: (key: string) => string;
}

export function EvaHeader({ cpf, googleStatus, sessionStatus, activeMode, isSpeaking, onStop, onLogout, t }: EvaHeaderProps) {
  const isActive = sessionStatus === 'active' || sessionStatus === 'connecting';
  const modeLabel = activeMode === 'voice' ? t('eva.audio') : activeMode === 'screen' ? t('eva.screen') : activeMode === 'camera' ? t('eva.camera') : '';

  return (
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg" role="status">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs text-gray-600">
              {sessionStatus === 'connecting' ? t('eva.connecting') : `${modeLabel} — ${isSpeaking ? t('eva.speaking') : t('eva.listening')}`}
            </span>
            <button onClick={onStop} className="ml-1 text-gray-400 hover:text-red-500 cursor-pointer" aria-label={t('common.stop') || 'Parar sessão'}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {sessionStatus === 'error' && (
          <span className="text-xs text-red-500 px-3 py-1.5 bg-red-50 rounded-lg">
            {t('common.error')} — <button onClick={onStop} className="underline cursor-pointer">{t('common.back')}</button>
          </span>
        )}
        <button
          onClick={onLogout}
          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
