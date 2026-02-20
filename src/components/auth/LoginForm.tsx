import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, User, UserPlus, Brain } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useLanguage();
  const { login, register, error, loading, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setLocalError(t('auth.nameRequired'));
        return;
      }
      if (password.length < 6) {
        setLocalError(t('auth.passwordMinChars'));
        return;
      }
      if (password !== confirmPassword) {
        setLocalError(t('auth.passwordsMismatch'));
        return;
      }
      try {
        await register(email, password, name);
        onSuccess?.();
      } catch (err) {
        // Error is handled by context
      }
      return;
    }

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      // Error is handled by context
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
    setLocalError(null);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">{t('auth.loginTitle')}</h1>
          <p className="text-emerald-200 mt-2">{t('auth.loginSubtitle')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {mode === 'login' && t('auth.login')}
            {mode === 'register' && t('auth.createAccount')}
          </h2>

          {displayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome - só no registro */}
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? t('auth.passwordMinCharsHint') : t('auth.passwordPlaceholder')}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha - só no registro */}
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.repeatPasswordPlaceholder')}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' && <LogIn className="w-5 h-5" />}
                  {mode === 'register' && <UserPlus className="w-5 h-5" />}
                  {mode === 'login' && t('auth.login')}
                  {mode === 'register' && t('auth.createAccount')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            {mode === 'login' && (
              <p className="text-gray-600 text-sm">
                {t('auth.noAccount')}{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {t('auth.createAccountLink')}
                </button>
              </p>
            )}

            {mode === 'register' && (
              <p className="text-gray-600 text-sm">
                {t('auth.hasAccount')}{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {t('auth.login')}
                </button>
              </p>
            )}
          </div>

          {/* Demo credentials hint — dev only */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                {t('auth.testCredentials')}{' '}
                <span className="font-mono">{import.meta.env.VITE_DEMO_EMAIL || 'admin@malaria.ao'}</span> /{' '}
                <span className="font-mono">{import.meta.env.VITE_DEMO_PASSWORD || '123456'}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-emerald-200 text-sm mt-6">
          {`${t('auth.loginTitle')} — ${t('auth.loginSubtitle')}`}
        </p>
      </div>
    </div>
  );
}
