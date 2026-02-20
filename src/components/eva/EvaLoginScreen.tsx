import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { GoogleStatus } from '../../types/eva-session';

interface EvaLoginScreenProps {
  onAuthenticated: (cpf: string, googleStatus: GoogleStatus | null) => void;
}

export function EvaLoginScreen({ onAuthenticated }: EvaLoginScreenProps) {
  const { t } = useLanguage();
  const [cpf, setCpf] = useState('');

  const formatCpf = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const handleCpfSubmit = () => {
    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) return;

    // Google OAuth disabled temporarily (requires HTTPS with valid cert + real domain)
    // TODO: Re-enable when domain + Let's Encrypt is configured
    onAuthenticated(cpf, null);
  };

  // Google OAuth step removed temporarily — CPF goes directly to session
  // See git history for full Google OAuth flow (handleConnectGoogle, useEffect callback detection, Step 2 UI)

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
