"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { RouteMap } from "@/components/spatial/RouteMap";
import { layerDefinitions } from "@/data/copy";
import {
  CUT_WORLD,
  ROUTE_ONE_IDS,
  ROUTE_TWO_IDS,
  SCENE_IDS,
  TURN_WORLD,
  VW_PER_VH,
  sceneAnchor,
  screenDistance,
  type SceneId,
  type WorldPoint,
} from "@/lib/spatial/scenes";
import {
  decompressionAnchor,
  routeLegs,
  sceneFocusProgress,
  sceneProximity,
  type RouteLeg,
} from "@/lib/spatial/sceneRoute";
import { visibleLegPoints } from "@/lib/spatial/railTravel";
import { worldX, worldY } from "@/lib/spatial/worldFit";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19).
//
// V2's honest remaining weakness was that the space between scenes was
// empty: pacing was right, but there was nothing out there to tell you where
// you had come from or where you were going. This layer answers that WITHOUT
// filling the world with particles or drawing a grid (§10).
//
// V14 (OWNER FINDINGS E AND §16) -- THE ROUTE BECOMES THE WORLD'S SPINE.
//
// What the accepted baseline drew here was a one-pixel polyline per leg at
// 8-20% opacity. On the owner's own zoom-out frames
// (docs/review/v14-owner-visual/baseline/zoom) two project scenes sit at
// opposite corners of a 3840px frame with nothing between them but that
// hairline, which at 50% zoom is half a device pixel: the world read as
// "scattered components on an enormous design canvas" because the one thing
// that connects them was not legible. The brief's instruction is precise --
// do not simply make the line thicker; reconsider how the route states where
// we came from, where we are, what is next, and where the system changes
// state. So the spine now carries STATE, drawn from the camera itself:
//
//   1. TRAVELLED / AHEAD. Every leg is drawn twice: a faint rail for the
//      whole leg (the route exists) and an ink rail revealed along the curve
//      exactly as far as the camera has travelled (`pathLength`, driven by
//      the filtered progress). Behind the reader the route is solid; ahead of
//      them it is a proposal. This also answers the wheel inside a focus
//      zone, where the camera itself barely moves -- the ink keeps advancing
//      along the rail -- which is the job the deleted SystemField was doing
//      with random crosshairs.
//   2. STATIONS. Each scene anchor carries a station mark ON the rail -- a
//      ring, sitting a few units up-route of the anchor so it stands clear of
//      the acquisition frame's corner. Dormant when the scene is far, it
//      resolves as the system acquires the scene, and it stays present once
//      the scene has been passed: a station you have visited is a fact.
//   3. THE SURVEY. Short ticks across the rail at even arc-length, so the
//      route reads as a measured track rather than a stroke, and so that at
//      zoom-out -- where the same ticks are twice as dense per screen -- the
//      spine reads as structure. Not a grid: they exist only on the route.
//   4. STATE CHANGES. The cut is marked where route one ends -- two strokes
//      across the rail's end, the occlusion's own two closing surfaces in
//      miniature -- and route two opens with the world's resolved
//      registration mark at the coordinate the camera is thrown to.
//   5. WEIGHT THAT FOLLOWS THE FRAME. The rail's stroke is `max(1.5px,
//      0.09vw)`: one and a half pixels at every normal viewport, and heavier
//      exactly when the CSS viewport grows -- i.e. when the page is zoomed
//      out and more world is in frame -- so the route gains presence as the
//      map gets larger instead of vanishing into it.
//
// Everything here is decorative and aria-hidden (§24). Nothing in this file
// carries information that is not already stated in real semantic text.
// Mobile keeps its plain vertical hairlines and its corner ticks exactly as
// the V13 mobile gate froze them: the mobile route is one axis and no two
// scenes share a frame there, so it never had the failure this addresses.

type WorldGrammarProps = {
  progress: MotionValue<number>;
  mobile: boolean;
  /**
   * Real project titles the Work index holds, plus the site's own term for it.
   * V14: drawn on the terminus map (RouteMap, `mapped`) as the branch's real
   * names rather than as a separate branch in the world. Empty on mobile.
   */
  branchDestinations?: readonly string[];
};

export function WorldGrammar({ progress, mobile, branchDestinations = [] }: WorldGrammarProps) {
  const legs = routeLegs(mobile);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
      {/* V14.1: the rail group. No per-frame opacity on it any more -- the rail
          no longer runs through compositions (RouteRail draws only the open
          travel), so nothing needs to recede at focus. It still holds SVG
          ONLY, for the D-040 reason: anything written per frame during travel
          is compositor-only or single-paint SVG. Guarded in
          tests/e2e/spatial.spec.ts. */}
      <div data-rail-group="true" className="absolute left-0 top-0">
        {legs.map((leg, index) =>
          mobile ? (
            <MobileRail key={index} leg={leg} progress={progress} />
          ) : (
            <RouteRail key={index} leg={leg} progress={progress} />
          ),
        )}
      </div>

      {!mobile && <StateChanges />}

      {!mobile && <Strata />}

      {!mobile && <TerminusMap branch={branchDestinations} />}

      {/* V14.3 Gate D (owner: "one mark = one semantic meaning"): on desktop
          the four project scenes carry the acquisition frame's brackets at
          the same corner the world's tick registered, so the tick was a second
          top-left corner saying the same thing. The bracket is the mark there;
          the tick stays where nothing else marks the anchor (the hero, SYSTEMS,
          route two) and everywhere on mobile, as the V13 gate froze it. */}
      {SCENE_IDS.filter((id) => mobile || !(id in STATION_INDEX)).map((id) => (
        <RegistrationTick
          key={id}
          at={sceneAnchor(id, mobile)}
          // §25: after the reposition the same grammar is held more strictly.
          // A route-two anchor is only ever seen after the break, so its mark
          // is the resolved form -- a closed corner rather than an open tick.
          strict={ROUTE_TWO_IDS.some((routeTwoId) => routeTwoId === id)}
          id={id}
          progress={progress}
          mobile={mobile}
        />
      ))}

      {!mobile &&
        SCENE_IDS.filter((id) => id !== "hero").map((id) => (
          <Station key={`station-${id}`} id={id} legs={legs} progress={progress} />
        ))}
    </div>
  );
}

/* ------------------------------------------------------------------ rails */

/** The rail's weight, in CSS: hairline-and-a-half at every normal viewport,
 *  and heavier only as the CSS viewport grows past ~1667px -- browser zoom-out,
 *  or a very wide display -- where more of the world is in frame. */
const RAIL_STROKE = "max(1.5px, 0.09vw)";

/**
 * V14.1 (owner: the route "too faint / decorative"; the rail crossing titles)
 * -- THE TRACK: THREE STATES, THREE CONSTRUCTIONS, AND THE RAIL STOPS AT THE
 * STATION.
 *
 * V14 encoded travelled / ahead as two alphas on the same stroke, and drew
 * every leg from anchor to anchor -- which is from a composition's own corner,
 * straight through its title, because the route runs to the block's corner.
 * The attention dim hid the crossing at focus and the difference collapsed at
 * zoom-out, where a 1.5px stroke at 20% is not there.
 *
 * Now each state is a different drawing, which survives any zoom:
 *
 *   AHEAD      a dotted survey -- the route is measured, not yet travelled
 *   TRAVELLED  a solid rail, revealed along the real curve as the camera comes
 *   STATION    the ring on the rail, seven units short of the anchor; it fills
 *              on acquisition and carries the stop's index while the stop is
 *              still ahead (see Station)
 *
 * and the rail is drawn only in the OPEN: from where the previous composition
 * ends (its block measure plus a margin down-route of its anchor) to the next
 * station. Under a composition the ground carries the route (ProjectPlane);
 * the line never runs through a title again, and nothing needs dimming.
 *
 * The survey ticks are gone: with the ahead state itself dotted, a second
 * dotted mark on the same line was texture.
 */
// RAIL_EXIT_X, RAIL_STATION_SETBACK and visibleLegPoints live in
// lib/spatial/railTravel.ts, shared with the e2e guard.

function pathLength(points: WorldPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += screenDistance(points[i - 1]!, points[i]!);
  return total;
}

function legBox(leg: { points: WorldPoint[] }) {
  const xs = leg.points.map((point) => point.x);
  const ys = leg.points.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return {
    left,
    top,
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - top,
  };
}

function legPolyline(leg: { points: WorldPoint[] }, box: ReturnType<typeof legBox>) {
  return leg.points
    .map(
      (point) =>
        ((point.x - box.left) / Math.max(box.width, 1e-6)) * 100 +
        "," +
        ((point.y - box.top) / Math.max(box.height, 1e-6)) * 100,
    )
    .join(" ");
}

/**
 * One travel leg on desktop: the dotted survey of what is ahead, and over it
 * the solid rail of what has been travelled, revealed along the real curve
 * exactly as far as the filtered camera has come.
 *
 * `preserveAspectRatio="none"` lets the box stretch to the leg's exact
 * (non-uniform: vw by vh) geometry, and non-scaling-stroke keeps the stroke a
 * CSS length regardless of that stretch. The polyline is sampled at even arc
 * length (routeLegs), so pathLength fractions map to travelled distance; the
 * survey's dots are measured along the same normalised length.
 */
function RouteRail({ leg, progress }: { leg: RouteLeg; progress: MotionValue<number> }) {
  const visible = visibleLegPoints(leg);
  const box = legBox({ points: visible });
  const points = legPolyline({ points: visible }, box);
  const routeTwo = leg.route === 2;
  // The visible part starts some way into the leg; travelled is measured
  // against that part, so the rail begins revealing when the camera has
  // actually cleared the composition rather than at its anchor.
  const full = pathLength(leg.points);
  const shown = pathLength(visible);
  const before = visible.length
    ? pathLength([...leg.points.filter((p) => p.x < visible[0]!.x), visible[0]!])
    : 0;
  const travelled = useTransform(progress, (value) => {
    const span = leg.toProgress - leg.fromProgress;
    if (span <= 0 || full <= 0 || shown <= 0) return 0;
    const along = Math.min(Math.max((value - leg.fromProgress) / span, 0), 1) * full;
    return Math.min(Math.max((along - before) / shown, 0), 1);
  });
  if (visible.length < 2) return null;

  return (
    <svg
      // V14.3 Gate D: one ink. Route two is told apart by construction --
      // the strata it climbs through, its larger resolved stations -- not by
      // a colour the palette no longer carries.
      className="absolute text-ink"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        left: worldX(box.left),
        top: worldY(box.top),
        width: worldX(Math.max(box.width, 0.01)),
        height: worldY(Math.max(box.height, 0.01)),
        overflow: "visible",
      }}
    >
      {/* AHEAD: the survey. Dots along the normalised path length, so their
          spacing is the same on every leg however the box is stretched. */}
      <path
        data-rail-ahead={leg.route}
        d={"M" + points.split(" ").join(" L")}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        style={{ strokeWidth: RAIL_STROKE }}
        strokeOpacity={routeTwo ? 0.5 : 0.42}
        strokeLinecap="round"
        strokeDasharray="0.002 0.014"
        vectorEffect="non-scaling-stroke"
      />
      {/* TRAVELLED: the rail, a fact behind the reader. */}
      <motion.polyline
        data-rail-travelled={leg.route}
        points={points}
        fill="none"
        stroke="currentColor"
        style={{ strokeWidth: RAIL_STROKE, pathLength: travelled }}
        strokeOpacity={routeTwo ? 0.82 : 0.66}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Mobile legs are purely vertical, so there is no diagonal to draw and the
 *  zero-width SVG box would collapse. The same rail becomes a plain vertical
 *  hairline -- exactly as the V13 mobile gate froze it. */
function MobileRail({ leg, progress }: { leg: RouteLeg; progress: MotionValue<number> }) {
  const opacity = useTransform(
    progress,
    [leg.fromProgress, leg.toProgress],
    leg.route === 1 ? [0.08, 0.2] : [0.18, 0.4],
  );
  const box = legBox(leg);
  return (
    <motion.div
      className="absolute w-px bg-ink"
      style={{ left: worldX(box.left), top: worldY(box.top), height: worldY(box.height), opacity }}
    />
  );
}

/* --------------------------------------------------------------- stations */

/**
 * A station: a ring on the rail, a few units up-route of the scene anchor so
 * it stands clear of the acquisition frame's top-left bracket. Dormant while
 * the scene is far, resolved as the system acquires it, and it stays present
 * once passed -- the path behind the reader is a fact, not a proposal.
 */
const STATION_SETBACK = 7;

function stationPoint(id: SceneId, legs: RouteLeg[]): WorldPoint {
  const anchor = sceneAnchor(id);
  // The leg that ENDS on this anchor: walk back along it by the setback.
  const leg = legs.find(
    (candidate) =>
      Math.abs(candidate.points[candidate.points.length - 1]!.x - anchor.x) < 1e-6 &&
      Math.abs(candidate.points[candidate.points.length - 1]!.y - anchor.y) < 1e-6,
  );
  if (!leg) return anchor;
  let remaining = STATION_SETBACK;
  for (let i = leg.points.length - 1; i > 0; i -= 1) {
    const a = leg.points[i]!;
    const b = leg.points[i - 1]!;
    const step = Math.hypot((b.x - a.x) * VW_PER_VH, b.y - a.y);
    if (step >= remaining) {
      const t = step > 0 ? remaining / step : 0;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= step;
  }
  return leg.points[0]!;
}

/** The station's index on route one: the same "01".."04" the acquisition
 *  frame states at focus and the terminus map draws, so one stop has one name
 *  everywhere it appears. Route two's stops are not counted: they are the
 *  system's own framework, not cases. */
const STATION_INDEX: Partial<Record<SceneId, string>> = {
  "software-factory": "01",
  kivilcim: "02",
  jointledger: "03",
  dropspot: "04",
};

/** A station's diameter: 10px at every normal viewport and growing with the
 *  CSS viewport past ~1900px, so at 67% and 50% zoom the stops stay legible
 *  as stops instead of shrinking to device-pixel specks. */
const STATION_SIZE = "max(10px, 0.52vw)";
const STATION_SIZE_RESOLVED = "max(12px, 0.62vw)";

function Station({
  id,
  legs,
  progress,
}: {
  id: SceneId;
  legs: RouteLeg[];
  progress: MotionValue<number>;
}) {
  const at = stationPoint(id, legs);
  const focus = sceneFocusProgress(id);
  const resolved = ROUTE_TWO_IDS.some((routeTwoId) => routeTwoId === id);
  const opacity = useTransform(progress, (value) => {
    const near = sceneProximity(id, value);
    const passed = value > focus ? 0.7 : 0;
    return Math.max(0.42, near * 0.95, passed);
  });
  // The ring fills as the scene is acquired: an open coordinate becomes a
  // visited one. Scale only, on a 10px element -- no text is involved.
  const fill = useTransform(progress, (value) => Math.max(0, sceneProximity(id, value)));
  // V14.1 -- DETECTED, stated at the station. The stop's index is legible
  // beside the ring while the stop is still ahead or already behind, and
  // hands over to the acquisition frame's "Case 01 / 04" exactly as the
  // system acquires the scene: the same fact, stated by the station in
  // travel and by the frame at focus, never by both at once.
  const label = STATION_INDEX[id];
  const labelOpacity = useTransform(progress, (value) => {
    const near = sceneProximity(id, value);
    return 0.9 * Math.max(0, 1 - near * 1.6);
  });
  const size = resolved ? STATION_SIZE_RESOLVED : STATION_SIZE;

  return (
    <>
      <motion.span
        data-route-station={id}
        className="absolute block -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink"
        style={{
          left: worldX(at.x),
          top: worldY(at.y),
          width: size,
          height: size,
          opacity,
        }}
      >
        <motion.span
          className="absolute inset-[18%] block rounded-full bg-ink"
          style={{ scale: fill }}
        />
      </motion.span>
      {label && (
        <motion.span
          data-route-station-index={id}
          className="absolute block whitespace-nowrap font-mono text-mono-label tracking-mono-label text-ink"
          style={{
            left: worldX(at.x),
            top: worldY(at.y),
            marginLeft: "calc(" + STATION_SIZE + " * 0.9)",
            marginTop: "calc(" + STATION_SIZE + " * -2.4)",
            opacity: labelOpacity,
          }}
        >
          {label}
        </motion.span>
      )}
    </>
  );
}

/* ---------------------------------------------------------- state changes */

/**
 * Where the system changes state. Route one ends at the cut: two short
 * strokes across the rail's end -- the occlusion's own two closing surfaces,
 * in miniature. Route two opens at the coordinate the camera is thrown to:
 * the world's resolved registration mark, the same closed corner its anchors
 * carry, at the point where the journey is picked up again.
 */
function StateChanges() {
  const cut = CUT_WORLD;
  const landing = decompressionAnchor();
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute block"
        style={{ left: worldX(cut.x), top: worldY(cut.y) }}
      >
        <span className="absolute block h-4 w-px bg-ink opacity-60" style={{ left: -1, top: -8 }} />
        <span className="absolute block h-4 w-px bg-ink opacity-60" style={{ left: 3, top: -8 }} />
      </span>
      <span
        aria-hidden="true"
        className="absolute block"
        style={{ left: worldX(landing.x), top: worldY(landing.y) }}
      >
        <span className="absolute left-0 top-0 block h-px w-6 bg-ink opacity-70" />
        <span className="absolute left-0 top-0 block h-6 w-px bg-ink opacity-70" />
        <span className="absolute left-1.5 top-1.5 block h-px w-2.5 bg-ink opacity-50" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------ the terminus */

/**
 * V14 (owner findings D, E) -- THE LAST FRAME OF THE WORLD IS THE MAP.
 *
 * The route ends on the handover turn, a camera-only coordinate 52 units past
 * the handoff, so the frame the world hands over from never contained the
 * scene that stated "these are four stops on a larger map": on the baseline it
 * contained nothing but the surface-return marker (V9's own measurement was
 * 0.16-0.22% rendered content). The map now stands in the world at the turn,
 * so the camera literally travels onto it as its final move -- the sentence
 * at the handoff points down-route at the map arriving from the frame's lower
 * right, the terminus frames it whole, and the page then opens with the index
 * of the same stations. The lower world begins where the map ends.
 *
 * The RouteMap draws two route polylines and the branch's third; with the
 * ten travelled rails and two base rails that is fifteen polylines in the
 * frame, inside the sparse-structure bound (tests/e2e/spatial.spec.ts).
 */
const TERMINUS_MAP_OFFSET: WorldPoint = { x: 28, y: -14 };
const TERMINUS_MAP_WIDTH_VW = 60;

function TerminusMap({ branch }: { branch: readonly string[] }) {
  const at = { x: TURN_WORLD.x + TERMINUS_MAP_OFFSET.x, y: TURN_WORLD.y + TERMINUS_MAP_OFFSET.y };
  const stations = ROUTE_ONE_IDS.filter((id) => id !== "hero" && id !== "tail").map(
    (id, index) => ({ id, index: String(index + 1).padStart(2, "0") }),
  );
  return (
    <span
      aria-hidden="true"
      data-terminus-map="true"
      className="absolute block"
      style={{ left: worldX(at.x), top: worldY(at.y), width: worldX(TERMINUS_MAP_WIDTH_VW) }}
    >
      <RouteMap state="mapped" stations={stations} branch={branch} className="w-full" />
    </span>
  );
}

/* ------------------------------------------------------------------ strata */

/**
 * V14 (owner finding C) -- THE STRATA ROUTE TWO CLIMBS THROUGH.
 *
 * The reveal at SYSTEMS shows three layers with the route descending through
 * them; the camera is then thrown to the world's lowest point. For UNDERNEATH
 * to be the CONSEQUENCE of that rather than the next section, the layers have
 * to still be there when the reader lands. So the three strata run across
 * route two's world, on the world plane, at the depths of its three scenes:
 * UNDERNEATH stands on SYSTEM, Built in Layers on FLOW, the handoff on
 * SURFACE -- and the surface return that follows is literally that. Each band
 * is labelled once, beside the scene that stands on it, with the real layer
 * name. Static hairlines; nothing animates.
 */
// Far enough left that no zoom level the owner reviews (down to 50%) sees the
// bands or the recess begin: a hairline that starts mid-paper is an edge, and
// an edge is a panel.
const STRATA_FROM_VW = -260;
const STRATA_TO_VW = 400;
const STRATA_SCENES: readonly SceneId[] = ["handoff", "approach", "reorient"];

/**
 * V14.1 (owner: UNDERNEATH "a sparse title after the climax"; the sequence
 * must be one causal event) -- THE BANDS ARE FLOORS, AND THE WORLD HAS ONE
 * HORIZON.
 *
 * V14 drew each band six units ABOVE its scene's anchor, so every route-two
 * composition HUNG from a hairline at the top of its frame and the deepest
 * point of the world was made of the same paper as the surface. The cut's own
 * frame does the opposite -- the word SYSTEMS stands with its foot on the
 * SURFACE line -- and the landing broke that rule the moment it mattered.
 *
 * Three moves, one convention:
 *
 *   FEET, NOT CEILINGS. Each band now sits at the foot of its composition's
 *   display line (measured on the built page at 1440x900: the reorient word,
 *   the approach heading, the handoff sentence), so UNDERNEATH stands on
 *   SYSTEM, Built in Layers on FLOW and the handoff on SURFACE, with the
 *   label INSIDE the band below the line, as the reveal already draws it.
 *
 *   ONE SURFACE HORIZON. The SURFACE band's foot lands at y = 563 -- which is
 *   the cut's own y (CUT_WORLD). So the surface line is extended under all of
 *   route one: the evidence descent is a descent TOWARD the surface line, the
 *   cut opens it exactly where the route reaches it, and at zoom-out route one
 *   finally has a ground under it rather than paper.
 *
 *   THE RECESS IS WORLD MATERIAL. Below the surface line, across route two,
 *   the ground is one shade darker -- the 2.5% ink the opened surface already
 *   shows inside the cut, now the actual floor the reader lands on. Static,
 *   one element, on the world plane.
 */
const STRATA_FOOT_VH: Record<string, number> = { handoff: 15, approach: 31, reorient: 42 };
// To just before the SYSTEMS station: from there the opened surface's own
// section drawing (SystemsWord's RevealedStructure) owns the strata, and a
// second surface line running through it read as a fourth, unlabelled band.
const SURFACE_HORIZON_TO_VW = 760;
const RECESS_DEPTH_VH = 320;
// The recess runs under the whole surface line, to the cut's far side, and
// dissolves over its last stretch: at 50% zoom a recess that stopped at the
// strata's own right edge showed as a hard vertical boundary in mid-paper --
// a panel again. Below the surface is recess everywhere the surface exists.
const RECESS_TO_VW = 960;
const RECESS_FADE_VW = 140;

function Strata() {
  const surfaceY = sceneAnchor("handoff").y + STRATA_FOOT_VH.handoff!;
  return (
    <>
      {/* The recess: the ground below the surface, across route two. */}
      <span
        aria-hidden="true"
        data-recess="true"
        className="absolute block bg-[rgba(22,22,22,0.025)]"
        style={{
          left: worldX(STRATA_FROM_VW),
          top: worldY(surfaceY),
          width: worldX(RECESS_TO_VW - STRATA_FROM_VW),
          height: worldY(RECESS_DEPTH_VH),
          WebkitMaskImage: `linear-gradient(to right, rgba(0,0,0,0), #000 ${worldX(RECESS_FADE_VW)}, #000 calc(100% - ${worldX(RECESS_FADE_VW)}), rgba(0,0,0,0) 100%)`,
          maskImage: `linear-gradient(to right, rgba(0,0,0,0), #000 ${worldX(RECESS_FADE_VW)}, #000 calc(100% - ${worldX(RECESS_FADE_VW)}), rgba(0,0,0,0) 100%)`,
        }}
      />
      {STRATA_SCENES.map((id, index) => {
        const anchor = sceneAnchor(id);
        const layer = layerDefinitions[index]!;
        const y = anchor.y + (STRATA_FOOT_VH[id] ?? 0);
        const surface = index === 0;
        return (
          <span key={id} aria-hidden="true" data-stratum={layer.label.toLowerCase()}>
            <span
              className="absolute block h-px bg-ink"
              style={{
                left: worldX(STRATA_FROM_VW),
                top: worldY(y),
                width: worldX((surface ? SURFACE_HORIZON_TO_VW : STRATA_TO_VW) - STRATA_FROM_VW),
                opacity: 0.2 + index * 0.06,
              }}
            />
            <span
              className="absolute block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
              style={{ left: worldX(anchor.x - 5.6), top: worldY(y), marginTop: 8 }}
            >
              {layer.label}
            </span>
          </span>
        );
      })}
    </>
  );
}

/* ---------------------------------------------------------- registration */

/**
 * A corner tick registering a scene's anchor in the world. Offset up and left
 * of the scene block so it never sits on top of scene content.
 *
 * `strict` is the post-collision form (§25): the same two strokes, drawn
 * longer, at higher contrast, and closed by a short second mark inset from the
 * corner. The world has not changed theme -- it is being measured more
 * carefully.
 */
function RegistrationTick({
  at,
  id,
  progress,
  mobile,
  strict = false,
}: {
  at: WorldPoint;
  id: SceneId;
  progress: MotionValue<number>;
  mobile: boolean;
  strict?: boolean;
}) {
  const arm = strict ? "w-10" : "w-7";
  const drop = strict ? "h-10" : "h-7";

  // V6.1: dormant -> resolved, on this scene's own proximity. Dormant is well
  // below V6's flat value, so the difference between "a coordinate exists here"
  // and "the system has this coordinate" is visible; resolved lands slightly
  // above it, so acquisition reads as the mark firming up rather than lighting
  // up.
  const settled = strict ? 0.6 : 0.46;
  const opacity = useTransform(progress, (value) => {
    const near = sceneProximity(id, value, mobile);
    return 0.07 + (settled - 0.07) * Math.max(0, near);
  });

  return (
    <motion.div
      className="absolute"
      style={{ left: worldX(at.x - 1.6), top: worldY(at.y - 4.5), opacity }}
    >
      <span className={`absolute left-0 top-0 block h-px ${arm} bg-ink`} />
      <span className={`absolute left-0 top-0 block w-px ${drop} bg-ink`} />
      {strict && <span className="absolute left-1.5 top-1.5 block h-px w-3 bg-ink" />}
    </motion.div>
  );
}
