// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). Pure route/camera math, no JSX, no
// "use client" -- unit-testable in isolation (tests/unit/spatial-route.test.ts).
//
// V3's route was piecewise: dwell at an anchor (velocity exactly zero), then
// ease across to the next one. Measured, that produced 29 distinct camera
// positions across 900 frames, a median response of 0.00 camera px per scroll
// px, and 1276px of dead scroll followed by bursts 24x the local rate.
//
// V4 replaced it with a continuous curve and a continuous speed profile:
//
//   1. POSITION continuity -- one Catmull-Rom spline per route, passing
//      exactly through every scene anchor. Tangents are shared between
//      adjacent segments, so direction never kinks at a join.
//   2. SPEED continuity -- each segment is allocated scroll in proportion to
//      (distance travelled + a fixed reading allowance), and each segment's
//      easing is solved so that its speed at BOTH ends equals one shared
//      constant. Joins therefore match in speed as well as position, which is
//      what stops a join from reading as "one easing ended, another started".
//   3. FOCUS AS SLOWNESS, NOT STOPPING -- that shared boundary constant is a
//      fraction of the route's average speed, not zero. A scene is where the
//      camera is slowest, never where it is parked.
//
// V5 adds the piece V4's own report listed as a remaining weakness:
//
//   4. ARC-LENGTH REPARAMETERISATION (§5). A Catmull-Rom curve's parameter is
//      not proportional to distance along it, so under V4 equal scroll bought
//      unequal physical travel depending only on how the curve happened to
//      bend. Each segment now carries a cumulative distance table built once at
//      module load; the easing produces a DISTANCE fraction, and the table maps
//      that to the curve parameter.
//
//      This cleanly separates the two things §6 asks to be separated:
//        - GEOMETRY NORMALISATION is the arc-length table;
//        - the FOCUS VELOCITY PROFILE is the Hermite easing on top of it.
//
//      It also simplifies the easing. Camera speed is now exactly
//      L · e'(t) / width, with L the segment's true arc length, so one shared
//      boundary speed is hit exactly at both ends by a single symmetric
//      derivative. V4 needed asymmetric ends to compensate for the curve's
//      own tangent-magnitude variation; that compensation is gone, and the
//      speed profile inside every ordinary segment is now symmetric -- which
//      is the property the unit tests assert.
//
// The one intentional exception is the CUT: the route jumps discontinuously at
// a single progress, behind a frame that is genuinely opaque at that instant.
//
// V6.4 RETIRED THE COLLISION MODEL AROUND THAT CUT. Through V6.3 the same
// discontinuity was wrapped in a physical event -- an accelerating approach, a
// wall, a 0.062-wide impact window in which the camera did not advance at all,
// and a rectified damped rebound inside it. All of that is gone. What is left is
// the smallest thing that can express "the route changes here": both sides of the
// cut run at the same travelling speed, so the camera is moving when the surfaces
// close and moving when they open, and nothing in the route model claims anything
// was struck.
//
// The concrete simplification, for the record: `COLLISION_PROGRESS` and
// `BREAK_CUT` were two constants that now have to be one, `AVAILABLE` is no longer
// discounted by an impact window, `cameraPosition` has two branches instead of
// three, and `reboundShape`, `collisionRebound`, `approachUnit`, `isImpact` and
// `approachTension` no longer exist.

import {
  BREAK_COVER_LEAD,
  BREAK_DWELL,
  BREAK_GUARD_LEAD,
  BREAK_REVEAL_TAIL,
  CUT_MOBILE_WORLD,
  CUT_WORLD,
  DECOMPRESSION_REACH,
  ENTRY_ALLOWANCE,
  ENTRY_MOBILE_WORLD,
  ENTRY_WORLD,
  EXIT_ALLOWANCE,
  FOCUS_ALLOWANCE,
  FOCUS_SPEED_RATIO,
  ROUTE_ONE_IDS,
  ROUTE_TWO_IDS,
  SCENE_ALLOWANCE,
  TRAVEL_ALLOWANCE,
  TRAVEL_SPEED_RATIO,
  TRAVEL_WEIGHT_RATIO,
  TURN_MOBILE_WORLD,
  TURN_WORLD,
  VW_PER_VH,
  sceneAnchor,
  screenDistance,
  type SceneId,
  type WorldPoint,
} from "@/lib/spatial/scenes";

export type { SceneId, WorldPoint };

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/* ------------------------------------------------------------------ curve */

/**
 * Catmull-Rom through p1..p2, using p0/p3 as neighbours for the tangents.
 * Interpolating (not approximating), so scene anchors are hit exactly, and
 * C1-continuous, because adjacent segments derive the tangent at a shared
 * anchor from the same two neighbours.
 */
function catmullRom(
  p0: WorldPoint,
  p1: WorldPoint,
  p2: WorldPoint,
  p3: WorldPoint,
  t: number,
): WorldPoint {
  const t2 = t * t;
  const t3 = t2 * t;
  const axis = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: axis(p0.x, p1.x, p2.x, p3.x), y: axis(p0.y, p1.y, p2.y, p3.y) };
}

/** Phantom neighbour for an endpoint: reflect so the end tangent points
 *  straight along the first/last segment instead of curling. */
function reflect(inner: WorldPoint, outer: WorldPoint): WorldPoint {
  return { x: 2 * inner.x - outer.x, y: 2 * inner.y - outer.y };
}

/* ------------------------------------------------------ arc-length lookup */

/**
 * Samples per segment for the cumulative distance table.
 *
 * V6.1 RAISED THIS FROM 64 TO 256, and it is a correctness fix rather than a
 * refinement. The table is inverted by linear interpolation between samples
 * (see arcParam), so its accuracy depends on how nonlinear `travelled(t)` is --
 * i.e. on how much the curve's tangent MAGNITUDE varies along a segment. Every
 * segment through V6 had a fairly even tangent, and 64 samples left the error
 * far below a pixel.
 *
 * The decompression lead-in does not: its end tangent is 2.77x its own chord
 * (the phantom reflection at a route start, followed immediately by a much
 * longer leg), so `travelled(t)` is steep near t=1 and one 1/64 interval spans
 * a large share of the segment's length. Linearly interpolating across that
 * interval misplaced the camera enough to break the world's C1 speed contract
 * by 4% at the `reorient` join -- analytically the profile was exact (every
 * segment solves to the same 499.9 boundary speed), the TABLE was the thing that
 * was wrong. Caught by tests/unit/spatial-route.test.ts, and it converged rather
 * than shrinking with the probe's step size, which is what proved it was a real
 * error and not a measurement artifact.
 *
 * Interpolation error falls as O(1/N^2), so 256 samples takes that 4% to roughly
 * 0.25%. Cost is a one-time module-load computation of ~3.6k curve evaluations
 * across both viewport modes.
 */
const ARC_SAMPLES = 256;

type ArcTable = {
  /** Fraction of the segment's length reached at parameter i/ARC_SAMPLES. */
  travelled: number[];
  /** True arc length, in the same screen measure as screenDistance. */
  length: number;
};

function buildArcTable(p0: WorldPoint, p1: WorldPoint, p2: WorldPoint, p3: WorldPoint): ArcTable {
  const cumulative: number[] = [0];
  let total = 0;
  let previous = catmullRom(p0, p1, p2, p3, 0);
  for (let i = 1; i <= ARC_SAMPLES; i += 1) {
    const point = catmullRom(p0, p1, p2, p3, i / ARC_SAMPLES);
    total += screenDistance(previous, point);
    cumulative.push(total);
    previous = point;
  }
  const length = Math.max(total, 1e-6);
  return { travelled: cumulative.map((value) => value / length), length: total };
}

/**
 * Inverse lookup: distance fraction -> curve parameter. Binary search plus
 * linear interpolation inside the bracketing pair, which is all this needs --
 * the table is dense enough that the residual error is far below a pixel.
 *
 * The two ends are returned exactly, so the curve still passes through every
 * scene anchor to full precision (§5.4).
 */
function arcParam(table: ArcTable, distanceFraction: number): number {
  const target = clamp01(distanceFraction);
  if (target <= 0) return 0;
  if (target >= 1) return 1;
  const { travelled } = table;
  let lo = 0;
  let hi = travelled.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (travelled[mid]! <= target) lo = mid;
    else hi = mid;
  }
  const low = travelled[lo]!;
  const high = travelled[hi]!;
  const within = high > low ? (target - low) / (high - low) : 0;
  return (lo + within) / ARC_SAMPLES;
}

/* ------------------------------------------------------- speed profiling */

/**
 * Cubic Hermite easing with independent end derivatives, mapping normalised
 * scroll within a segment to a FRACTION OF THE SEGMENT'S LENGTH.
 *
 *   e(0) = 0, e(1) = 1, e'(0) = a0, e'(1) = a1
 *   e(t) = a0·t + (3 - 2a0 - a1)·t² + (a0 + a1 - 2)·t³
 *
 * Because the output is a distance fraction (arc-length reparameterisation
 * turns it into a curve parameter afterwards), camera speed is exactly
 * L · e'(t) / width. Every ordinary segment therefore uses a0 = a1 and its
 * speed profile is symmetric; only the collision approach sets them apart, and
 * it does so deliberately, to accelerate into the wall.
 *
 * e' is never zero for a0, a1 > 0, which is the whole point: no plateau.
 */
function hermiteEase(t: number, a0: number, a1: number): number {
  const t2 = t * t;
  return a0 * t + (3 - 2 * a0 - a1) * t2 + (a0 + a1 - 2) * t2 * t;
}

/* -------------------------------------------------------- route assembly */

type Segment = {
  /** Control points for this segment's Catmull-Rom evaluation. */
  p0: WorldPoint;
  p1: WorldPoint;
  p2: WorldPoint;
  p3: WorldPoint;
  /** Cumulative distance table: the geometry-normalisation half of §6. */
  arc: ArcTable;
  from: number;
  to: number;
  /** Easing derivatives at each end, solved so joins match in speed. */
  a0: number;
  a1: number;
};

type RouteTable = {
  segments: Segment[];
  /** Progress at which the camera is exactly on each anchor. */
  focus: Partial<Record<SceneId, number>>;
};

/** Catmull-Rom control quads for a polyline, with reflected phantom ends. */
function segmentControls(points: WorldPoint[]) {
  return points.slice(1).map((_, i) => ({
    p0: i === 0 ? reflect(points[0]!, points[1]!) : points[i - 1]!,
    p1: points[i]!,
    p2: points[i + 1]!,
    p3:
      i + 2 < points.length
        ? points[i + 2]!
        : reflect(points[points.length - 1]!, points[points.length - 2]!),
  }));
}

/**
 * TRUE arc lengths, not chords. V4 allocated scroll by the straight distance
 * between anchors, which under-served the segments that bend most -- the
 * curve's own detour was unpaid for. Allocating by arc length is the first
 * half of §6: normalise the geometry, then shape the velocity.
 */
function arcTables(points: WorldPoint[]): ArcTable[] {
  return segmentControls(points).map((c) => buildArcTable(c.p0, c.p1, c.p2, c.p3));
}

/**
 * Both routes are built together because the boundary speed is shared across
 * ALL segments: a join inside route one and a join inside route two run at
 * the same camera speed, so the two routes feel like one world rather than
 * two differently-paced sequences.
 */
/**
 * V9 (§4): the reading allowance each ROUTE POINT carries, parallel to the point
 * arrays below. Camera-only coordinates (the entry beat, the cut, the exit turn,
 * the decompression lead-in) carry `null` -- their segments are weighted as
 * travel and never consult this. See SCENE_ALLOWANCE in scenes.ts.
 */
function pointAllowances(): { one: (number | null)[]; two: (number | null)[] } {
  const of = (id: SceneId) => SCENE_ALLOWANCE[id] ?? FOCUS_ALLOWANCE;
  const [heroId, ...restOne] = ROUTE_ONE_IDS;
  return {
    // [hero, ENTRY, ...rest, cut] -- mirrors `routePoints` exactly.
    one: [of(heroId!), null, ...restOne.map(of), null],
    // [lead-in, ...route two scenes, turn]
    two: [null, ...ROUTE_TWO_IDS.map(of), null],
  };
}

function routePoints(mobile: boolean) {
  const cut = mobile ? CUT_MOBILE_WORLD : CUT_WORLD;
  // V6.7 (JOB 1): the acquisition descent sits between the hero and Kivilcim, so
  // route one's points are [hero, ENTRY, ...rest, cut]. Camera-only, exactly like
  // the cut and the exit traverse -- which is why the scene->point mapping below is
  // explicit rather than positional.
  const entry = mobile ? ENTRY_MOBILE_WORLD : ENTRY_WORLD;
  const [heroAnchor, ...restOne] = ROUTE_ONE_IDS.map((id) => sceneAnchor(id, mobile));
  const one = [heroAnchor!, entry, ...restOne, cut];
  const scenesTwo = ROUTE_TWO_IDS.map((id) => sceneAnchor(id, mobile));
  // V6.1: route two is led into rather than started on. See
  // DECOMPRESSION_REACH in scenes.ts for why.
  // V6.3: and it is led OUT of rather than stopped on -- the exit.
  // V8 (§3): that exit is now ONE camera-only coordinate rather than two. The
  // diagonal that used to sit between `handoff` and the turn existed to carry
  // the two destination-surface previews, and went with them.
  const two = [decompressionAnchor(mobile), ...scenesTwo, mobile ? TURN_MOBILE_WORLD : TURN_WORLD];
  return { one, two };
}

/**
 * How many segments at the END of route two carry no scene (V6.3): the exit.
 * They are weighted at the travel rate rather than the reading rate -- see
 * TRAVEL_ALLOWANCE in scenes.ts.
 *
 * V8 (§3): 2 -> 1. The exit is now the handover turn alone.
 */
export const EXIT_SEGMENTS = 1;

/**
 * How many segments at the START of route one carry no scene (V6.7): the acquisition
 * descent. Weighted at the travel rate for the same reason the exit traverse is --
 * reading allowance buys time to look at something, and there is nothing standing on
 * this leg. It is the beat before the journey, not a stop on it.
 */
export const ENTRY_SEGMENTS = 1;

/**
 * The coordinate the collision throws the camera to (V6.1).
 *
 * Placed back along the reorient->approach direction, so travelling from it into
 * `reorient` continues smoothly into the leg that follows -- deriving it from the
 * route rather than authoring a point means the decompression cannot introduce a
 * kink, and cannot describe a direction the camera does not then take.
 *
 * It is also, deliberately, the deepest point in the world: route one ends by
 * running out of evidence, and the reposition drops BELOW the depth it will then
 * climb back through. The world's lowest coordinate is where "underneath" is
 * argued from.
 */
export function decompressionAnchor(mobile = false): WorldPoint {
  const reorient = sceneAnchor("reorient", mobile);
  const approach = sceneAnchor("approach", mobile);
  return {
    x: reorient.x - (approach.x - reorient.x) * DECOMPRESSION_REACH,
    y: reorient.y - (approach.y - reorient.y) * DECOMPRESSION_REACH,
  };
}

/**
 * Progress available to actual route travel.
 *
 * V6.4: all of it. Through V6.3 this was `1 - IMPACT_WINDOW` -- 6.2% of the page's
 * scroll was reserved for a window in which the camera did not advance along the
 * route at all. That reservation is what made ROUTE_LENGTH_VH have to be 474 to
 * keep route one's pacing; with it gone, 445 buys the identical camera speed.
 */
const AVAILABLE = 1;

/**
 * Scroll weight of ONE segment: distance travelled + reading allowance.
 *
 * V6.3 splits this by whether a scene stands on the segment. A travel leg is
 * charged TRAVEL_WEIGHT_RATIO of its length plus the smaller TRAVEL_ALLOWANCE,
 * so the camera crosses it faster; a scene leg is unchanged from V6.2.
 */
function segmentWeight(table: ArcTable, kind: SegmentKind, allowance = FOCUS_ALLOWANCE): number {
  if (kind === "entry") return table.length * TRAVEL_WEIGHT_RATIO + ENTRY_ALLOWANCE;
  if (kind === "exit") return table.length * TRAVEL_WEIGHT_RATIO + EXIT_ALLOWANCE;
  return kind === "travel"
    ? table.length * TRAVEL_WEIGHT_RATIO + TRAVEL_ALLOWANCE
    : table.length + allowance;
}

/**
 * V9 (§4): the reading allowance for the segment joining points `i` and `i+1` --
 * the larger of the two anchors', so a leg leaving a dense scene is paid at that
 * scene's rate rather than diluted toward its neighbour's. Camera-only
 * coordinates contribute nothing.
 */
function segmentAllowances(points: (number | null)[]): number[] {
  return points.slice(0, -1).map((value, i) => {
    const pair = [value, points[i + 1] ?? null].filter((v): v is number => v !== null);
    return pair.length ? Math.max(...pair) : FOCUS_ALLOWANCE;
  });
}

type SegmentKind = "scene" | "travel" | "entry" | "exit";

/** What each segment of a run is: the first `leadCount` are the entry beat, the
 *  last `exitCount` are the exit, everything between carries a scene. */
function segmentKinds(count: number, exitCount: number, leadCount = 0): SegmentKind[] {
  return Array.from({ length: count }, (_, i) =>
    i < leadCount ? "entry" : i >= count - exitCount ? "exit" : "scene",
  );
}

/** Scroll weight of a run of segments. */
function routeWeight(
  tables: ArcTable[],
  exitCount = 0,
  leadCount = 0,
  allowances?: number[],
): number {
  const kinds = segmentKinds(tables.length, exitCount, leadCount);
  return tables.reduce(
    (sum, table, i) => sum + segmentWeight(table, kinds[i]!, allowances?.[i]),
    0,
  );
}

/**
 * Where route one ends, shared by BOTH viewport modes.
 *
 * The split has to be mode-independent: it is the progress at which the
 * collision happens, and the break panel, the impact flag and the erosion
 * all key off it. Deriving it per mode (an earlier pass did) left mobile's
 * route two starting later than the shared cut, so between the two the mobile
 * camera sat parked for 0.05 of progress -- exactly the dead zone V4 exists
 * to remove, reintroduced by accident and caught by a speed scan.
 */
const SPLIT = (() => {
  const { one, two } = routePoints(false);
  // V9 (§4): the split now reflects per-scene reading allowance, so route one's
  // share of progress grows with the density of the scenes standing on it.
  const allow = pointAllowances();
  const oneWeight = routeWeight(arcTables(one), 0, ENTRY_SEGMENTS, segmentAllowances(allow.one));
  const twoWeight = routeWeight(arcTables(two), EXIT_SEGMENTS, 0, segmentAllowances(allow.two));
  return (AVAILABLE * oneWeight) / (oneWeight + twoWeight);
})();

function buildRoutes(mobile: boolean): { one: RouteTable; two: RouteTable } {
  const { one: onePoints, two: twoPoints } = routePoints(mobile);
  const oneArcs = arcTables(onePoints);
  const twoArcs = arcTables(twoPoints);

  const cut = SPLIT;
  const available = AVAILABLE;

  const sum = (tables: ArcTable[]) => tables.reduce((s, table) => s + table.length, 0);
  const totalLength = sum(oneArcs) + sum(twoArcs);
  // One shared boundary speed for the entire world, expressed in world units
  // per unit progress.
  const focusSpeed = FOCUS_SPEED_RATIO * (totalLength / available);
  /** Boundary speed at a join with no scene on it (V6.3). */
  const travelSpeed = TRAVEL_SPEED_RATIO * (totalLength / available);

  /**
   * V6.4 -- THE CUT RUNS AT TRAVELLING SPEED ON BOTH SIDES.
   *
   * Through V6.3 route one's last boundary was a special case: `approachExitSpeed`,
   * 1.35x the route average, because the camera was supposed to be building into a
   * wall. Route two then began at reading speed, because it began on a scene's
   * segment. So the two halves of the same instant disagreed about how fast the
   * world was moving by more than 3x -- which is correct for a collision and wrong
   * for an occlusion.
   *
   * An occlusion cut is not an event in the world; it is an event in what the
   * reader can SEE of the world. So the world's own speed is deliberately
   * CONTINUOUS across it even though its position is not: the camera is travelling
   * at exactly the same rate on the last visible frame before the surfaces close
   * and the first visible frame after they open. That is the whole difference
   * between "the journey was interrupted" and "the journey was stopped".
   *
   * It also deletes a special case rather than adding one -- `lastIsApproach` is
   * gone, and both routes now run through the same boundary-speed rule with an
   * explicit override at the two ends that meet at the cut.
   */
  const assemble = (
    points: WorldPoint[],
    arcs: ArcTable[],
    from: number,
    to: number,
    exitCount = 0,
    ends: { start?: number; end?: number } = {},
    leadCount = 0,
    allowances?: number[],
  ) => {
    const controls = segmentControls(points);
    const kinds = segmentKinds(arcs.length, exitCount, leadCount);
    const weightTotal = routeWeight(arcs, exitCount, leadCount, allowances);
    const span = to - from;

    const bounds: number[] = [from];
    let cursor = from;
    for (const [i, arc] of arcs.entries()) {
      cursor += (span * segmentWeight(arc, kinds[i]!, allowances?.[i])) / weightTotal;
      bounds.push(cursor);
    }
    bounds[bounds.length - 1] = to; // kill float drift so the last anchor is exact

    // V6.3: the speed a JOIN runs at depends on whether a scene stands on it.
    // Boundary `i` sits before segment `i`; the ones at or past the start of the
    // exit run have no scene, so they run at travelSpeed rather than decelerating
    // to reading speed at a coordinate with nothing to read.
    const sceneBoundaries = controls.length - exitCount;
    const boundarySpeed = (index: number) => {
      if (index === 0 && ends.start !== undefined) return ends.start;
      if (index === controls.length && ends.end !== undefined) return ends.end;
      // V6.7: the boundaries that CLOSE a leading travel segment carry no scene
      // either -- the acquisition descent ends on a camera-only coordinate, so
      // decelerating to reading speed there would park the camera at a point with
      // nothing standing on it, which is exactly the stop/go V4 exists to remove.
      if (index >= 1 && index <= leadCount) return travelSpeed;
      return index > sceneBoundaries ? travelSpeed : focusSpeed;
    };

    return controls.map((control, i): Segment => {
      const arc = arcs[i]!;
      const width = bounds[i + 1]! - bounds[i]!;

      // With the curve reparameterised by arc length, camera speed is exactly
      //   speed(t) = L · e'(t) / width
      // so the derivative for a target boundary speed is a plain ratio, and it
      // is the same expression at both ends. No tangent magnitudes involved --
      // that is what makes the profile symmetric and the joins exact.
      const solve = (target: number) =>
        Math.min(Math.max((target * width) / arc.length, 0.06), 1.9);

      return {
        ...control,
        arc,
        from: bounds[i]!,
        to: bounds[i + 1]!,
        a0: solve(boundarySpeed(i)),
        a1: solve(boundarySpeed(i + 1)),
      };
    });
  };

  // V9 (§4): the same per-scene allowances the SPLIT is derived from, so the
  // segment bounds inside each route agree with the share the route was given.
  const allow = pointAllowances();
  const oneSegments = assemble(
    onePoints,
    oneArcs,
    0,
    cut,
    0,
    { end: travelSpeed },
    ENTRY_SEGMENTS,
    segmentAllowances(allow.one),
  );
  const twoSegments = assemble(
    twoPoints,
    twoArcs,
    cut,
    1,
    EXIT_SEGMENTS,
    { start: travelSpeed },
    0,
    segmentAllowances(allow.two),
  );

  /**
   * Where each scene is framed.
   *
   * V6.7 REPLACED THE UNIFORM `skip` WITH AN EXPLICIT INDEX. Both routes now
   * interleave camera-only coordinates with scene anchors -- route one is
   * [hero, ENTRY, ...rest, cut] and route two is [lead-in, ...scenes, traverse,
   * descent] -- so "scene i is framed where segment i+skip begins" is no longer
   * true of route one at all. Passing the mapping in means a future camera-only
   * point cannot silently shift every scene's focal progress by one segment.
   */
  const focusOf = (
    ids: readonly SceneId[],
    segments: Segment[],
    pointIndex: (i: number) => number,
  ): Partial<Record<SceneId, number>> =>
    Object.fromEntries(
      ids.map((id, i) => {
        const at = pointIndex(i);
        return [id, segments[at]?.from ?? segments[at - 1]?.to ?? 0];
      }),
    );

  return {
    // Route one: the hero is segment 0's start; every later scene sits one segment
    // further along than its index, because the acquisition descent is between them.
    one: {
      segments: oneSegments,
      focus: focusOf(ROUTE_ONE_IDS, oneSegments, (i) => (i === 0 ? 0 : i + ENTRY_SEGMENTS)),
    },
    // V6.3: `handoff` no longer needs a special case. Through V6.2 it was route
    // two's LAST point, so no segment began at it and its focus had to be read
    // off the final segment's `to`; the exit traverse now starts there, so the
    // ordinary "scene i is framed where segment i+1 begins" rule covers it -- and
    // the route ends at a coordinate with no scene on it, which is the point.
    two: { segments: twoSegments, focus: focusOf(ROUTE_TWO_IDS, twoSegments, (i) => i + 1) },
  };
}

const DESKTOP = buildRoutes(false);
const MOBILE = buildRoutes(true);

/**
 * The route's one discontinuity, hidden behind full cover. Derived, not authored.
 *
 * V6.4: this is now a single number where V6.3 had two. `COLLISION_PROGRESS` was
 * where the camera hit the wall and `BREAK_CUT` was IMPACT_WINDOW later, where the
 * route jumped. With no impact between them they are the same instant, and every
 * consumer that used to have to know which of the two it meant now cannot get it
 * wrong.
 */
export const BREAK_CUT = SPLIT;
export const BREAK_COVER_START = BREAK_CUT - BREAK_COVER_LEAD;
export const BREAK_REVEAL_END = BREAK_CUT + BREAK_REVEAL_TAIL;
/** The only fully-covered window: see BREAK_DWELL in scenes.ts. */
export const BREAK_COVER_CLOSED = BREAK_CUT - BREAK_DWELL;
export const BREAK_REVEAL_START = BREAK_CUT + BREAK_DWELL;

/**
 * THE PROTECTED BAND -- the span of progress whose traversal is rate-limited so
 * the occlusion cannot collapse under a fast wheel burst (see BREAK_PLAYBACK_MS
 * in cameraFilter.ts). Kept from V6.2/V6.3, because it is the one part of this
 * region the V6.4 brief explicitly asks to preserve.
 *
 * It opens BREAK_GUARD_LEAD before the surfaces begin to close, so the protected
 * window starts on visible world rather than on the first frame of ink, and closes
 * when the surfaces have finished opening.
 */
export const BREAK_GUARD_FROM = Math.max(BREAK_COVER_START - BREAK_GUARD_LEAD, 0);
export const BREAK_GUARD_TO = BREAK_REVEAL_END;

/**
 * Where the OPENING GLIDE ZONE ends (V6.8): the end of the acquisition descent
 * plus a 30% blend into the leg that bends toward Kivilcim, so the speed governor
 * releases inside the bend rather than exactly at the anchor. Derived from the
 * route's own segment bounds -- re-weight the entry and this moves with it.
 * See GLIDE_MAX_RATE in cameraFilter.ts for what reads it and why.
 */
export const ENTRY_GLIDE_TO = (() => {
  const segment = DESKTOP.one.segments[ENTRY_SEGMENTS - 1];
  if (!segment) return 0;
  return segment.to + (segment.to - segment.from) * 0.3;
})();

/** V7 (mobile audit fix): the glide boundary derived from the route table the
 *  camera is actually running. The old constant was desktop-only, so mobile's
 *  opening glide released at a progress value from a geometry it never runs. */
export function entryGlideTo(mobile = false): number {
  if (!mobile) return ENTRY_GLIDE_TO;
  const segment = MOBILE.one.segments[ENTRY_SEGMENTS - 1];
  if (!segment) return 0;
  return segment.to + (segment.to - segment.from) * 0.3;
}

function tables(mobile: boolean) {
  return mobile ? MOBILE : DESKTOP;
}

/** Progress at which a scene is exactly framed. */
export function sceneFocusProgress(id: SceneId, mobile = false): number {
  const { one, two } = tables(mobile);
  return one.focus[id] ?? two.focus[id] ?? 0;
}

function evaluate(segments: Segment[], progress: number): WorldPoint | null {
  for (const segment of segments) {
    if (progress > segment.to) continue;
    const width = segment.to - segment.from;
    const t = width > 0 ? clamp01((progress - segment.from) / width) : 0;
    // The ends are returned as the control points themselves rather than as
    // the polynomial's value there. Algebraically they are the same point, but
    // neither the easing nor the cubic lands exactly on it in floating point,
    // and "the curve passes exactly through every scene anchor" (§5.4) is a
    // contract worth holding exactly rather than to within a few ulps.
    if (t <= 0) return segment.p1;
    if (t >= 1) return segment.p2;
    // Two distinct steps, in this order (§6): the easing decides HOW FAR ALONG
    // the segment the camera should be, and the arc table decides which curve
    // parameter that distance corresponds to.
    const travelled = hermiteEase(t, segment.a0, segment.a1);
    return catmullRom(
      segment.p0,
      segment.p1,
      segment.p2,
      segment.p3,
      arcParam(segment.arc, travelled),
    );
  }
  return null;
}

/**
 * Camera world-position at a given scroll progress. Continuous in position and
 * in speed everywhere except at the cut, where position jumps and speed does not.
 *
 * V6.4 removed the middle branch. Through V6.3 there was a third case between
 * these two -- the impact window, where the camera was pinned to the wall and
 * displaced by a rebound function. Two branches is the honest shape of "one route,
 * then another route".
 */
export function cameraPosition(progress: number, mobile = false): WorldPoint {
  const p = clamp01(progress);
  const { one, two } = tables(mobile);

  if (p >= BREAK_CUT) {
    return evaluate(two.segments, p) ?? sceneAnchor("handoff", mobile);
  }
  return evaluate(one.segments, p) ?? sceneAnchor("hero", mobile);
}

/** Which scene currently owns the camera. */
export function currentSceneId(progress: number, mobile = false): SceneId {
  const p = clamp01(progress);
  const ids = p >= BREAK_CUT ? ROUTE_TWO_IDS : ROUTE_ONE_IDS;
  let closest: SceneId = ids[0]!;
  let best = Number.POSITIVE_INFINITY;
  for (const id of ids) {
    const distance = Math.abs(p - sceneFocusProgress(id, mobile));
    if (distance < best) {
      best = distance;
      closest = id;
    }
  }
  return closest;
}

/**
 * 0..1 proximity of the camera to a scene's focal progress, used for arrival
 * depth resolution: 1 exactly on the anchor, falling to 0 by the time the
 * neighbouring anchor owns the frame.
 */
export function sceneProximity(id: SceneId, progress: number, mobile = false): number {
  return 1 - Math.abs(sceneApproach(id, progress, mobile));
}

/**
 * SIGNED position of the camera relative to a scene: -1 still on the way in,
 * 0 exactly framed, +1 already gone. V5's system annotations need the sign --
 * an acquisition frame that behaved identically on approach and on departure
 * would read as a decoration attached to the scene rather than as something
 * watching the camera arrive and let go (§10).
 */
export function sceneApproach(id: SceneId, progress: number, mobile = false): number {
  const focus = sceneFocusProgress(id, mobile);
  const { one, two } = tables(mobile);
  const segments = [...one.segments, ...two.segments];
  // Reach is the shorter of the two adjacent segment widths, so a scene's
  // resolution window never bleeds past its neighbours.
  let reach = Number.POSITIVE_INFINITY;
  for (const segment of segments) {
    if (Math.abs(segment.from - focus) < 1e-9 || Math.abs(segment.to - focus) < 1e-9) {
      reach = Math.min(reach, segment.to - segment.from);
    }
  }
  if (!Number.isFinite(reach) || reach <= 0) return 1;
  const offset = (clamp01(progress) - focus) / reach;
  return Math.min(Math.max(offset, -1), 1);
}

/**
 * Horizontal offset of the break's base ink field, in percent of its own
 * width. Linear on purpose -- every rail runs a faster curve, so this field
 * closes last and guarantees full cover at the cut.
 */
export function breakWipeOffset(progress: number): number {
  const p = clamp01(progress);
  if (p <= BREAK_COVER_START) return 100;
  if (p >= BREAK_REVEAL_END) return -100;
  if (p <= BREAK_COVER_CLOSED) {
    // The highest hang-back exponent of anything in the break: this is a
    // full-frame solid, so it is the single largest black mass on the page and
    // it must not be seen crossing the viewport. It arrives essentially at the
    // last moment, purely to guarantee opacity through the dwell.
    const t = (p - BREAK_COVER_START) / (BREAK_COVER_CLOSED - BREAK_COVER_START);
    return 100 * (1 - t ** 6);
  }
  if (p <= BREAK_REVEAL_START) return 0;
  // Leaves immediately and fast, so no residue sits over the world the camera
  // has been thrown to (§6).
  const t = (p - BREAK_REVEAL_START) / (BREAK_REVEAL_END - BREAK_REVEAL_START);
  return -100 * (1 - (1 - t) ** 2.6);
}

/**
 * Horizontal offset of one break rail. Rails alternate the side they close
 * from and run different power curves, so the coordinate system reads as
 * snapping shut rather than being swiped over. Every curve passes through
 * exactly 0 at BREAK_CUT, so no gap can expose the route's discontinuity.
 */
export function breakBandOffset(progress: number, index: number): number {
  const p = clamp01(progress);
  const direction = index % 2 === 0 ? 1 : -1;
  // V6.1 INVERTED BOTH CURVES.
  //
  // V6 closed with `(1 - t) ** speed`, whose derivative at t=0 is -speed: the
  // rail's fastest travel was its FIRST travel, so measured 6% into the cover
  // window each rail already had ~121px of solid ink inside the frame, and the
  // black was at near-full mass for the entire window. That is the "large black
  // rectangles entering the viewport" percept.
  //
  // `1 - t ** close` is the mirror image: the rail hangs off-frame while the
  // boundary is still the thing being looked at, then snaps home. And the reveal
  // is `1 - (1 - t) ** leave`, which departs immediately instead of lingering
  // over the world beyond the break.
  const close = 3.8 + ((index * 3) % 4) * 0.55;
  const leave = 2.4 + ((index * 5) % 3) * 0.4;

  if (p <= BREAK_COVER_START) return direction * 100;
  if (p >= BREAK_REVEAL_END) return -direction * 100;
  if (p <= BREAK_COVER_CLOSED) {
    const t = (p - BREAK_COVER_START) / (BREAK_COVER_CLOSED - BREAK_COVER_START);
    return direction * 100 * (1 - t ** close);
  }
  // The dwell: every rail is exactly home, so the cut is genuinely unwitnessed.
  if (p <= BREAK_REVEAL_START) return 0;
  const t = (p - BREAK_REVEAL_START) / (BREAK_REVEAL_END - BREAK_REVEAL_START);
  return -direction * 100 * (1 - (1 - t) ** leave);
}

/**
 * PERCEPTION (V6.1, §15-16): how strongly the system currently has something in
 * frame. 0 in open travel, 1 with a scene exactly framed.
 *
 * This is the one value the environment reads to decide how much of itself to
 * show. It exists because V6 had all the perception DATA it needed --
 * `sceneApproach` has returned a signed acquisition state since V5 -- and spent
 * none of it: the only consumer was SystemPOV's own frame, so the world around a
 * scene behaved identically whether the system was looking at something or at
 * nothing. §16's "irrelevant environmental lines may recede" and "other world
 * noise decreases" are both just this number, negated.
 *
 * Deliberately NOT a new visual element. §18 caps the global density of marks;
 * this makes the marks already present behave hierarchically instead of adding
 * more of them.
 */
export function focusProximity(progress: number, mobile = false): number {
  let best = 0;
  for (const id of [...ROUTE_ONE_IDS, ...ROUTE_TWO_IDS]) {
    best = Math.max(best, 1 - Math.abs(sceneApproach(id, progress, mobile)));
  }
  return clamp01(best);
}

/* ------------------------------------------------------- the exit traverse */

/** Progress at which the exit traverse begins -- i.e. where `handoff` is framed
 *  and the camera leaves it for the lower world. */
export const EXIT_FROM = sceneFocusProgress("handoff");

/** Where the handover turn begins. Route two's last segment starts here; the
 *  route ends at 1.
 *
 *  V8: with the exit reduced to that single turn, this is now equal to
 *  EXIT_FROM by construction. It is kept as its own name -- derived, not
 *  aliased -- because the work-route branch and the lower page both read "where
 *  the exit's last leg starts", and that stops being the same coordinate the
 *  moment anything is ever added back to the exit. */
export const EXIT_TURN = (() => {
  const segments = DESKTOP.two.segments;
  return segments[segments.length - 1]?.from ?? 1;
})();

/**
 * 0..1 across the whole exit traverse. The lower world's own staging reads this,
 * so "we are still travelling" and "we have arrived at the lower page" are one
 * value rather than two effects that happen to overlap.
 */
export function exitTravel(progress: number): number {
  const p = clamp01(progress);
  if (p <= EXIT_FROM) return 0;
  return clamp01((p - EXIT_FROM) / (1 - EXIT_FROM));
}

/**
 * The exit's world travel and its mean screen bearing in degrees (0 = straight
 * right, 90 = straight down).
 *
 * Exported because the exit's length is a question of fact the owner has now
 * asked twice -- V6.3 §4 asked how far the diagonal travelled, V8 §3 asks that
 * no dead scroll be left behind after the previews are removed -- and the honest
 * way to answer it is to derive the number from the route rather than from the
 * anchors it was authored with. Sampled along the real curve, so a bend is paid
 * for.
 *
 * V8: `diagonal` is gone with the leg it measured; `turn` is the whole exit.
 */
export function exitGeometry(mobile = false): {
  turn: { length: number; bearing: number; vw: number; vh: number };
} {
  const segments = tables(mobile).two.segments;
  const measure = (segment: Segment) => {
    let length = 0;
    let previous = catmullRom(segment.p0, segment.p1, segment.p2, segment.p3, 0);
    for (let i = 1; i <= 128; i += 1) {
      const point = catmullRom(segment.p0, segment.p1, segment.p2, segment.p3, i / 128);
      length += screenDistance(previous, point);
      previous = point;
    }
    const dx = segment.p2.x - segment.p1.x;
    const dy = segment.p2.y - segment.p1.y;
    return {
      length,
      bearing: (Math.atan2(dy, dx * VW_PER_VH) * 180) / Math.PI,
      vw: dx,
      vh: dy,
    };
  };
  return { turn: measure(segments[segments.length - 1]!) };
}

/* ---------------------------------------------------- the work-route branch */

/**
 * V6.4 (§4A) -- THE WORK-ROUTE JUNCTION.
 *
 * The `handoff` scene already says, in real copy, that Kıvılcım and DropSpot are
 * "two stops on a larger map" and that JointLedger and Professional Systems
 * "continue on the full Work index". Through V6.3 that was a paragraph standing in
 * a world that drew every other relationship it had as geometry -- so the one
 * genuinely spatial statement on the page was the one thing the space did not
 * express.
 *
 * The junction is where the map stops being a metaphor. A second route leaves the
 * main one just after `handoff` and heads somewhere the camera does not go. The
 * main journey continues down and right into the lower world; the branch climbs
 * away to the right and terminates at a node carrying the names of the projects
 * that live there.
 *
 * WHY IT IS DERIVED RATHER THAN AUTHORED, which is the same discipline the rails,
 * the hero's lead rule and the erosion wind have always followed: the divergence
 * is measured off the MAIN ROUTE'S OWN BEARING at the junction. If the exit
 * traverse is ever re-aimed, the branch re-aims with it and the angle between them
 * stays exactly BRANCH_DIVERGENCE. A branch authored in world coordinates would
 * silently stop diverging the first time the traverse moved.
 *
 * What it deliberately is not (§4A): a subway map, a HUD, a status panel, or a
 * set of coordinates. Two legs, one node, three real names.
 */

/** Where the branch leaves the main route: just after `handoff` is framed, so the
 *  junction is read as leaving the scene that states it rather than as a mark
 *  standing somewhere in open travel. */
// V8: measured against the WHOLE exit rather than against the distance to its
// last leg. With the exit reduced to one leg those were the same span until this
// pass and are now `0`, which would have silently pinned the junction exactly on
// `handoff`'s focus instead of just after it.
export const WORK_BRANCH_FROM = EXIT_FROM + (1 - EXIT_FROM) * 0.09;

/**
 * Angle between the branch and the main route at the junction, in degrees.
 * Negative is anticlockwise on screen: the main route descends, so the branch
 * rises away from it.
 *
 * TUNED AGAINST THE FRAME, not chosen for drama. A first pass used -58, which is
 * a far more emphatic fork and put the terminus 64vh ABOVE the camera -- with the
 * world inset only 14vh from the top of the sticky frame, the branch's entire
 * destination was off-screen and the junction was a line leaving the frame. -22
 * against the ~12 degree route bearing at the junction leaves the terminus at
 * roughly 61vw / 8vh in the frame: comfortably visible for the whole handoff
 * dwell, which is when the copy that it illustrates is being read.
 *
 * The instantaneous fork is therefore modest, and the divergence that actually
 * reads is cumulative: the main route steepens to 72 degrees across the traverse
 * while the branch stays near horizontal, so the two are ~58 degrees apart by the
 * terminus. Both are asserted in tests/unit/spatial-route.test.ts.
 */
const BRANCH_DIVERGENCE = -22;

/** Screen lengths of the branch's two legs, and how much the second turns back
 *  toward horizontal. The kink is what makes it read as a routed connector in the
 *  world's own vocabulary rather than as a ray. */
const BRANCH_LEGS = [60, 36] as const;
const BRANCH_LEVEL = 16;

/**
 * The branch, as a polyline in world coordinates: junction, kink, terminus.
 *
 * Takes `mobile` and derives everything through `cameraPosition`, so the geometry
 * is already correct for a mobile route with real x travel whenever one exists.
 * It is not RENDERED on mobile in this pass (see WorldGrammar) -- that is a
 * staging decision, not an assumption baked into the maths.
 */
export function workBranch(mobile = false): WorldPoint[] {
  const start = cameraPosition(WORK_BRANCH_FROM, mobile);
  // The main route's own bearing at the junction, measured across a short span of
  // real travel rather than between two anchors.
  const main = routeScreenAngle(WORK_BRANCH_FROM, WORK_BRANCH_FROM + 0.004, mobile);
  const points = [start];
  let bearing = main + BRANCH_DIVERGENCE;
  let cursor = start;
  for (const [index, length] of BRANCH_LEGS.entries()) {
    if (index > 0) bearing += BRANCH_LEVEL;
    const radians = (bearing * Math.PI) / 180;
    // Back out of the screen measure into world units: x is vw, and one vw is
    // VW_PER_VH screen units.
    cursor = {
      x: cursor.x + (Math.cos(radians) * length) / VW_PER_VH,
      y: cursor.y + Math.sin(radians) * length,
    };
    points.push(cursor);
  }
  return points;
}

/** Whether the break is on screen at all. */
export function isBreakActive(progress: number): boolean {
  const p = clamp01(progress);
  return p > BREAK_COVER_START && p < BREAK_REVEAL_END;
}

/** True once the reposition has happened -- i.e. the camera is on route two. */
export function hasRepositioned(progress: number): boolean {
  return clamp01(progress) >= BREAK_CUT;
}

export type RouteLeg = {
  /** The actual curve, sampled -- not a straight line between anchors. */
  points: WorldPoint[];
  fromProgress: number;
  toProgress: number;
  route: 1 | 2;
};

/**
 * The camera path itself, sampled leg by leg. The world-grammar layer draws
 * its rails straight from this, so the orientation marks in the travel space
 * trace the real curve and cannot describe a path the camera does not take.
 *
 * Sampled at even ARC LENGTH rather than even parameter (V5): vertices are
 * then evenly spaced along the drawn line, which both looks right and keeps
 * every vertex close to a real camera position.
 */
export function routeLegs(mobile = false, samples = 18): RouteLeg[] {
  const { one, two } = tables(mobile);
  const build = (segments: Segment[], route: 1 | 2): RouteLeg[] =>
    segments.map((segment) => ({
      points: Array.from({ length: samples + 1 }, (_, i) =>
        catmullRom(
          segment.p0,
          segment.p1,
          segment.p2,
          segment.p3,
          arcParam(segment.arc, i / samples),
        ),
      ),
      fromProgress: segment.from,
      toProgress: segment.to,
      route,
    }));
  return [...build(one.segments, 1), ...build(two.segments, 2)];
}

/** Overall slope of a route in world units (dy/dx). */
export function routeSlope(route: 1 | 2, mobile = false): number {
  const ids = route === 1 ? ROUTE_ONE_IDS : ROUTE_TWO_IDS;
  const from = sceneAnchor(ids[0]!, mobile);
  const to =
    route === 1
      ? mobile
        ? CUT_MOBILE_WORLD
        : CUT_WORLD
      : sceneAnchor(ids[ids.length - 1]!, mobile);
  return (to.y - from.y) / (to.x - from.x);
}

/**
 * Screen angle, in degrees, of the camera's travel between two progress
 * points. The directional architecture (§22) is aligned with this rather than
 * with an authored angle, so the environmental structures always point along
 * the route the camera actually takes -- the same discipline the rails and the
 * erosion wind already follow.
 */
export function routeScreenAngle(fromProgress: number, toProgress: number, mobile = false): number {
  const from = cameraPosition(fromProgress, mobile);
  const to = cameraPosition(toProgress, mobile);
  return (Math.atan2(to.y - from.y, (to.x - from.x) * VW_PER_VH) * 180) / Math.PI;
}

/**
 * Size of the hero's structural lead-in rule, in vw/vh, so it runs at the
 * same screen angle the camera leaves the hero on. Because the spline's start
 * tangent is reflected, that is exactly the hero->Kıvılcım direction.
 */
export function heroLeadRule(widthVw: number): { width: number; height: number } {
  const from = sceneAnchor("hero");
  const to = sceneAnchor("kivilcim");
  return { width: widthVw, height: (widthVw * (to.y - from.y)) / (to.x - from.x) };
}

/* ------------------------------------------------------------ diagnostics */

/**
 * Camera speed in world units per unit progress, by finite difference.
 * Exported so the motion contract can be asserted directly rather than
 * inferred: outside the collision there must be no progress at which the
 * camera is effectively stationary.
 */
export function cameraSpeed(progress: number, mobile = false, h = 0.0005): number {
  const p = clamp01(progress);
  const a = cameraPosition(Math.max(p - h, 0), mobile);
  const b = cameraPosition(Math.min(p + h, 1), mobile);
  return screenDistance(a, b) / (Math.min(p + h, 1) - Math.max(p - h, 0));
}

/**
 * Average camera speed across the whole route, for comparison.
 *
 * The exclusion window straddles the cut by one finite-difference step at each
 * end, and that margin is load-bearing rather than defensive. `cameraSpeed` is a
 * CENTRED difference, so a sample taken just outside the cut still reads one of
 * its two positions from inside the other route -- and across the cut those two
 * positions are 670 screen units apart, which divided by a 0.001 window is a speed
 * of 670,000.
 *
 * V6.3 found this the hard way. Skipping exactly [COLLISION_PROGRESS, BREAK_CUT)
 * left whether the contaminated sample was taken at all up to where the 0.002
 * sampling grid happened to fall relative to the cut -- so it was correct through
 * V6.2 by luck, and the moment V6.3 moved COLLISION_PROGRESS the average jumped
 * from 1496 to 2914. That is not a cosmetic error in a diagnostic: the "narrow
 * speed band" unit test divides by this number, so an inflated average would have
 * reported a 1.63x peak as 0.84x and passed a genuinely lurching route.
 *
 * V6.4 collapsed the window to a single point (the impact it used to span is gone)
 * but kept the margin, for exactly the reason above.
 */
export function averageCameraSpeed(mobile = false, h = 0.0005): number {
  let total = 0;
  let count = 0;
  for (let p = 0; p <= 1; p += 0.002) {
    if (p >= BREAK_CUT - h && p <= BREAK_CUT + h) continue;
    total += cameraSpeed(p, mobile, h);
    count += 1;
  }
  return total / Math.max(count, 1);
}
