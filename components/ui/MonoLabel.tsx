import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type MonoLabelProps = {
  children: ReactNode;
  className?: string;
};

/** DESIGN_SYSTEM §3 `mono-label` role: eyebrows, nav, tags, buttons. */
export function MonoLabel({ children, className }: MonoLabelProps) {
  return (
    <span className={cn("font-mono text-mono-label tracking-mono-label uppercase", className)}>
      {children}
    </span>
  );
}
