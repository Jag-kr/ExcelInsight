"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeContext, ThemeMode } from '@/lib/theme';
import { I18nContext, Language, translations, TranslationKey } from '@/lib/i18n';
import { ChartPaletteContext, ChartPaletteId, CHART_PALETTES } from '@/lib/chart-themes';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // Always start from the same value on server and client so the first client
  // render matches the SSR output exactly; the persisted preference is applied
  // right after mount instead, in an effect (client-only, runs post-hydration).
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [lang, setLangState] = useState<Language>('en');
  const [chartPaletteId, setChartPaletteIdState] = useState<ChartPaletteId>('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem('datalens-theme') as ThemeMode | null;
    if (storedTheme) setThemeState(storedTheme);
    const storedLang = localStorage.getItem('datalens-lang') as Language | null;
    if (storedLang) setLangState(storedLang);
    const storedPalette = localStorage.getItem('excelinsight-chart-theme') as ChartPaletteId | null;
    if (storedPalette && CHART_PALETTES.some(p => p.id === storedPalette)) setChartPaletteIdState(storedPalette);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('datalens-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (chartPaletteId === 'default') {
      document.documentElement.removeAttribute('data-chart-theme');
    } else {
      document.documentElement.setAttribute('data-chart-theme', chartPaletteId);
    }
    localStorage.setItem('excelinsight-chart-theme', chartPaletteId);
  }, [chartPaletteId]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState(prev => prev === 'dark' ? 'light' : 'dark'), []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('datalens-lang', l);
  }, []);

  const setChartPaletteId = useCallback((id: ChartPaletteId) => setChartPaletteIdState(id), []);

  const t = useCallback((key: TranslationKey) => translations[lang][key], [lang]);

  const themeCtx = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  const i18nCtx = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  const chartPaletteCtx = useMemo(() => ({ paletteId: chartPaletteId, setPaletteId: setChartPaletteId }), [chartPaletteId, setChartPaletteId]);

  return (
    <ThemeContext.Provider value={themeCtx}>
      <I18nContext.Provider value={i18nCtx}>
        <ChartPaletteContext.Provider value={chartPaletteCtx}>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              {children}
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </QueryClientProvider>
        </ChartPaletteContext.Provider>
      </I18nContext.Provider>
    </ThemeContext.Provider>
  );
}
