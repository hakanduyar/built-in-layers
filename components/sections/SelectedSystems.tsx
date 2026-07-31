import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pendingCopy, selectedSystemsSubheading } from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type SelectedSystemsProps = {
  projects: ProjectFrontmatter[];
};

// IA section 5. Data comes from app/page.tsx (getProjectsByTier("featured"))
// -- never hard-coded here. Reuses the same ProjectCard as /work so a single
// published entry still reads as a complete, intentional section rather
// than a broken grid.
export function SelectedSystems({ projects }: SelectedSystemsProps) {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="04" label="Selected systems" />
      <h2 className="mt-4 font-display text-display-l uppercase text-ink">Selected systems</h2>
      <p className="mt-4 max-w-[42rem] font-display text-body-l text-ink-muted">
        {selectedSystemsSubheading}
      </p>
      {projects.length === 0 ? (
        <p className="mt-8 max-w-[42rem] font-display text-body text-ink-muted">
          {pendingCopy.work}
        </p>
      ) : (
        <ul className="mt-8">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </ul>
      )}
    </section>
  );
}
