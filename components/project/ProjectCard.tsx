import { Figure } from "@/components/ui/Figure";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type ProjectCardProps = {
  project: ProjectFrontmatter;
  /** Stagger offset in ms for a reveal-on-scroll entrance (TASK-007).
   *  Omitted entirely (no Reveal, no client boundary pulled in for this
   *  card) unless a caller explicitly opts in -- today only the homepage's
   *  Selected Systems list does, capped at 4 items well inside DESIGN_SYSTEM
   *  §13's <=5-item stagger cap. */
  revealDelayMs?: number;
};

// D-017: Kıvılcım's first English-language introduction may gloss "Spark".
// A one-off naming rule for a single project, not a generalizable schema
// field — handled here rather than as speculative frontmatter. Exported so
// any other real presentation of these same projects (e.g. the homepage
// Selected Systems prototype) reuses this one rule instead of growing a
// second slug->title map.
export function displayTitle(project: ProjectFrontmatter): string {
  return project.slug === "kivilcim" ? `${project.title} — "Spark"` : project.title;
}

export function ProjectCard({ project, revealDelayMs }: ProjectCardProps) {
  const content = (
    <>
      <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
      <h3 className="mt-2 font-display text-heading-m text-ink">
        <TextLink href={`/work/${project.slug}`}>{displayTitle(project)}</TextLink>
      </h3>
      <p className="mt-2 max-w-[42rem] font-display text-body text-ink-muted">
        {project.description}
      </p>
      {/* CONTENT_MODEL §9: upstream disclosure is mandatory in any
          rendering of a fork-provenance project, including preview cards. */}
      {project.upstream && (
        <p className="mt-2 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          Fork of {project.upstream.name}
        </p>
      )}
      {project.tech.length > 0 && (
        <p className="mt-3 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          {project.tech.join(" · ")}
        </p>
      )}
      {/* Representative image: the first registered images[] entry, never a
          hard-coded per-project asset — kept secondary (capped width) so the
          title/description stay dominant, per DESIGN_SYSTEM §9's existing
          Figure frame (mat, corner ticks, honest caption). Shared with /work
          via this same component, so there is one image-selection path, not
          two. */}
      {project.images[0] && (
        <div className="mt-4 max-w-xs">
          <Figure
            src={project.images[0].src}
            alt={project.images[0].alt}
            caption={project.images[0].caption}
          />
        </div>
      )}
    </>
  );

  return (
    <li className="border-t border-line py-6 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-signal-ui focus-within:border-signal-ui">
      {revealDelayMs !== undefined ? <Reveal delayMs={revealDelayMs}>{content}</Reveal> : content}
    </li>
  );
}
