import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type TextLinkProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
};

/** DESIGN_SYSTEM §10 text-link behavior: underline, signal-text hover. */
export function TextLink({ href, children, external, className }: TextLinkProps) {
  const linkClassName = cn(
    "underline decoration-1 underline-offset-[3px] text-ink hover:text-signal-text hover:decoration-2",
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
        {children}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={linkClassName}>
      {children}
    </Link>
  );
}
