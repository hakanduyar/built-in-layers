import type { CSSProperties } from "react";
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
  workIndexLabel,
} from "@/data/copy";
import { getProjectsByTier } from "@/lib/content/work";
import { heroLeadRule } from "@/lib/spatial/sceneRoute";
import { systemAnnotation } from "@/lib/spatial/systemPov";
import { WORLD_UNIT } from "@/lib/spatial/worldFit";

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

/**
 * V13 (Fable art direction) -- THE HERO'S OWN UNIT, and the clip that made it
 * necessary. The rule's origin, its length and the thesis column were composed
 * in raw `vw` inside a scene block that stops growing at 1180px (SCENE_WIDTH),
 * so above the reference desktop the offsets kept growing while the block did
 * not. Measured on the frozen stills: at 1920x1080 the thesis line began at
 * 48vw = 922px and was clipped mid-word by the block edge
 * (docs/review/v12-codex-gate/responsive/1920x1080--hero.png); at 2560x1440 it
 * began 49px OUTSIDE the block and did not render at all, and the lead rule was
 * cut short (responsive/2560x1440--hero.png); at 80% zoom on a 1920 display
 * only its 2px left border survived at the block edge as an orphan stroke
 * (zoom/2400x1350@80--hero.png). The site's primary line was being cut on
 * every display wider than ~1600px, and in the reduced-motion tree too, which
 * shares this markup.
 *
 * The unit is exactly `1vw` up to 1536 -- the widest approved viewport, and the
 * widest at which 48vw plus the 26rem column still fit inside the block -- so
 * every approved 1366/1440/1536 frame is pixel-identical. Above it the hero
 * holds the composition it was approved at, exactly as the rest of the world
 * does (WORLD_UNIT). The rule's rise takes the world's own vertical unit so
 * that, with its run capped, the rule keeps pointing along the first travel
 * leg instead of steepening with the frame.
 */
const HERO_UNIT = { x: "min(1vw, 15.36px)", y: WORLD_UNIT.y } as const;
const heroX = (vw: number) => `calc(${vw} * ${HERO_UNIT.x})`;
const heroY = (vh: number) => `calc(${vh} * ${HERO_UNIT.y})`;

/** Where the lead rule leaves the wordmark, in hero units. The thesis column
 *  registers on the rule's far end, so its x is derived from the rule rather
 *  than retyped as the 48 it happens to equal. */
const HERO_RULE_ORIGIN_VW = 30;
const HERO_THESIS_X = heroX(HERO_RULE_ORIGIN_VW + HERO_LEAD.width);

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
        // V6.4 (§4A) / V14: the real projects the Work index holds, from the
        // same loader query the handoff sentence uses -- so the map and the
        // sentence can never name different things -- plus the site's own term
        // for where they live. V14 draws them on the terminus map at the end of
        // the route (WorldGrammar's TerminusMap) instead of on a branch beside
        // the handoff.
        branchDestinations={[...beyondTour.map((project) => project.title), workIndexLabel]}
        // V14 (owner findings A, §8) REMOVED THE TRAVEL MATERIAL. The distant
        // plane carried five oversized crops of real project titles, placed
        // 55% along the leg into each scene, and the near plane seven
        // hairline rules. On the accepted baseline's own frames
        // (docs/review/v14-owner-visual/baseline/stills) every project frame
        // showed one or two of those crops cut mid-letter by the frame edge --
        // "IVIL", "JOIN", "DRO", "ROFES" -- behind the composition it was meant
        // to announce, and at 50% zoom they sat in the empty diagonal between
        // two scenes as the only thing there. They duplicated identity, filled
        // empty space and cropped by accident, which is the owner's list of
        // reasons to remove background typography, verbatim. What the space
        // between scenes now carries instead is structural: the route as a
        // stated topology (WorldGrammar) and each project's context plane
        // (ProjectPlane). Nothing decorative replaces them.
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
          <div key="hero" className="relative w-full overflow-clip">
            {/* V14 (§8) REMOVED the hero's oversized "Surface" ghost. Set at
                22vw and pushed 26vh above the composition, what actually
                rendered at every desktop viewport was a band of descenders
                across the top of the frame -- a smudge, not a word (baseline
                still 1440x900--hero.png). The world's three state words are
                SURFACE, SYSTEMS and UNDERNEATH; the last two are set whole and
                legible, and the first is stated in full, in ink, by the thesis
                line in this same frame. A cropped duplicate of it added noise
                where the journey begins. */}

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
              className="relative hidden lg:block"
              style={{
                marginLeft: heroX(HERO_RULE_ORIGIN_VW),
                width: heroX(HERO_LEAD.width),
                height: heroY(HERO_LEAD.height),
              }}
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

            <div
              className="mt-10 lg:ml-[var(--hero-thesis-x)] lg:mt-0"
              style={{ "--hero-thesis-x": HERO_THESIS_X } as CSSProperties}
            >
              <p className="max-w-[26rem] border-l-2 border-ink pl-6 font-display text-heading-l tracking-heading-l uppercase text-ink">
                {heroPrimaryLine}
              </p>
            </div>
          </div>
        }
        software-factory={
          <SpatialProjectScene
            key="software-factory"
            project={softwareFactory}
            variant="foundation"
          />
        }
        kivilcim={<SpatialProjectScene key="kivilcim" project={kivilcim} variant="split" />}
        jointledger={
          <SpatialProjectScene key="jointledger" project={jointledger} variant="counter" />
        }
        dropspot={<SpatialProjectScene key="dropspot" project={dropspot} variant="stacked" />}
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
          // V14 (owner finding C, §19): the composition sits lower in its
          // frame on desktop. It used to hang from the frame's top with the
          // blurred chevrons filling the rest; with those gone, the deepest
          // point of the world read as a word in a corner over 75% paper. The
          // word now stands in the middle third, under the SYSTEM stratum the
          // world draws above it, with the statement below -- the negative
          // space around it is the bottom of the world, and it is composed
          // rather than left over.
          // V14.1 (owner §12): lower again -- the word's foot now stands ON the
          // SYSTEM stratum (WorldGrammar's Strata draws the band at the
          // composition's foot), at mid-frame, with the depth rail's descent
          // above it as the visible consequence of the cut. 16vh -> 28vh.
          <div key="reorient" className="w-full lg:pl-[15vw] lg:pt-[28vh]">
            <div className="relative pl-8">
              <span
                aria-hidden="true"
                className="absolute left-0 block w-px bg-line"
                style={{ top: `${DEPTH_RAIL_TOP}vh`, height: `${-DEPTH_RAIL_TOP}vh` }}
              />
              {/* V14 (owner finding C): the three layer labels that hung on
                  this rail are gone. The strata now run across route two's
                  world as bands the scenes stand on (WorldGrammar's Strata),
                  each labelled once beside its scene, so the same three words
                  were being stated twice in one frame. The rail itself stays:
                  it is the descent from the surface the camera just left. On
                  phones, where the bands do not render, the marks stay. */}
              {layerDefinitions.map((layer, index) => (
                <span
                  key={layer.label}
                  aria-hidden="true"
                  className="absolute left-0 flex items-center gap-3 lg:hidden"
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
          // V14 (§19): the same vertical placement as UNDERNEATH -- the
          // definitions sit in the frame's middle band under the FLOW stratum,
          // not against its top edge with 60% of the frame empty below.
          // V14.1: the heading stands on the FLOW stratum at mid-frame; the
          // three definitions sit inside the stratum beneath it. 12vh -> 20vh.
          <div key="approach" className="w-full lg:pt-[20vh]">
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
          //
          // V14 (owner finding D): "These are four stops on a larger map" was
          // a sentence with nothing beside it -- the baseline frame is 70%
          // paper -- and the owner's reading was that it is "too small for
          // the travel it consumes". The map it names now stands in the world
          // at the route's end (WorldGrammar's TerminusMap): it enters this
          // frame from the lower right as the sentence is read, and the
          // camera's last move is onto it. The sentence points at a thing the
          // reader then arrives at.
          <div key="handoff" className="w-full">
            {/* V9 (§P0): the count is DERIVED from the tour itself rather than
                retyped, so the sentence cannot go stale when the route gains or
                loses a scene. Deliberately not CSS-uppercased: the systems it
                refers to include "Kıvılcım" (D-017). */}
            <p className="max-w-[44rem] font-display text-display-l tracking-display-l text-ink">
              These are {TOUR_COUNT_WORD} stops on a larger map.
            </p>
            {beyondTour.length > 0 && (
              <p className="mt-4 max-w-[34rem] font-display text-body-l text-ink-muted">
                {beyondTour.map((project) => project.title).join(" and ")}{" "}
                {beyondTour.length === 1 ? "continues" : "continue"} on the full {workIndexLabel}.
              </p>
            )}
            <div className="mt-10">
              {/* V13 (mobile gate, M4): 50px in world space is 44.6-49.8px on
                  screen at every tested width. `max-lg:` only. */}
              <ButtonLink href="/work" className="max-lg:min-h-12.5">
                See every system
              </ButtonLink>
            </div>
          </div>
        }
        surfaceReturn={<SurfaceReturn key="surface-return" />}
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
  // V14.1 (owner §5, §13): the junction stands on the LOWER RAIL'S DATUM. The
  // dashed signal route arrives from the frame's left edge, terminates at the
  // node exactly where the lower page's rail will descend (EditorialDrift's
  // --drift-pad: 3vw, 4vw at lg), and continues right as the page's solid
  // rule. One event, and the rail below is literally its continuation.
  return (
    <div className="mx-auto w-full max-w-[var(--container-max)] px-4 md:px-6 lg:relative lg:mx-0 lg:max-w-none lg:pl-[4vw] lg:pr-8">
      {/* V6.8 (§11): THE REGIME CHANGE, stated so it survives with its label
          removed. Route two is drawn dashed and signal-toned everywhere in the
          world above -- that is its registered grammar. Here that exact line
          arrives from the left, terminates at a junction node, and continues as
          a solid ink editorial rule: the system's route becoming the page's
          rule, in one drawing. Everything below this line uses solid editorial
          rules only; everything above used world grammar. The label is now a
          caption on the event rather than the event. */}
      <div className="relative">
        <div aria-hidden="true" className="relative flex items-center">
          <span className="block h-0 w-20 border-t border-dashed border-signal opacity-80 lg:absolute lg:right-full lg:top-1/2 lg:w-[4vw] lg:-translate-y-1/2" />
          <span className="mx-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-ink lg:mx-0 lg:-translate-x-1/2" />
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
