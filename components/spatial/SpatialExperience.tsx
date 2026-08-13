import { SpatialCamera } from "@/components/spatial/SpatialCamera";
import { SpatialProjectScene } from "@/components/spatial/SpatialProjectScene";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { heroPrimaryLine, homePositioning, homeWordmark, positioningStatement } from "@/data/copy";
import { getProjectsByTier } from "@/lib/content/work";

// Spatial Portfolio V2 (feature/spatial-portfolio-v2, not merged to main --
// see docs/DESIGN_SYSTEM.md §18).
//
// Vertical slice: HERO -> travel -> KIVILCIM -> travel -> DROPSPOT ->
// travel -> TAIL (near-empty, eroding) -> COLLISION -> scene break ->
// REPOSITION -> SECOND-SCENE TEASER -> controlled exit into the normal
// document. JointLedger and Professional Systems are deliberately not
// spatialised yet; they are reached through the real Work index.
//
// Every fact rendered here comes from the real content loader. The only
// project-specific decision in this file is which two slugs the tour visits
// -- a presentation choice, not content -- and even the "what's beyond this
// tour" copy names the remaining projects from loader data rather than
// hard-coding them, so it stays correct if publication status changes.

/** The two projects this vertical slice stages as full scenes. */
const TOUR_SLUGS = ["kivilcim", "dropspot"] as const;

// Both expressive words are the two halves of the approved primary line in
// data/copy.ts ("Interfaces on the surface. Systems underneath.") -- the
// brand's own thesis, not new copy. Derived from that string rather than
// retyped so they can never drift from the approved source.
const [, systemsClause = "Systems underneath."] = heroPrimaryLine.split(". ");
const [transitionWord = "Systems", orientationWord = "underneath"] = systemsClause
  .replace(/\.$/, "")
  .split(" ");

export function SpatialExperience() {
  const featured = getProjectsByTier("featured");
  const kivilcim = featured.find((project) => project.slug === TOUR_SLUGS[0]);
  const dropspot = featured.find((project) => project.slug === TOUR_SLUGS[1]);
  const beyondTour = featured.filter(
    (project) => !TOUR_SLUGS.some((slug) => slug === project.slug),
  );

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
        erosionWord={transitionWord}
        hero={
          // Scroll position 0. Deliberately reads as an excellent, ordinary
          // premium hero -- no visible hint of the world it sits in. The
          // camera relationship is only revealed by scrolling (§7).
          <div className="w-full">
            {/* Scene-scoped display scale: the shared `display-xl` token
                caps at 6.5rem, which left the name occupying under half the
                frame and reading as a small object in a large space -- the
                exact failure V2 exists to correct. Kept component-scoped
                (not promoted into the token system, which governs main) and
                recorded in DESIGN_SYSTEM §18. */}
            <h1 className="font-display text-[clamp(3rem,10vw,9rem)] leading-[0.9] tracking-[-0.025em] uppercase text-ink">
              {homeWordmark}
            </h1>
            {/* Real heading level between the h1 and each scene's project
                h3. Visually hidden because the spatial composition has no
                room for a literal section label, but the document outline
                and axe's heading-order rule both need it. */}
            <h2 className="sr-only">Selected systems</h2>
            <p className="mt-5 font-display text-heading-m text-ink-muted">{homePositioning}</p>
            <p className="mt-10 max-w-[46rem] border-l-2 border-ink pl-6 font-display text-heading-l tracking-heading-l uppercase text-ink">
              {heroPrimaryLine}
            </p>
          </div>
        }
        kivilcim={<SpatialProjectScene project={kivilcim} index="01" variant="split" />}
        dropspot={<SpatialProjectScene project={dropspot} index="02" variant="stacked" />}
        sceneTwo={
          <div className="w-full">
            {/* Orientation cue (§16): the other half of the same approved
                line the hero already states in full. Decorative duplicate,
                so aria-hidden -- it tells the eye "the world changed and
                you are somewhere new" without inventing anything. */}
            <p
              aria-hidden="true"
              // Viewport-driven floor for the same reason as the erosion
              // word: "underneath" is a single unbreakable word and a
              // rem-based minimum overflows narrow viewports.
              className="font-display text-[clamp(2rem,10vw,9rem)] leading-[0.85] tracking-[-0.03em] uppercase text-ink"
            >
              {orientationWord}
            </p>
            {/* PROJECT_SPEC §7 IA item 3 / CLAUDE.md §4's approved
                supporting statement. It lives here rather than in the hero
                so the two serif-weight thesis lines do not stack on one
                screen -- and landing it right after the break makes the
                reposition state what the whole journey was arguing toward.
                Dropping it entirely would have removed required approved
                content; a regression test caught exactly that. */}
            <p className="mt-8 max-w-[38rem] font-serif text-statement italic text-ink">
              {positioningStatement}
            </p>
            <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-6">
                <p className="max-w-[34rem] font-display text-heading-m text-ink">
                  {kivilcim.title} and {dropspot.title} are two stops on a larger map.
                </p>
                {beyondTour.length > 0 && (
                  <p className="mt-3 max-w-[34rem] font-display text-body text-ink-muted">
                    {beyondTour.map((project) => project.title).join(" and ")} continue on the full
                    Work index.
                  </p>
                )}
              </div>
              <div className="lg:col-span-6 lg:justify-self-start">
                <ButtonLink href="/work">See every system</ButtonLink>
              </div>
            </div>
          </div>
        }
      />

      {/* Controlled exit (§27): the spatial world ends on a deliberate
          surface-line rather than dumping the visitor into the next
          ordinary section from a blank void. Wording is built from the
          brand's own "Interfaces on the surface" thesis. */}
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 md:px-6 lg:px-8">
        <div className="border-t border-line pt-6">
          <MonoLabel className="text-ink-muted">Back on the surface</MonoLabel>
        </div>
      </div>
    </section>
  );
}
