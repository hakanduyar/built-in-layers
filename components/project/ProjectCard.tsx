import { MonoLabel } from "@/components/ui/MonoLabel";
import { TextLink } from "@/components/ui/TextLink";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type ProjectCardProps = {
  project: ProjectFrontmatter;
};

// D-017: Kıvılcım's first English-language introduction may gloss "Spark".
// A one-off naming rule for a single project, not a generalizable schema
// field — handled here rather than as speculative frontmatter.
function displayTitle(project: ProjectFrontmatter): string {
  return project.slug === "kivilcim" ? `${project.title} — "Spark"` : project.title;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <li className="border-t border-line py-6">
      <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
      <h3 className="mt-2 font-display text-heading-m text-ink">
        <TextLink href={`/work/${project.slug}`}>{displayTitle(project)}</TextLink>
      </h3>
      <p className="mt-2 max-w-[42rem] font-display text-body text-ink-muted">
        {project.description}
      </p>
      {project.tech.length > 0 && (
        <p className="mt-3 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          {project.tech.join(" · ")}
        </p>
      )}
    </li>
  );
}
