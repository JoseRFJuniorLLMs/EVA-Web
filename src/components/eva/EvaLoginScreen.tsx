import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import type { GoogleStatus, IdosoData } from '../../types/eva-session';

interface EvaLoginScreenProps {
  onAuthenticated: (cpf: string, googleStatus: GoogleStatus | null) => void;
}

export function EvaLoginScreen({ onAuthenticated }: EvaLoginScreenProps) {
  const { t } = useLanguage();
  const [cpf, setCpf] = useState('');
  const [loginStep, setLoginStep] = useState<'cpf' | 'google' | 'ready'>('cpf');
  const [idosoData, setIdosoData] = useState<IdosoData | null>(null);
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const formatCpf = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const handleCpfSubmit = async () => {
    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) return;

    // Google OAuth disabled temporarily (requires HTTPS with valid cert + real domain)
    // TODO: Re-enable when domain + Let's Encrypt is configured
    onAuthenticated(cpf, null);
  };

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

    if (!popup) {
      window.location.href = `/api/v1/oauth/authorize?cpf=${rawCpf}`;
      return;
    }

    const pollTimer = setInterval(async () => {
      if (popup.closed) {
        clearInterval(pollTimer);
        try {
          const res = await fetch(`/api/v1/idosos/by-cpf/${rawCpf}/google-status`);
          const status = await res.json();
          setGoogleStatus(status);
          if (status.connected) {
            toast.success(t('eva.googleConnected'));
            onAuthenticated(cpf, status);
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
        window.close();
      } else if (googleResult === 'success') {
        toast.success(t('eva.googleConnected'));
      } else if (googleResult === 'error') {
        const reason = params.get('reason') || '';
        toast.error(`${t('eva.googleError')}${reason ? ` (${reason})` : ''}`);
      }
    }
  }, [t]);

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
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-5">
            <p className="text-sm text-amber-800 font-semibold">{t('eva.googleRequired')}</p>
            <p className="text-xs text-amber-600 mt-1.5 leading-relaxed">{t('eva.googleRequiredDesc')}</p>
          </div>

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

          {googleStatus?.connected && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-700 font-medium">{googleStatus.email}</span>
            </div>
          )}

          <button
            onClick={() => onAuthenticated(cpf, googleStatus)}
            className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            {t('eva.skipGoogle')}
          </button>

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
