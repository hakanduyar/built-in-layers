import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  className?: string;
};

// DESIGN_SYSTEM.md §10: mono-label text, radius-1, 12x24 padding, 44px
// minimum target, active state translates down 1px (no scale).
const variantClassName: Record<"primary" | "secondary", string> = {
  primary: "bg-ink text-paper hover:bg-signal hover:text-ink",
  secondary: "border border-ink text-ink hover:bg-ink/8",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className,
}: ButtonLinkProps) {
  const sharedClassName = cn(
    "inline-flex min-h-11 items-center justify-center rounded-1 px-6 py-3 font-mono text-mono-label tracking-mono-label uppercase active:translate-y-px",
    variantClassName[variant],
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={sharedClassName}>
        {children}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={sharedClassName}>
      {children}
    </Link>
  );
}
