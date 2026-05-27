"use client";

import { cn } from "@/lib/utils";
import { getConfidenceLabel, getConfidenceColor } from "@/lib/utils";

interface ConfidenceMeterProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceMeter({ score, showLabel = true, className }: ConfidenceMeterProps) {
  const label = getConfidenceLabel(score);
  const color = getConfidenceColor(score);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums" style={{ color }}>
        {score}%
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
