// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Pure route/camera math, no JSX, no
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
// The one intentional exception is the collision: the approach accelerates,
// the camera stops dead at the wall for a short impact window, and the route
// jumps discontinuously at the cut. That is the point of it.

import {
  BREAK_COVER_LEAD,
  BREAK_REVEAL_TAIL,
  COLLISION_MOBILE_WORLD,
  COLLISION_WORLD,
  FOCUS_ALLOWANCE,
  FOCUS_SPEED_RATIO,
  IMPACT_WINDOW,
  ROUTE_ONE_IDS,
  ROUTE_TWO_IDS,
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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
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
 * Samples per segment for the cumulative distance table. 64 is far more than
 * the geometry needs -- these are gentle curves whose chord/arc error is under
 * a tenth of a percent by ~24 samples -- and the whole thing is built once, at
 * module load, for six segments per viewport mode.
 */
const ARC_SAMPLES = 64;

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
function routePoints(mobile: boolean) {
  const wall = mobile ? COLLISION_MOBILE_WORLD : COLLISION_WORLD;
  const one = [...ROUTE_ONE_IDS.map((id) => sceneAnchor(id, mobile)), wall];
  const two = ROUTE_TWO_IDS.map((id) => sceneAnchor(id, mobile));
  return { one, two };
}

const AVAILABLE = 1 - IMPACT_WINDOW;

/** Scroll weight of a run of segments: distance travelled + reading allowance. */
function routeWeight(tables: ArcTable[]): number {
  return tables.reduce((sum, table) => sum + table.length + FOCUS_ALLOWANCE, 0);
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
  const oneWeight = routeWeight(arcTables(one));
  return (AVAILABLE * oneWeight) / (oneWeight + routeWeight(arcTables(two)));
})();

function buildRoutes(mobile: boolean): { one: RouteTable; two: RouteTable } {
  const { one: onePoints, two: twoPoints } = routePoints(mobile);
  const oneArcs = arcTables(onePoints);
  const twoArcs = arcTables(twoPoints);

  const collision = SPLIT;
  const cut = collision + IMPACT_WINDOW;
  const available = AVAILABLE;

  const sum = (tables: ArcTable[]) => tables.reduce((s, table) => s + table.length, 0);
  const totalLength = sum(oneArcs) + sum(twoArcs);
  // One shared boundary speed for the entire world, expressed in world units
  // per unit progress.
  const focusSpeed = FOCUS_SPEED_RATIO * (totalLength / available);

  // Speed the camera reaches at the wall, before it is stopped dead. Higher
  // than the route average so the approach genuinely builds.
  const approachExitSpeed = 1.35 * (totalLength / available);

  const assemble = (
    points: WorldPoint[],
    arcs: ArcTable[],
    from: number,
    to: number,
    lastIsApproach: boolean,
  ) => {
    const controls = segmentControls(points);
    const weightTotal = routeWeight(arcs);
    const span = to - from;

    const bounds: number[] = [from];
    let cursor = from;
    for (const arc of arcs) {
      cursor += (span * (arc.length + FOCUS_ALLOWANCE)) / weightTotal;
      bounds.push(cursor);
    }
    bounds[bounds.length - 1] = to; // kill float drift so the last anchor is exact

    return controls.map((control, i): Segment => {
      const arc = arcs[i]!;
      const width = bounds[i + 1]! - bounds[i]!;
      const isApproach = lastIsApproach && i === controls.length - 1;

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
        a0: solve(focusSpeed),
        a1: solve(isApproach ? approachExitSpeed : focusSpeed),
      };
    });
  };

  const oneSegments = assemble(onePoints, oneArcs, 0, collision, true);
  const twoSegments = assemble(twoPoints, twoArcs, cut, 1, false);

  const focusOf = (
    ids: readonly SceneId[],
    segments: Segment[],
  ): Partial<Record<SceneId, number>> =>
    Object.fromEntries(ids.map((id, i) => [id, segments[i]?.from ?? segments[i - 1]?.to ?? 0]));

  return {
    one: { segments: oneSegments, focus: focusOf(ROUTE_ONE_IDS, oneSegments) },
    two: {
      segments: twoSegments,
      focus: {
        ...focusOf(ROUTE_TWO_IDS, twoSegments),
        handoff: twoSegments[twoSegments.length - 1]?.to ?? 1,
      },
    },
  };
}

const DESKTOP = buildRoutes(false);
const MOBILE = buildRoutes(true);

/** Camera reaches the wall and stops dead here. Derived, not authored. */
export const COLLISION_PROGRESS = SPLIT;
/** The route's discontinuity, hidden behind full cover. */
export const BREAK_CUT = COLLISION_PROGRESS + IMPACT_WINDOW;
export const BREAK_COVER_START = BREAK_CUT - BREAK_COVER_LEAD;
export const BREAK_REVEAL_END = BREAK_CUT + BREAK_REVEAL_TAIL;

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
 * Camera world-position at a given scroll progress. Continuous in position
 * and in speed everywhere except the deliberate collision hold and cut.
 */
export function cameraPosition(progress: number, mobile = false): WorldPoint {
  const p = clamp01(progress);
  const { one, two } = tables(mobile);

  if (p >= BREAK_CUT) {
    return evaluate(two.segments, p) ?? sceneAnchor("handoff", mobile);
  }
  if (p >= COLLISION_PROGRESS) {
    // Stopped dead at the wall: the impact, and the only stationary window.
    return mobile ? COLLISION_MOBILE_WORLD : COLLISION_WORLD;
  }
  return evaluate(one.segments, p) ?? sceneAnchor("hero", mobile);
}

/** Which scene currently owns the camera, or the camera-only collision event. */
export function currentSceneId(progress: number, mobile = false): SceneId | "collision" {
  const p = clamp01(progress);
  if (p >= COLLISION_PROGRESS && p < BREAK_CUT) return "collision";
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

/** True only while the camera is stopped dead at the wall. */
export function isImpact(progress: number): boolean {
  const p = clamp01(progress);
  return p >= COLLISION_PROGRESS && p < BREAK_CUT;
}

/** Rising 0..1 tension across the accelerating run at the wall. */
export function approachTension(progress: number, mobile = false): number {
  const p = clamp01(progress);
  const segments = tables(mobile).one.segments;
  const last = segments[segments.length - 1]!;
  if (p <= last.from) return 0;
  if (p >= COLLISION_PROGRESS) return 1;
  return (p - last.from) / (COLLISION_PROGRESS - last.from);
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
  if (p <= BREAK_CUT) {
    return lerp(100, 0, (p - BREAK_COVER_START) / (BREAK_CUT - BREAK_COVER_START));
  }
  return lerp(0, -100, (p - BREAK_CUT) / (BREAK_REVEAL_END - BREAK_CUT));
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
  const speed = 1.35 + ((index * 3) % 4) * 0.32;

  if (p <= BREAK_COVER_START) return direction * 100;
  if (p >= BREAK_REVEAL_END) return -direction * 100;
  if (p <= BREAK_CUT) {
    const t = (p - BREAK_COVER_START) / (BREAK_CUT - BREAK_COVER_START);
    return direction * 100 * (1 - t) ** speed;
  }
  const t = (p - BREAK_CUT) / (BREAK_REVEAL_END - BREAK_CUT);
  return -direction * 100 * t ** speed;
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
        ? COLLISION_MOBILE_WORLD
        : COLLISION_WORLD
      : sceneAnchor(ids[ids.length - 1]!, mobile);
  return (to.y - from.y) / (to.x - from.x);
}

/**
 * Screen-space direction the erosion fragments travel, derived from the
 * collision-approach leg. The camera advances down-and-right into the wall,
 * so the world slides up-and-left on screen and fragments torn off the word
 * trail along the exact opposite vector.
 */
export function travelWindVector(): WorldPoint {
  const from = sceneAnchor("tail");
  const to = COLLISION_WORLD;
  const screenX = (to.x - from.x) * VW_PER_VH;
  const screenY = to.y - from.y;
  const length = Math.hypot(screenX, screenY) || 1;
  return { x: screenX / length, y: screenY / length };
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

/** Average camera speed across the whole route, for comparison. */
export function averageCameraSpeed(mobile = false): number {
  let total = 0;
  let count = 0;
  for (let p = 0; p <= 1; p += 0.002) {
    if (p >= COLLISION_PROGRESS && p < BREAK_CUT) continue;
    total += cameraSpeed(p, mobile);
    count += 1;
  }
  return total / Math.max(count, 1);
}
