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
  type SceneId,
  type WorldPoint,
} from "@/lib/spatial/scenes";
import {
  decompressionAnchor,
  focusProximity,
  routeLegs,
  sceneFocusProgress,
  sceneProximity,
  type RouteLeg,
} from "@/lib/spatial/sceneRoute";
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
  // V14: the spine recedes while the system has a scene in frame. The rails
  // pass THROUGH every composition -- the route runs to each anchor, which is
  // the block's own corner -- so at full presence the travelled rail was a
  // line drawn across the title being read. focusProximity is 1 exactly at a
  // scene and 0 in open travel; the rail is at full weight where there is
  // nothing else to look at and a quarter of it under a composition.
  const attention = useTransform(progress, (value) => 1 - 0.74 * focusProximity(value, mobile));

  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
      <motion.div
        className="absolute left-0 top-0"
        style={mobile ? undefined : { opacity: attention }}
      >
        {/* The route exists: each route as ONE continuous faint rail, with its
            survey ticks in the same SVG. One polyline per route rather than per
            leg, because the legs of a route are contiguous and the world's
            sparse-structure contract counts polylines inside the frame
            (tests/e2e/spatial.spec.ts).

            This group holds SVG ONLY. Its opacity is written every frame the
            camera moves, and Chromium repaints everything under it each time:
            ninety absolutely positioned tick spans in here cost ~8ms a frame on
            the reverse traverse (tests/tools/frame-time-probe.mjs), and the
            governor pays per frame, so the whole route ran a third slower. The
            same group with only the twelve rail SVGs is free. Guarded in
            tests/e2e/spatial.spec.ts. */}
        {!mobile &&
          ([1, 2] as const).map((route) => <RouteBase key={route} route={route} legs={legs} />)}
        {legs.map((leg, index) =>
          mobile ? (
            <MobileRail key={index} leg={leg} progress={progress} />
          ) : (
            <RouteRail key={index} leg={leg} progress={progress} />
          ),
        )}
      </motion.div>

      {!mobile && <StateChanges />}

      {!mobile && <Strata />}

      {!mobile && <TerminusMap branch={branchDestinations} />}

      {SCENE_IDS.map((id) => (
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

function legBox(leg: RouteLeg) {
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

function legPolyline(leg: RouteLeg, box: ReturnType<typeof legBox>) {
  return leg.points
    .map(
      (point) =>
        `${((point.x - box.left) / Math.max(box.width, 1e-6)) * 100},${
          ((point.y - box.top) / Math.max(box.height, 1e-6)) * 100
        }`,
    )
    .join(" ");
}

/** A whole route, faint: the route exists, ahead and behind alike. */
function RouteBase({ route, legs }: { route: 1 | 2; legs: RouteLeg[] }) {
  const own = legs.filter((leg) => leg.route === route);
  const all: WorldPoint[] = own.flatMap((leg, index) =>
    index === 0 ? leg.points : leg.points.slice(1),
  );
  if (all.length < 2) return null;
  const box = legBox({ points: all, fromProgress: 0, toProgress: 1, route });
  const points = legPolyline({ points: all, fromProgress: 0, toProgress: 1, route }, box);
  const routeTwo = route === 2;
  return (
    <svg
      className={`absolute ${routeTwo ? "text-signal" : "text-ink"}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        left: worldX(box.left),
        top: worldY(box.top),
        width: worldX(box.width),
        height: worldY(box.height),
        overflow: "visible",
      }}
    >
      <polyline
        data-rail-base={route}
        points={points}
        fill="none"
        stroke="currentColor"
        style={{ strokeWidth: RAIL_STROKE }}
        strokeOpacity={routeTwo ? 0.3 : 0.2}
        vectorEffect="non-scaling-stroke"
        strokeDasharray={routeTwo ? "7 9" : undefined}
      />
      <path
        data-rail-survey={route}
        d={surveyPath(own, box)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeOpacity={routeTwo ? 0.34 : 0.26}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * One travel leg on desktop: the travelled part of it in ink, revealed along
 * the real curve exactly as far as the filtered camera has come.
 *
 * `preserveAspectRatio="none"` lets the box stretch to the leg's exact
 * (non-uniform: vw by vh) geometry, and `non-scaling-stroke` keeps the stroke
 * a CSS length regardless of that stretch. The polyline is sampled at even arc
 * length (routeLegs), so `pathLength` fractions map to travelled distance.
 */
function RouteRail({ leg, progress }: { leg: RouteLeg; progress: MotionValue<number> }) {
  const box = legBox(leg);
  const points = legPolyline(leg, box);
  const routeTwo = leg.route === 2;
  const travelled = useTransform(progress, (value) => {
    const span = leg.toProgress - leg.fromProgress;
    if (span <= 0) return 0;
    return Math.min(Math.max((value - leg.fromProgress) / span, 0), 1);
  });

  return (
    <svg
      className={`absolute ${routeTwo ? "text-signal" : "text-ink"}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        left: worldX(box.left),
        top: worldY(box.top),
        width: worldX(box.width),
        height: worldY(box.height),
        overflow: "visible",
      }}
    >
      <motion.polyline
        data-rail-travelled={leg.route}
        points={points}
        fill="none"
        stroke="currentColor"
        style={{ strokeWidth: RAIL_STROKE, pathLength: travelled }}
        strokeOpacity={routeTwo ? 0.78 : 0.6}
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
      className={`absolute w-px ${leg.route === 1 ? "bg-ink" : "bg-signal"}`}
      style={{ left: worldX(box.left), top: worldY(box.top), height: worldY(box.height), opacity }}
    />
  );
}

/* ----------------------------------------------------------------- survey */

/** Half a tick, in the route's vh measure: a 1.1vh mark, the ten CSS pixels
 *  the V14 span drew at 1440x900, now scaling with the world like the rest of
 *  the route drawing does. */
const SURVEY_HALF = 0.55;

/** Cross-ticks along a route at even arc length: the route as a measured track.
 *  Every second sample of the eighteen each leg is drawn from, so nine per leg
 *  -- dense enough to read as a track at zoom-out, sparse enough never to read
 *  as a ruler at focus. Each tick is set square to the route's local bearing,
 *  measured between its neighbouring samples in the same screen measure the
 *  route's own angles use.
 *
 *  One path per route, drawn inside the base rail's SVG, rather than one
 *  positioned span per tick: see the attention group's note in WorldGrammar.
 *  The perpendicular is taken in screen measure (x scaled by VW_PER_VH) and
 *  brought back to world units, exactly as the span's rotate() did. */
function surveyPath(legs: RouteLeg[], box: ReturnType<typeof legBox>): string {
  const px = (x: number) => ((x - box.left) / Math.max(box.width, 1e-6)) * 100;
  const py = (y: number) => ((y - box.top) / Math.max(box.height, 1e-6)) * 100;
  const parts: string[] = [];
  for (const leg of legs) {
    const points = leg.points;
    for (let i = 2; i < points.length - 1; i += 2) {
      const before = points[i - 1]!;
      const after = points[i + 1]!;
      const at = points[i]!;
      const angle = Math.atan2(after.y - before.y, (after.x - before.x) * VW_PER_VH);
      const dx = (-Math.sin(angle) * SURVEY_HALF) / VW_PER_VH;
      const dy = Math.cos(angle) * SURVEY_HALF;
      parts.push(
        `M${px(at.x - dx).toFixed(3)} ${py(at.y - dy).toFixed(3)}L${px(at.x + dx).toFixed(3)} ${py(
          at.y + dy,
        ).toFixed(3)}`,
      );
    }
  }
  return parts.join("");
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
    const passed = value > focus ? 0.62 : 0;
    return Math.max(0.24, near * 0.9, passed);
  });
  // The ring fills as the scene is acquired: an open coordinate becomes a
  // visited one. Scale only, on a 10px element -- no text is involved.
  const fill = useTransform(progress, (value) => Math.max(0, sceneProximity(id, value)));
  const size = resolved ? 12 : 10;

  return (
    <motion.span
      data-route-station={id}
      className={`absolute block rounded-full border ${resolved ? "border-signal" : "border-ink"}`}
      style={{
        left: worldX(at.x),
        top: worldY(at.y),
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        opacity,
      }}
    >
      <motion.span
        className={`absolute inset-[2px] block rounded-full ${resolved ? "bg-signal" : "bg-ink"}`}
        style={{ scale: fill }}
      />
    </motion.span>
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
        <span className="absolute left-0 top-0 block h-px w-6 bg-signal opacity-70" />
        <span className="absolute left-0 top-0 block h-6 w-px bg-signal opacity-70" />
        <span className="absolute left-1.5 top-1.5 block h-px w-2.5 bg-signal opacity-50" />
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
const TERMINUS_MAP_OFFSET: WorldPoint = { x: 8, y: 1 };
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
const STRATA_FROM_VW = -60;
const STRATA_TO_VW = 400;
const STRATA_SCENES: readonly SceneId[] = ["handoff", "approach", "reorient"];

function Strata() {
  return (
    <>
      {STRATA_SCENES.map((id, index) => {
        const anchor = sceneAnchor(id);
        const layer = layerDefinitions[index]!;
        const y = anchor.y - 6;
        return (
          <span key={id} aria-hidden="true" data-stratum={layer.label.toLowerCase()}>
            <span
              className="absolute block h-px bg-ink"
              style={{
                left: worldX(STRATA_FROM_VW),
                top: worldY(y),
                width: worldX(STRATA_TO_VW - STRATA_FROM_VW),
                opacity: 0.16 + index * 0.06,
              }}
            />
            <span
              className="absolute block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
              style={{ left: worldX(anchor.x - 1.6), top: worldY(y), marginTop: -22 }}
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
