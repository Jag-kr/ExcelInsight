"use client";

import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useChartPalette, CHART_PALETTES } from '@/lib/chart-themes';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ChartThemeSwitcher() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { paletteId, setPaletteId } = useChartPalette();
  const current = CHART_PALETTES.find((p) => p.id === paletteId) ?? CHART_PALETTES[0];

  return (
    <TooltipProvider delayDuration={400}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 gap-1.5 rounded-lg text-xs font-medium"
                aria-label={`${t('chartTheme')}: ${t(current.labelKey)}`}
              >
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">{t(current.labelKey)}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{t('chartTheme')}</TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="min-w-[220px] rounded-xl">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal pb-1">
            {t('chartTheme')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {CHART_PALETTES.map((palette) => {
            const swatch = theme === 'dark' ? palette.colors.dark : palette.colors.light;
            const selected = palette.id === paletteId;
            return (
              <DropdownMenuItem
                key={palette.id}
                onSelect={() => setPaletteId(palette.id)}
                className="cursor-pointer text-sm gap-2.5 rounded-lg"
              >
                <span className="flex gap-0.5" aria-hidden>
                  {swatch.slice(0, 4).map((hsl, i) => (
                    <span
                      key={i}
                      className="h-3 w-3 rounded-full border border-border/50"
                      style={{ background: `hsl(${hsl})` }}
                    />
                  ))}
                </span>
                <span className="flex-1 font-medium">{t(palette.labelKey)}</span>
                {selected && <Check className="h-3.5 w-3.5 text-primary ml-1" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
