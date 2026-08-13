import { ProjectCard } from "@/components/project/ProjectCard";
import { SpatialCamera } from "@/components/spatial/SpatialCamera";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/motion/Reveal";
import { heroPrimaryLine, homePositioning, homeWordmark, positioningStatement } from "@/data/copy";
import { getProjectsByTier } from "@/lib/content/work";

// Spatial Portfolio prototype (feature/spatial-portfolio, not merged to
// main -- see docs/DESIGN_SYSTEM.md §18). Vertical slice only: HERO ->
// diagonal travel -> PROJECT-01 (Kıvılcım) -> PROJECT-02 (DropSpot) ->
// content tail -> near-empty transition -> collision -> impact ->
// reposition -> a second scene with a real route onward to the full Work
// index. On this branch, this replaces Hero, PositioningStatement,
// LayerExplorerIntro, and SelectedSystems as app/page.tsx's top section --
// BuiltForRealLife onward are untouched (see app/page.tsx). All project
// content below is real, loader-fed data (the same getProjectsByTier used
// by main's own SelectedSystems) -- no fact is hard-coded here, and both
// projects are reused via the existing ProjectCard primitive rather than a
// bespoke card, so image honesty (D-019 captions/alt text) and upstream
// disclosure rules are inherited automatically.
export function SpatialExperience() {
  const featured = getProjectsByTier("featured");
  const kivilcim = featured.find((project) => project.slug === "kivilcim");
  const dropspot = featured.find((project) => project.slug === "dropspot");

  if (!kivilcim || !dropspot) {
    // Both are currently always-published (D-016); this only trips if
    // publication status changes without updating this prototype -- fail
    // loudly rather than silently render a broken tour.
    throw new Error(
      "SpatialExperience requires kivilcim and dropspot to be published — check content/work/*/index.mdx status",
    );
  }

  return (
    <section aria-label="Spatial system tour">
      <SpatialCamera
        hero={
          <div className="max-w-xl">
            <Reveal onLoad>
              <h1 className="font-display text-display-xl tracking-display-xl uppercase text-ink">
                {homeWordmark}
              </h1>
            </Reveal>
            {/* Real, meaningful heading (reusing main's own approved
                "Selected systems" copy, not invented) bridging h1 -> the
                Kıvılcım/DropSpot nodes' own h3s (ProjectCard) below --
                visually hidden because the spatial composition doesn't
                have room for a literal label here, but axe's heading-order
                check (and real screen-reader document structure) correctly
                requires a level between h1 and h3, not a skip. Caught by a
                real axe scan, not assumed. */}
            <h2 className="sr-only">Selected systems</h2>
            <Reveal onLoad delayMs={60}>
              <p className="mt-4 font-display text-heading-m text-ink-muted">{homePositioning}</p>
            </Reveal>
            <Reveal onLoad delayMs={120}>
              <p className="mt-6 font-display text-heading-l tracking-heading-l uppercase text-ink">
                {heroPrimaryLine}
              </p>
            </Reveal>
          </div>
        }
        kivilcim={
          <div>
            <SectionHeading index="01" label="First stop" />
            <ul className="mt-4">
              <ProjectCard project={kivilcim} />
            </ul>
          </div>
        }
        dropspot={
          <div>
            <SectionHeading index="02" label="Second stop" />
            <ul className="mt-4">
              <ProjectCard project={dropspot} />
            </ul>
          </div>
        }
        tail={
          // The vertical slice's deliberately near-empty beat: one
          // editorial line, no card, no image -- the "content tail" the
          // brief asks for before the wall.
          <div className="max-w-md">
            <p className="font-serif text-statement italic text-ink">{positioningStatement}</p>
          </div>
        }
        sceneTwo={
          <div className="max-w-sm">
            <SectionHeading index="03" label="Beyond this tour" />
            <p className="mt-4 font-display text-heading-m text-ink">
              Kıvılcım and DropSpot are two stops on a larger map.
            </p>
            <p className="mt-2 font-display text-body text-ink-muted">
              JointLedger and Professional Systems continue on the full Work index.
            </p>
            <ButtonLink href="/work" className="mt-6">
              See every system
            </ButtonLink>
          </div>
        }
      />
    </section>
  );
}
