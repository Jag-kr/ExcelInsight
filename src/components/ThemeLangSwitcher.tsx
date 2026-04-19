import { Moon, Sun, Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { useI18n, languageMeta, Language } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANG_ORDER: Language[] = ['en', 'hi', 'es', 'zh', 'fr', 'de'];

export function ThemeLangSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const current = languageMeta[lang];

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleTheme}
        title={theme === 'dark' ? t('lightMode') : t('darkMode')}
        aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs gap-1.5"
            title={t('language')}
            aria-label={`${t('language')}: ${current.native}`}
          >
            <Languages className="h-3.5 w-3.5" />
            <span aria-hidden>{current.flag}</span>
            <span className="font-medium">{current.native}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
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
                className="cursor-pointer text-sm gap-2"
              >
                <span aria-hidden className="text-base leading-none">{meta.flag}</span>
                <span className="flex-1">{meta.native}</span>
                <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                {selected && <Check className="h-3.5 w-3.5 text-primary ml-1" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
