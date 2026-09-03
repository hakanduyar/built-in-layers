import Link from "next/link";
import type { ReactNode } from "react";
import type { ProjectFrontmatter } from "@/lib/content/schemas";
import { cn } from "@/lib/utils/cn";

type ProjectNeighboursProps = {
  previous: ProjectFrontmatter | undefined;
  next: ProjectFrontmatter | undefined;
};

/**
 * One onward route at the foot of a case study: a mono label naming the
 * direction, and the destination's title at heading scale as the link.
 * DESIGN_SYSTEM §10's text-link treatment, with the underline offset grown
 * for the type size as on the spatial scene's display titles (TextLink's 3px
 * is sized for running text). Also used by the preview-depth page's route
 * back to the work index, so both exits are set the same way.
 */
export function DestinationLink({
  label,
  href,
  align = "start",
  children,
}: {
  label: string;
  href: string;
  align?: "start" | "end";
  children: ReactNode;
}) {
  return (
    <p className={cn(align === "end" && "sm:text-right")}>
      <span className="block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
        {label}
      </span>
      <span className="mt-3 block font-display text-heading-l text-ink">
        <Link
          href={href}
          className="underline decoration-1 underline-offset-[5px] transition-[color,text-decoration-thickness] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-signal-text hover:decoration-2"
        >
          {children}
        </Link>
      </span>
    </p>
  );
}

/**
 * IA section 11: movement between case studies.
 *
 * Replaces `NextProject`, which rendered one hand-authored `nextSlug` link.
 * Both directions now come from the same derived sequence (D-027), so they
 * cannot disagree with each other or with the editorial order.
 *
 * Renders nothing when a project has no neighbours in either direction —
 * an empty nav region would announce a landmark containing nothing.
 *
 * V13 (Fable gate, finding D): the two destinations were one 13px mono line
 * at the foot of a page whose section headings are 40px -- the page's only
 * onward movement, set as a footnote. Each direction now carries its label
 * at label scale and the destination's title at heading scale, on a rule.
 */
export function ProjectNeighbours({ previous, next }: ProjectNeighboursProps) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Case study navigation"
      className="grid grid-cols-1 gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-2"
    >
      {/* The empty span keeps `next` right-aligned at the first case study,
          where there is no previous link to balance it. */}
      {previous ? (
        <DestinationLink label="Previous project" href={`/work/${previous.slug}`}>
          {previous.title}
        </DestinationLink>
      ) : (
        <span />
      )}
      {next && (
        <DestinationLink label="Next project" href={`/work/${next.slug}`} align="end">
          {next.title}
        </DestinationLink>
      )}
    </nav>
  );
}
