
'use client';

import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-16 h-16", className)}
    >
      <path
        d="M 50 5 L 50 95 M 32 32 C 40 40, 40 60, 50 50 C 60 40, 60 60, 68 68"
        stroke="hsl(var(--foreground))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
