import { SelectedSystemsSpread } from "@/components/sections/SelectedSystemsSpread";
import { LayerRegistrationMark } from "@/components/ui/LayerRegistrationMark";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pendingCopy, selectedSystemsSubheading } from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type SelectedSystemsProps = {
  projects: ProjectFrontmatter[];
};

// IA section 5. Data comes from app/page.tsx (getProjectsByTier("featured"))
// -- never hard-coded here.
//
// PROTOTYPE (Layered Editorial Systems, visual-only): the homepage's third
// deliberate high point (evidence/portfolio, after Hero=impact and Layer
// Explorer=technical). SelectedSystemsSpread replaces the equal-card list
// with a bespoke, unequal-weight composition per project -- see that
// component's own comments. Falls back to the original honest pending copy
// when zero featured projects exist (unchanged from before).
export function SelectedSystems({ projects }: SelectedSystemsProps) {
  return (
    <section className="mt-24 lg:mt-40">
      <SectionHeading index="04" label="Selected systems" />
      <div className="mt-4 flex items-end justify-between">
        <h2 className="font-display text-display-l uppercase text-ink">Selected systems</h2>
        <LayerRegistrationMark className="hidden shrink-0 lg:flex" />
      </div>
      <p className="mt-4 max-w-[42rem] font-display text-body-l text-ink-muted">
        {selectedSystemsSubheading}
      </p>
      {projects.length === 0 ? (
        <p className="mt-8 max-w-[42rem] font-display text-body text-ink-muted">
          {pendingCopy.work}
        </p>
      ) : (
        <SelectedSystemsSpread projects={projects} />
      )}
    </section>
  );
}
