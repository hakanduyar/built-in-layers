import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { builtForRealLifeSubheading, pendingCopy } from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type BuiltForRealLifeProps = {
  projects: ProjectFrontmatter[];
};

// IA section 6. Data comes from app/page.tsx (getProjectsByTier("real-life"))
// -- never hard-coded here. No published or draft real-life-tier project
// exists yet, so this renders honest pending copy rather than fabricated
// cards; it will render real entries automatically once any exist.
export function BuiltForRealLife({ projects }: BuiltForRealLifeProps) {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="05" label="Built for real life" />
      <h2 className="mt-4 font-display text-display-l uppercase text-ink">Built for real life</h2>
      <p className="mt-4 max-w-[42rem] font-display text-body-l text-ink-muted">
        {builtForRealLifeSubheading}
      </p>

      {projects.length === 0 ? (
        <p className="mt-8 max-w-[42rem] font-display text-body text-ink-muted">
          {pendingCopy.realLife}
        </p>
      ) : (
        <ul className="mt-8 lg:grid lg:grid-cols-2 lg:gap-x-12">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </ul>
      )}
    </section>
  );
}
