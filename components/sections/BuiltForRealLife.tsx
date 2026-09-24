import { ProjectCard } from "@/components/project/ProjectCard";
import { SystemNode } from "@/components/spatial/SystemNode";
import { Reveal } from "@/components/ui/motion/Reveal";
import { builtForRealLifeHeading, builtForRealLifeSubheading, pendingCopy } from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type BuiltForRealLifeProps = {
  projects: ProjectFrontmatter[];
};

// IA section 6. Data comes from app/page.tsx (getProjectsByTier("real-life"))
// -- never hard-coded here. No published or draft real-life-tier project
// exists yet, so this renders honest pending copy rather than fabricated
// cards; it will render real entries automatically once any exist.
//
// V6.7 COMPLETION PASS -- THE ARRIVAL.
//
// This section is the one the spatial world spends its whole exit traverse
// approaching: the reader has already watched a plate carrying this exact index and
// this exact heading resolve from "05 / Detected" to "05 / Resolved" across the
// diagonal. Through V6.7-partial the real section then arrived as an index, a rule
// and an <h2> -- a different kind of object from the thing that had been promised,
// which is most of why the page's quality appeared to drop after UNDERNEATH.
//
// It is now a SystemNode: the same registration corner, the same spine, and the
// same three acquisition words, driven by this section's own real passage through
// the viewport. The preview's geometry does not merely resemble the section's --
// it is the same geometry, so arriving here reads as the destination resolving
// rather than as a new page beginning.
//
// The subheading is promoted to the section's statement voice, and the empty state
// is stated as a system fact on its own registered line rather than as a paragraph
// apologising for itself. Nothing is fabricated: with no real-life-tier project
// published, the honest content is that there is not one yet.
export function BuiltForRealLife({ projects }: BuiltForRealLifeProps) {
  return (
    <SystemNode index="05" label={builtForRealLifeHeading}>
      <h2 className="mt-5 font-display text-display-l uppercase text-ink">
        {builtForRealLifeHeading}
      </h2>

      {projects.length === 0 ? (
        /* FINAL REMEDIATION: the statement and the state now share one register
           row instead of stacking down the left with the section's right half as
           bare paper (measured at the owner's real viewport: everything right of
           the container's midline was empty). Left column: the section's voice.
           Right column: the system's own record of this destination -- status and
           entry count, both REAL (no real-life-tier project is published), then
           the honest sentence. The section reads as a registered, dormant
           destination -- observed, not apologised for. */
        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-10">
          <p className="max-w-[30rem] font-serif text-statement italic text-ink lg:col-span-6">
            {builtForRealLifeSubheading}
          </p>
          <Reveal className="mt-8 lg:col-start-8 lg:col-span-5 lg:mt-2">
            <dl aria-hidden="true" className="border-t border-ink pt-3">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
                  Status
                </dt>
                <dd className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
                  Dormant
                </dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-2">
                {/* "Entries", not "Resolved entries": the section's own POV tag
                    reads RESOLVED (camera state) two rules above, and reusing the
                    word for a content count made one viewport say "resolved /
                    zero resolved / dormant" (review finding). */}
                <dt className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
                  Entries
                </dt>
                <dd className="font-mono text-mono-label tracking-mono-label text-ink">00</dd>
              </div>
            </dl>
            <p className="mt-4 font-display text-body text-ink-muted">{pendingCopy.realLife}</p>
          </Reveal>
        </div>
      ) : (
        <ul className="mt-10 lg:grid lg:grid-cols-2 lg:gap-x-12">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} revealDelayMs={index * 60} />
          ))}
        </ul>
      )}
    </SystemNode>
  );
}
