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
  workIndexLabel,
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

/** V7 (OWNER REORDER): the four projects the tour stages as full scenes, in
 *  the owner-required sequence — Software Factory first as the foundational
 *  system layer, then Kıvılcım, JointLedger, DropSpot. */
const TOUR_SLUGS = ["software-factory", "kivilcim", "jointledger", "dropspot"] as const;

/** The tour's own size, in words, for the handoff sentence. Derived rather than
 *  written, because the sentence it feeds went stale the moment the tour grew
 *  from two scenes to four and nothing forced it to be updated (V9 §P0). Falls
 *  back to the numeral, so an eighth scene cannot produce a blank. */
const COUNT_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven"] as const;
const TOUR_COUNT_WORD = COUNT_WORDS[TOUR_SLUGS.length] ?? String(TOUR_SLUGS.length);

/** "01 / 04" — a scene's position in the tour, both halves derived from the tour
 *  itself so the denominator can never disagree with the route (V9 §17). */
const pad = (value: number) => String(value).padStart(2, "0");
const tourIndex = (position: number) => `${pad(position + 1)} / ${pad(TOUR_SLUGS.length)}`;

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

/**
 * V8 (§1-§3) -- THE TWO EARLY DUPLICATES ARE GONE.
 *
 * V6.4 staged two "destination surfaces" along the exit traverse: sparse plates
 * carrying the INDEX, HEADING and one-to-three lines of Selected Systems and How
 * I Build, seen from across the world minutes before the reader reached the real
 * sections. They were built honestly -- every word was loaded from the same copy
 * module the real sections render from -- and the owner's verdict on them is
 * still decisive: the page showed each of those two sections twice, the first
 * time almost empty, and no amount of depth staging makes a preview stop being a
 * preview.
 *
 * So the previews are deleted rather than restyled, renamed, compressed or
 * hidden at one breakpoint, and the LATER, content-rich instances in the lower
 * page (components/sections/SelectedSystems.tsx and HowIBuild.tsx) are now the
 * single authoritative versions of both.
 *
 * What went with them, because it existed only to serve them: the
 * DestinationSurface component, the PLANE_DEEP depth plane, and -- this is the
 * §3 requirement, not a bonus -- the 167-unit empty diagonal they were invented
 * to fill. See TURN_WORLD in lib/spatial/scenes.ts.
 */
export function SpatialExperience() {
  const featured = getProjectsByTier("featured");
  const softwareFactory = featured.find((project) => project.slug === TOUR_SLUGS[0]);
  const kivilcim = featured.find((project) => project.slug === TOUR_SLUGS[1]);
  const jointledger = featured.find((project) => project.slug === TOUR_SLUGS[2]);
  const dropspot = featured.find((project) => project.slug === TOUR_SLUGS[3]);
  const beyondTour = featured.filter(
    (project) => !TOUR_SLUGS.some((slug) => slug === project.slug),
  );

  if (!softwareFactory || !kivilcim || !jointledger || !dropspot) {
    // All four are published; this only trips if publication status changes
    // without updating this prototype -- fail loudly rather than silently
    // render a broken tour.
    throw new Error(
      "SpatialExperience requires software-factory, kivilcim, jointledger and dropspot to be published — check content/work/*/index.mdx status",
    );
  }

  return (
    <section aria-label="Spatial system tour">
      <SpatialCamera
        systemsWord={transitionWord}
        // V6.4 (§4A): the real projects the work-route branch points at, from the
        // same loader query the handoff paragraph below uses -- so the branch and
        // the sentence can never name different things -- plus the site's own term
        // for where they live.
        branchDestinations={[...beyondTour.map((project) => project.title), workIndexLabel]}
        // Travel material (§21). The distant plane carries oversized cropped
        // fragments of the REAL titles of the scenes the camera is heading
        // toward -- material derived from the world's own content, never
        // decoration, and aria-hidden because each title is already present
        // as a real link in the scene it names.
        distantMaterial={
          <TravelMaterial
            plane="distant"
            words={[
              // V7: the two NEW stops announce themselves; Kıvılcım and
              // DropSpot keep their existing fragments. Four route-one words
              // across a six-leg route is the same density the two-scene
              // route carried.
              { word: softwareFactory.title, before: "software-factory" },
              { word: kivilcim.title, before: "kivilcim" },
              { word: jointledger.title, before: "jointledger" },
              { word: dropspot.title, before: "dropspot" },
              // Route two's material names a project the tour does NOT stage
              // but the handoff does mention, so the second route carries its
              // own content rather than echoing the giant word already
              // standing at the reposition.
              ...(beyondTour[0]
                ? [{ word: beyondTour[0].title, before: "approach" as const }]
                : []),
              // V6.4 REMOVED the exit traverse's cropped-word fragment that stood
              // here. V6.3 added it to announce the lower world during the long
              // diagonal, which was the right instinct and the wrong object: an
              // oversized crop of "Built for real life" says the words without
              // saying what they are. §4B now stages that same destination as a
              // real surface with its own index, heading and line
              // (DestinationSurface), and the two collided in frame -- measured at
              // progress 0.945, the crop sat directly across the How I Build
              // plate. The better version of the idea replaced the earlier one
              // rather than joining it.
            ]}
          />
        }
        nearMaterial={<TravelMaterial plane="near" words={[]} />}
        // What the observing system may say about each scene (§9, §12). Both
        // entries are built by systemAnnotation() from the project's own
        // validated frontmatter -- there is no slug->copy table here and no
        // field this file invents.
        annotations={{
          // V9 (§17) -- GLOBAL ORIENTATION, WITHOUT A HUD.
          //
          // The brief asks whether a reader can tell where they are after
          // leaving the hero, and explicitly rules out a sticky navbar and
          // "HUD cosplay". The observing system already states a per-scene index
          // in its acquisition frame, so the smallest honest answer is to make
          // that index say how far through the tour it is: "01 / 04" rather than
          // "01". No new element, no new layer, no new vocabulary, and the total
          // is derived from the tour itself so it cannot disagree with the route.
          "software-factory": systemAnnotation(softwareFactory, tourIndex(0)),
          kivilcim: systemAnnotation(kivilcim, tourIndex(1)),
          jointledger: systemAnnotation(jointledger, tourIndex(2)),
          dropspot: systemAnnotation(dropspot, tourIndex(3)),
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
              data-decorative="depth"
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
              {/* V7: renamed from "Selected systems" — that heading now belongs to the
                  lower page's real systems index, and two identical headings were a
                  strict-mode/AT ambiguity. */}
              <h2 className="sr-only">Featured systems</h2>
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
              {/* V9 (§18) -- THE FIRST-INTERACTION CUE.
                  A visitor cannot be expected to know that scrolling enters a
                  spatial route rather than a normal page. The cue is therefore
                  attached to the one element that already answers the question —
                  the structural rule running at the exact bearing the camera is
                  about to travel — and it names what is down there in the
                  world's own vocabulary and from the world's own data. No mouse
                  icon, no bouncing chevron, no "scroll down". It fades on the
                  first movement (see SpatialCamera's `entryCue`) and never
                  returns. */}
              <span
                className="absolute left-0 top-full mt-3 whitespace-nowrap font-mono text-mono-meta tracking-mono-label uppercase text-ink-muted"
                style={{ opacity: "var(--entry-cue, 1)" }}
              >
                Route 01 — {TOUR_COUNT_WORD} systems below
              </span>
            </div>

            <div className="mt-10 lg:ml-[48vw] lg:mt-0">
              <p className="max-w-[26rem] border-l-2 border-ink pl-6 font-display text-heading-l tracking-heading-l uppercase text-ink">
                {heroPrimaryLine}
              </p>
            </div>
          </div>
        }
        software-factory={<SpatialProjectScene project={softwareFactory} variant="foundation" />}
        kivilcim={<SpatialProjectScene project={kivilcim} variant="split" />}
        jointledger={<SpatialProjectScene project={jointledger} variant="counter" />}
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
          // V6.1 (§7): the indent rises from 11vw to 15vw. V6 needed the padding
          // only to keep the depth rail on screen while the break's reveal was
          // still finishing over the scene; now that the decompression interval
          // has moved the arrival clear of the cover entirely
          // (DECOMPRESSION_REACH in scenes.ts), the indent is free to do what §7
          // actually asks -- stage the composition in the middle region of the
          // frame instead of against its left edge -- without losing the rail.
          <div className="w-full lg:pl-[15vw]">
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
            {/* V9 (§P0) FIXED A FACTUAL CONTRADICTION. This line read
                "Kıvılcım and DropSpot are two stops on a larger map" — true when
                the tour staged two projects, and false since V7 staged four. It
                named two of the four systems the reader had just travelled
                through and silently erased Software Factory and JointLedger,
                including the flagship the route deliberately opens on.

                The count is now DERIVED from the tour itself rather than
                retyped, so the sentence cannot go stale again the next time the
                route gains or loses a scene. The approved metaphor is kept
                verbatim; only the arithmetic changed.

                Deliberately not CSS-uppercased: the systems it refers to include
                "Kıvılcım", and text-transform destroys the dotless-ı that D-017
                fixes as that project's primary display name. */}
            <p className="max-w-[44rem] font-display text-display-l tracking-display-l text-ink">
              These are {TOUR_COUNT_WORD} stops on a larger map.
            </p>
            {beyondTour.length > 0 && (
              <p className="mt-4 max-w-[34rem] font-display text-body text-ink-muted">
                {beyondTour.map((project) => project.title).join(" and ")}{" "}
                {beyondTour.length === 1 ? "continues" : "continue"} on the full {workIndexLabel}.
              </p>
            )}
            <div className="mt-10">
              <ButtonLink href="/work">See every system</ButtonLink>
            </div>
          </div>
        }
        surfaceReturn={<SurfaceReturn />}
      />
    </section>
  );
}

/**
 * V9 (§P0) -- THE REGIME CHANGE, MOVED INTO THE FRAME IT EXISTS TO EXPLAIN.
 *
 * THE MEASURED DEFECT. The world's route ends one full viewport before the
 * spatial section does, because the sticky frame has to scroll away after the
 * camera has finished. Through V7 that viewport was occupied: V6.5 deliberately
 * framed a destination surface AT THE ROUTE'S TERMINUS so "the 900px of
 * hand-over is a full frame leaving rather than an empty one". V8 deleted those
 * surfaces as the owner's rejected early duplicates -- correctly -- and nothing
 * replaced them, so the frame they were holding went empty.
 *
 * Measured on the built page at 1536x864 (docs/review/v9-release/metrics): a
 * 360px run in which real content occupied 0.16-0.22% of the viewport, sitting
 * exactly between the handoff scene and "Back on the surface". That is the
 * owner's "space that seems to exist only because the page needed filling",
 * reintroduced by construction.
 *
 * THE FIX IS RELOCATION, NOT DECORATION. This marker already existed; it was
 * simply rendered AFTER the section, which put it below the fold for the whole
 * dead run and then made it the first thing on an otherwise blank screen. It now
 * renders INSIDE the sticky frame, low in the composition, so:
 *
 *   - the world's last frame contains the one event that belongs there -- the
 *     moment the system's route stops being a world and becomes a page;
 *   - it is still on screen while the frame scrolls away, which is precisely the
 *     interval that measured empty;
 *   - it leaves the frame just as the real lower page arrives underneath it,
 *     so the hand-over is continuous rather than a cut to nothing.
 *
 * Nothing was added to the page. The same two rules and the same four words, in
 * the frame that needed them.
 */
function SurfaceReturn() {
  return (
    <div className="mx-auto w-full max-w-[var(--container-max)] px-4 md:px-6 lg:px-8">
      {/* V6.8 (§11): THE REGIME CHANGE, stated so it survives with its label
          removed. Route two is drawn dashed and signal-toned everywhere in the
          world above -- that is its registered grammar. Here that exact line
          arrives from the left, terminates at a junction node, and continues as
          a solid ink editorial rule: the system's route becoming the page's
          rule, in one drawing. Everything below this line uses solid editorial
          rules only; everything above used world grammar. The label is now a
          caption on the event rather than the event. */}
      <div className="relative">
        <div aria-hidden="true" className="flex items-center">
          <span className="block h-0 w-20 border-t border-dashed border-signal opacity-80 lg:w-32" />
          <span className="mx-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
          <span className="block h-px flex-1 bg-ink" />
        </div>
        {/* V9 (§P0): SET AS A STATEMENT, NOT AS A CAPTION. Measured, the moment
            after the route ends holds the frame for ~180px, and through V8 the
            only thing in it was one mono label — about 0.2% of the viewport in
            rendered ink, which is why the interval read as empty even once the
            marker had been moved into it. The words are unchanged and no second
            device was added: the same four words are simply set at the scale of
            the event they name. */}
        <div className="pt-5">
          <p className="font-display text-heading-l tracking-heading-l uppercase text-ink">
            Back on the surface
          </p>
          <p className="mt-2 font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
            The systems, indexed
          </p>
        </div>
      </div>
    </div>
  );
}
