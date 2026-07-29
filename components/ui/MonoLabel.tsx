import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type MonoLabelProps = {
  children: ReactNode;
  className?: string;
};

// DESIGN_SYSTEM.md §3 `mono-label` role: eyebrows, nav, tags, layer tabs,
// buttons. Text color is intentionally left to the caller — it varies by
// context (e.g. nav links use --ink, eyebrows use --ink-muted).
export function MonoLabel({ children, className }: MonoLabelProps) {
  return (
    <span className={cn("font-mono text-mono-label tracking-mono-label uppercase", className)}>
      {children}
    </span>
  );
}
