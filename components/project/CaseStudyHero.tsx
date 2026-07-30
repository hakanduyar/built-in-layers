import { MonoLabel } from "@/components/ui/MonoLabel";
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
    </header>
  );
}
