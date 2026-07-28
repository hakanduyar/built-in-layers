import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  className?: string;
};

/** DESIGN_SYSTEM §10 button behavior. Navigation only -- never a form action. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  className,
}: ButtonLinkProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded-1 px-6 py-3 font-mono text-mono-label tracking-mono-label uppercase transition-colors active:translate-y-px";
  const variantClassName =
    variant === "primary"
      ? "bg-ink text-paper hover:bg-signal hover:text-ink"
      : "border border-ink text-ink hover:bg-ink/8";
  const fullClassName = cn(base, variantClassName, className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={fullClassName}>
        {children}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={fullClassName}>
      {children}
    </Link>
  );
}
