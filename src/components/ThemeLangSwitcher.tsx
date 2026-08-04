"use client";

import { Moon, Sun, Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { useI18n, languageMeta, Language } from '@/lib/i18n';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LANG_ORDER: Language[] = ['en', 'hi', 'es', 'zh', 'fr', 'de'];

export function ThemeLangSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const current = languageMeta[lang];

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex items-center gap-0.5">
        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg hover:bg-secondary"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4 text-muted-foreground" />
                : <Moon className="h-4 w-4 text-muted-foreground" />
              }
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {theme === 'dark' ? t('lightMode') : t('darkMode')}
          </TooltipContent>
        </Tooltip>

        {/* Language picker */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 rounded-lg gap-1 text-xs font-medium hover:bg-secondary"
                  aria-label={`${t('language')}: ${current.native}`}
                >
                  <span className="text-sm leading-none" aria-hidden>{current.flag}</span>
                  <span className="text-muted-foreground">{current.label}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{t('language')}</TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="min-w-[190px] rounded-xl">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal pb-1">
              {t('language')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LANG_ORDER.map((code) => {
              const meta = languageMeta[code];
              const selected = code === lang;
              return (
                <DropdownMenuItem
                  key={code}
                  onSelect={() => setLang(code)}
                  className="cursor-pointer text-sm gap-2.5 rounded-lg"
                >
                  <span aria-hidden className="text-base leading-none">{meta.flag}</span>
                  <span className="flex-1 font-medium">{meta.native}</span>
                  <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                  {selected && <Check className="h-3.5 w-3.5 text-primary ml-1" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
