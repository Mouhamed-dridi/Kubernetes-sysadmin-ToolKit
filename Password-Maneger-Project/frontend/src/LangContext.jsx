import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './i18n/en.json';
import fr from './i18n/fr.json';
import ar from './i18n/ar.json';

const LANG_KEY = 'pw_manager_lang';
const TRANSLATIONS = { en, fr, ar };

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const saved = localStorage.getItem(LANG_KEY) || 'en';
  const [lang, setLang] = useState(saved);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  const t = useCallback((key, vars = {}) => {
    const translations = TRANSLATIONS[lang] || en;
    let text = translations[key] || key;
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return text;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
