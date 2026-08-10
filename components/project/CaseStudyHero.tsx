import { MonoLabel } from "@/components/ui/MonoLabel";
import { TextLink } from "@/components/ui/TextLink";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type CaseStudyHeroProps = {
  project: ProjectFrontmatter;
};

// IA section 1: Project hero.
export function CaseStudyHero({ project }: CaseStudyHeroProps) {
  return (
    <header>
      <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
      <h1 className="mt-4 font-display text-heading-l text-ink">{project.title}</h1>
      <p className="mt-4 max-w-[42rem] font-display text-body-l text-ink">{project.description}</p>
      {/* CONTENT_MODEL §9: upstream disclosure is mandatory in any rendering
          of a fork-provenance project, not just metadata. */}
      {project.upstream && (
        <p className="mt-4 max-w-[42rem] font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          A fork of{" "}
          <TextLink href={project.upstream.url} external>
            {project.upstream.name}
          </TextLink>
          , not an original project built from scratch.
        </p>
      )}
    </header>
  );
}
