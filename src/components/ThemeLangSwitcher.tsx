import { Moon, Sun, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';

export function ThemeLangSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleTheme}
        title={theme === 'dark' ? t('lightMode') : t('darkMode')}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs gap-1"
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        title={t('language')}
      >
        <Globe className="h-3.5 w-3.5" />
        {lang === 'en' ? 'हिं' : 'EN'}
      </Button>
    </div>
  );
}
