import { TextLink } from "@/components/ui/TextLink";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type ProjectNeighboursProps = {
  previous: ProjectFrontmatter | undefined;
  next: ProjectFrontmatter | undefined;
};

/**
 * IA section 11: movement between case studies.
 *
 * Replaces `NextProject`, which rendered one hand-authored `nextSlug` link.
 * Both directions now come from the same derived sequence (D-027), so they
 * cannot disagree with each other or with the editorial order.
 *
 * Renders nothing when a project has no neighbours in either direction —
 * an empty nav region would announce a landmark containing nothing.
 */
export function ProjectNeighbours({ previous, next }: ProjectNeighboursProps) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Case study navigation"
      className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
    >
      {/* The empty span keeps `next` right-aligned at the first case study,
          where there is no previous link to balance it. */}
      {previous ? (
        <p>
          Previous project — <TextLink href={`/work/${previous.slug}`}>{previous.title}</TextLink>
        </p>
      ) : (
        <span />
      )}
      {next && (
        <p>
          Next project — <TextLink href={`/work/${next.slug}`}>{next.title}</TextLink>
        </p>
      )}
    </nav>
  );
}
