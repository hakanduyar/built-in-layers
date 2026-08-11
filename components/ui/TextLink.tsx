import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TextLinkProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
};

// DESIGN_SYSTEM.md §10: underline 1px, offset 3px; hover: --signal-text,
// underline 2px. External links get a ↗ glyph plus a screen-reader note and
// open in a new tab with rel="noopener noreferrer". TASK-007: the hover
// color/underline change animates with the existing --duration-fast/
// --ease-standard tokens (already global CSS, no JS/client boundary
// needed) instead of switching instantly.
const baseClassName =
  "underline decoration-1 underline-offset-[3px] transition-[color,text-decoration-thickness] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-signal-text hover:decoration-2";

export function TextLink({ href, children, external = false, className }: TextLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClassName, className)}
      >
        {children}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={cn(baseClassName, className)}>
      {children}
    </Link>
  );
}
