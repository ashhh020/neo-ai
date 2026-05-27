"use client";

import { cn } from "@/lib/utils";

interface AIBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function AIBadge({ className, size = "sm" }: AIBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{ color: "#8A2BE2" }}
    >
      <span className="text-[10px]">✦</span>
      AI
    </span>
  );
}
