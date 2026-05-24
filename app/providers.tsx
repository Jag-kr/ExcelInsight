"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeContext, ThemeMode } from '@/lib/theme';
import { I18nContext, Language, translations, TranslationKey } from '@/lib/i18n';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('datalens-theme') as ThemeMode) || 'dark';
    }
    return 'dark';
  });

  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('datalens-lang') as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('datalens-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState(prev => prev === 'dark' ? 'light' : 'dark'), []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('datalens-lang', l);
  }, []);

  const t = useCallback((key: TranslationKey) => translations[lang][key], [lang]);

  const themeCtx = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  const i18nCtx = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <ThemeContext.Provider value={themeCtx}>
      <I18nContext.Provider value={i18nCtx}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </QueryClientProvider>
      </I18nContext.Provider>
    </ThemeContext.Provider>
  );
}
