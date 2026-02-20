import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('eva-language') as Language;
    if (saved && ['pt', 'en', 'fr', 'de', 'es'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('eva-language', lang);
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    if (typeof value === 'string') return value;
    // Fallback to Portuguese
    let fallback: unknown = translations['pt'];
    for (const k of keys) {
      if (fallback && typeof fallback === 'object') {
        fallback = (fallback as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof fallback === 'string' ? fallback : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
