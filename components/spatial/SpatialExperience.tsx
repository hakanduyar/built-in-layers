import { SpatialCamera } from "@/components/spatial/SpatialCamera";
import { SpatialProjectScene } from "@/components/spatial/SpatialProjectScene";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  heroPrimaryLine,
  homePositioning,
  homeWordmark,
  layerDefinitions,
  positioningStatement,
} from "@/data/copy";
import { getProjectsByTier } from "@/lib/content/work";
import { heroLeadRule } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V3 (feature/spatial-portfolio-v3, not merged to main --
// see docs/DESIGN_SYSTEM.md §18).
//
// ROUTE ONE (evidence): HERO -> KIVILCIM -> DROPSPOT -> TAIL -> COLLISION
// break
// ROUTE TWO (thinking): REORIENT -> APPROACH -> HANDOFF -> exit
//
// The direction change is not decoration. Route one descends through what
// was actually built and what can actually be shown; the collision is the
// end of that evidence; route two climbs back up through how the work is
// thought about. That is why the reposition lands at the world's lowest
// point -- the coordinate the approved primary line already calls
// "underneath" -- and why the first thing on route two is the Surface /
// Flow / System stack: the site's own framework, standing at the depth it
// describes.
//
// Every fact rendered here comes from the real content loader or from the
// approved copy module. The only project-specific decision in this file is
// which two slugs the tour visits -- a presentation choice, not content --
// and even the "what's beyond this tour" line names the remaining projects
// from loader data rather than hard-coding them.

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

// The hero's structural rule runs at the exact screen angle of the first
// travel leg, computed from the route itself. The hero therefore points
// where the camera is about to go, and cannot drift if the route moves.
const HERO_LEAD = heroLeadRule(18);

// Depth positions of the layer registration marks on the reorient scene's
// rail, in vh above the giant word. The rail starts above the top of the
// frame so it reads as coming down from the surface the camera left.
const DEPTH_RAIL_TOP = -48;
const DEPTH_MARKS = [-34, -21, -8];

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
          // Scroll position 0. Still calm and still readable as a premium
          // first screen -- but no longer generic (§12). The name owns one
          // region, the thesis owns a second region offset down and to the
          // right, and a single structural rule runs between them on the
          // exact angle the camera is about to travel. The spatial world's
          // DNA is present before anything moves; none of it is a grid, a
          // debug label, or an animation.
          <div className="w-full">
            <div className="lg:max-w-[74%]">
              {/* Scene-scoped display scale: the shared `display-xl` token
                  caps at 6.5rem, which left the name occupying under half
                  the frame and reading as a small object in a large space.
                  Kept component-scoped (not promoted into the token system,
                  which governs main) and recorded in DESIGN_SYSTEM §18. */}
              <h1 className="font-display text-[clamp(3rem,10vw,9rem)] leading-[0.86] tracking-[-0.03em] uppercase text-ink">
                {homeWordmark}
              </h1>
              {/* Real heading level between the h1 and each scene's project
                  h3. Visually hidden because the spatial composition has no
                  room for a literal section label, but the document outline
                  and axe's heading-order rule both need it. */}
              <h2 className="sr-only">Selected systems</h2>
              <p className="mt-5 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
                {homePositioning}
              </p>
            </div>

            <div
              aria-hidden="true"
              className="relative ml-[6vw] hidden lg:block"
              style={{ width: `${HERO_LEAD.width}vw`, height: `${HERO_LEAD.height}vh` }}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full text-ink opacity-35"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className="mt-10 lg:ml-[24vw] lg:mt-0">
              <p className="max-w-[38rem] border-l-2 border-ink pl-6 font-display text-heading-l tracking-heading-l uppercase text-ink">
                {heroPrimaryLine}
              </p>
            </div>
          </div>
        }
        kivilcim={<SpatialProjectScene project={kivilcim} index="01" variant="split" />}
        dropspot={<SpatialProjectScene project={dropspot} index="02" variant="stacked" />}
        reorient={
          // The reposition target. The giant word is no longer an isolated
          // piece of typography floating in space (§9): it stands at the
          // foot of a depth rail that descends from above the frame and is
          // registered by the three layer names, so it labels a coordinate
          // in the world -- the depth the camera was thrown to.
          <div className="w-full">
            <div className="relative pl-8">
              <span
                aria-hidden="true"
                className="absolute left-0 block w-px bg-line"
                style={{ top: `${DEPTH_RAIL_TOP}vh`, height: `${-DEPTH_RAIL_TOP}vh` }}
              />
              {layerDefinitions.map((layer, index) => (
                <span
                  key={layer.label}
                  // Decorative repetition of the next scene's real headings,
                  // so it stays out of the accessibility tree (§24).
                  aria-hidden="true"
                  className="absolute left-0 flex items-center gap-3"
                  style={{ top: `${DEPTH_MARKS[index] ?? 0}vh` }}
                >
                  <span className="block h-px w-6 bg-line" />
                  <MonoLabel className="text-ink-muted">{layer.label}</MonoLabel>
                </span>
              ))}
              <p
                aria-hidden="true"
                // Viewport-driven clamp floor: "underneath" is a single
                // unbreakable word and a rem-based minimum overflows narrow
                // viewports.
                className="font-display text-[clamp(2rem,10vw,9rem)] leading-[0.85] tracking-[-0.03em] uppercase text-ink"
              >
                {orientationWord}
              </p>
            </div>
            {/* PROJECT_SPEC §7 IA item 3 / CLAUDE.md §4's approved supporting
                statement. Landing it right after the break makes the
                reposition state what the whole journey was arguing toward. */}
            <p className="mt-8 max-w-[38rem] pl-8 font-serif text-statement italic text-ink">
              {positioningStatement}
            </p>
          </div>
        }
        approach={
          // The second-scene teaser (§8): the site's own Surface / Flow /
          // System framework, which is what "the thinking region" actually
          // contains. Approved copy from data/copy.ts, rendered nowhere else
          // on this branch's homepage, so nothing is duplicated. A definition
          // list rather than an ordered list on purpose -- these are term and
          // definition pairs, and no <li> may exist in the spatial world
          // (that is the structural contract keeping V1's rejected project
          // cards out).
          <div className="w-full">
            <SectionHeading index="03" label="Built in Layers" />
            <h2 className="mt-5 font-display text-display-l tracking-display-l uppercase text-ink">
              Built in Layers
            </h2>
            <dl className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
              {layerDefinitions.map((layer) => (
                <div key={layer.label} className="border-t border-line pt-4">
                  <dt className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
                    {layer.label}
                  </dt>
                  <dd className="mt-3 font-display text-heading-m text-ink-muted">{layer.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
        handoff={
          // The last beat inside the world, reached by one more short
          // diagonal. Only after this does the page hand off to ordinary
          // document flow (§7).
          <div className="w-full">
            {/* Deliberately not CSS-uppercased: it contains "Kıvılcım", and
                text-transform destroys the dotless-ı that D-017 fixes as the
                project's primary display name. */}
            <p className="max-w-[44rem] font-display text-display-l tracking-display-l text-ink">
              {kivilcim.title} and {dropspot.title} are two stops on a larger map.
            </p>
            {beyondTour.length > 0 && (
              <p className="mt-4 max-w-[34rem] font-display text-body text-ink-muted">
                {beyondTour.map((project) => project.title).join(" and ")} continue on the full Work
                index.
              </p>
            )}
            <div className="mt-10">
              <ButtonLink href="/work">See every system</ButtonLink>
            </div>
          </div>
        }
      />

      {/* Controlled exit: the spatial world ends on a deliberate surface-line
          rather than dumping the visitor into the next ordinary section from
          a blank void. The wording is the other half of the brand's own
          thesis, and it is now literally true -- route two spent its whole
          length climbing back up. */}
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 md:px-6 lg:px-8">
        <div className="border-t border-line pt-6">
          <MonoLabel className="text-ink-muted">Back on the surface</MonoLabel>
        </div>
      </div>
    </section>
  );
}
