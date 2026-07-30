import { TextLink } from "@/components/ui/TextLink";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type NextProjectProps = {
  project: ProjectFrontmatter;
};

// IA section 11: Next project.
export function NextProject({ project }: NextProjectProps) {
  return (
    <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
      Next project — <TextLink href={`/work/${project.slug}`}>{project.title}</TextLink>
    </p>
  );
}
