import { SpatialCamera } from "@/components/spatial/SpatialCamera";
import { SpatialProjectScene } from "@/components/spatial/SpatialProjectScene";
import { TravelMaterial } from "@/components/spatial/TravelMaterial";
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
import { systemAnnotation } from "@/lib/spatial/systemPov";

// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
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

/** The approved wordmark, split for the hero's two-line setting. Derived so
 *  the composition can never disagree with CLAUDE.md §4's name. */
const [givenName = "Hakan", familyName = "Duyar"] = homeWordmark.split(" ");

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
        // Travel material (§21). The distant plane carries oversized cropped
        // fragments of the REAL titles of the scenes the camera is heading
        // toward -- material derived from the world's own content, never
        // decoration, and aria-hidden because each title is already present
        // as a real link in the scene it names.
        distantMaterial={
          <TravelMaterial
            plane="distant"
            words={[
              { word: kivilcim.title, before: "kivilcim" },
              { word: dropspot.title, before: "dropspot" },
              // Route two's material names a project the tour does NOT stage
              // but the handoff does mention, so the second route carries its
              // own content rather than echoing the giant word already
              // standing at the reposition.
              ...(beyondTour[0]
                ? [{ word: beyondTour[0].title, before: "approach" as const }]
                : []),
            ]}
          />
        }
        nearMaterial={<TravelMaterial plane="near" words={[]} />}
        // What the observing system may say about each scene (§9, §12). Both
        // entries are built by systemAnnotation() from the project's own
        // validated frontmatter -- there is no slug->copy table here and no
        // field this file invents.
        annotations={{
          kivilcim: systemAnnotation(kivilcim, "01"),
          dropspot: systemAnnotation(dropspot, "02"),
        }}
        hero={
          // Scroll position 0. Still calm and still readable as a premium
          // first screen -- but no longer generic (§12). The name owns one
          // region, the thesis owns a second region offset down and to the
          // right, and a single structural rule runs between them on the
          // exact angle the camera is about to travel. The spatial world's
          // DNA is present before anything moves; none of it is a grid, a
          // debug label, or an animation.
          // `overflow-clip` is load-bearing, not cosmetic: the oversized
          // SURFACE fragment below is deliberately larger than the frame, and
          // in the reduced-motion / no-JS tree there is no camera box to clip
          // it, so without this it overflowed the document by 125px at 1440
          // (caught by the responsive check, not by eye). `clip` rather than
          // `hidden` so it never becomes a scrollable container.
          <div className="relative w-full overflow-clip">
            {/* The hero's own distant plane: the first noun of the approved
                thesis, oversized and clipped by the top of the composition.
                It is the same material language the travel space uses, so the
                world's depth is already present before anything moves -- and
                it is a decorative duplicate of the line stated in full below,
                so it adds no screen-reader content. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-[26vh] left-[6%] hidden select-none overflow-hidden font-display text-[22vw] leading-none tracking-[-0.05em] uppercase text-ink opacity-[0.055] lg:block"
            >
              Surface
            </span>

            <div className="relative lg:max-w-[78%]">
              <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
                {homePositioning}
              </p>
              {/* Scene-scoped display scale: the shared `display-xl` token
                  caps at 6.5rem, which left the name occupying under half the
                  frame. Kept component-scoped (not promoted into the token
                  system, which governs main) and recorded in DESIGN_SYSTEM
                  §18. The second line is indented into the route's own
                  direction, so the wordmark itself leans the way the camera
                  is about to travel. */}
              {/* Split across two lines from the approved wordmark itself,
                  never retyped, and joined by a real space so the accessible
                  name stays exactly "Hakan Duyar" -- a visually-hidden
                  duplicate would have added the name to the page twice for
                  screen readers, which is precisely what the depth planes are
                  forbidden from doing (§36). */}
              <h1 className="mt-6 font-display text-[clamp(3rem,10.5vw,9.5rem)] leading-[0.82] tracking-[-0.035em] uppercase text-ink">
                <span className="block">{givenName}</span>{" "}
                <span className="block lg:ml-[16%]">{familyName}</span>
              </h1>
              {/* Real heading level between the h1 and each scene's project
                  h3. Visually hidden because the spatial composition has no
                  room for a literal section label, but the document outline
                  and axe's heading-order rule both need it. */}
              <h2 className="sr-only">Selected systems</h2>
            </div>

            <div
              aria-hidden="true"
              className="relative ml-[30vw] hidden lg:block"
              style={{ width: `${HERO_LEAD.width}vw`, height: `${HERO_LEAD.height}vh` }}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full text-ink opacity-40"
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

            <div className="mt-10 lg:ml-[48vw] lg:mt-0">
              <p className="max-w-[26rem] border-l-2 border-ink pl-6 font-display text-heading-l tracking-heading-l uppercase text-ink">
                {heroPrimaryLine}
              </p>
            </div>
          </div>
        }
        kivilcim={<SpatialProjectScene project={kivilcim} variant="split" />}
        dropspot={<SpatialProjectScene project={dropspot} variant="stacked" />}
        reorient={
          // The reposition target. The giant word is no longer an isolated
          // piece of typography floating in space (§9): it stands at the
          // foot of a depth rail that descends from above the frame and is
          // registered by the three layer names, so it labels a coordinate
          // in the world -- the depth the camera was thrown to.
          // Indented into the block on purpose: the break's reveal takes about
          // 10vw of camera travel to finish, so a rail sitting at the scene
          // block's own left edge is already off-frame by the moment the scene
          // becomes visible. Padding the composition inward keeps the depth
          // rail -- the thing that makes UNDERNEATH structural rather than
          // decorative -- inside the frame for the whole arrival.
          <div className="w-full lg:pl-[11vw]">
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
