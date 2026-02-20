import { useState, useEffect } from 'react';
import { Mic, Monitor, Camera, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import type { SessionMode } from '../../types/eva-session';

interface EvaIdleViewProps {
  isAuthenticated: boolean;
  showVideoOptions: boolean;
  onStartSession: (mode: SessionMode) => void;
  onSetShowVideoOptions: (v: boolean) => void;
  t: (key: string) => string;
}

const formatCapId = (id: string) =>
  id.replace(/^cap_/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export function EvaIdleView({ isAuthenticated, showVideoOptions, onStartSession, onSetShowVideoOptions, t }: EvaIdleViewProps) {
  const [capabilities, setCapabilities] = useState<{ id: string; content: string }[]>([]);
  const [capLoading, setCapLoading] = useState(false);
  const [showCaps, setShowCaps] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    setCapLoading(true);
    fetch('/api/v1/self/memories?type=capability&limit=50', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.memories)) {
          setCapabilities(data.memories.map((m: { id: string; content: string }) => ({ id: m.id, content: m.content })));
        }
      })
      .catch(() => { /* silently ignore */ })
      .finally(() => setCapLoading(false));
    return () => controller.abort();
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-4">
      {/* Capabilities panel */}
      <div className="w-full max-w-2xl px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
          onClick={() => onStartSession('voice')}
          className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-emerald-400 hover:shadow-xl transition-all group cursor-pointer"
          aria-label={t('eva.audio')}
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
            onClick={() => onSetShowVideoOptions(true)}
            className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-400 hover:shadow-xl transition-all group cursor-pointer"
            aria-label="Video"
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
              onClick={() => onStartSession('screen')}
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
              aria-label={t('eva.screen')}
            >
              <Monitor className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{t('eva.screen')}</p>
                <p className="text-xs text-gray-500">{t('eva.shareScreen')}</p>
              </div>
            </button>
            <button
              onClick={() => onStartSession('camera')}
              className="flex items-center gap-3 px-4 py-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
              aria-label={t('eva.camera')}
            >
              <Camera className="w-6 h-6 text-indigo-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{t('eva.camera')}</p>
                <p className="text-xs text-gray-500">{t('eva.liveCamera')}</p>
              </div>
            </button>
            <button
              onClick={() => onSetShowVideoOptions(false)}
              className="text-xs text-gray-400 hover:text-gray-600 mt-1 cursor-pointer"
            >
              {t('common.back')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
