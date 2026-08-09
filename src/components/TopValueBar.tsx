"use client";

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { getChartColor, getChartColorVar } from '@/lib/chart-themes';

interface TopValueBarProps {
  index: number;
  value: string;
  count: number;
  percentage: number;
}

/** A single "top value" row inside a Repeating Values insight card, colored
 *  from the active chart palette and highlighted on hover with the same color. */
export function TopValueBar({ index, value, count, percentage }: TopValueBarProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-2 -mx-1 px-1 py-0.5 rounded-md transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: hovered ? `hsl(${getChartColorVar(index)} / 0.12)` : 'transparent' }}
    >
      <Progress value={percentage} className="flex-1 h-1.5" indicatorStyle={{ background: getChartColor(index) }} />
      <span className="text-[10px] text-foreground min-w-[60px] truncate">{value}</span>
      <span className="text-[10px] text-muted-foreground shrink-0">{count} ({percentage}%)</span>
    </div>
  );
}
