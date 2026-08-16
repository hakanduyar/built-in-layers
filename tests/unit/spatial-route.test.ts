import { describe, expect, it } from "vitest";
import {
  COLLISION_WORLD,
  IMPACT_WINDOW,
  ROUTE_LENGTH_VH,
  ROUTE_ONE_IDS,
  ROUTE_TWO_IDS,
  SCENES,
  SCENE_BREAK_BANDS,
  SCENE_IDS,
  VW_PER_VH,
  sceneAnchor,
  screenDistance,
} from "@/lib/spatial/scenes";
import {
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_REVEAL_END,
  COLLISION_PROGRESS,
  approachTension,
  averageCameraSpeed,
  breakBandOffset,
  breakWipeOffset,
  cameraPosition,
  cameraSpeed,
  currentSceneId,
  hasRepositioned,
  heroLeadRule,
  isBreakActive,
  isImpact,
  routeLegs,
  routeSlope,
  sceneFocusProgress,
  sceneProximity,
  travelWindVector,
} from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V4. The binding semantics carried over from V1-V3
// (collision != bounce, discontinuous reposition, a post-collision diagonal,
// mobile choreography, a controlled route length) are tested here unchanged
// in meaning. The V4 subject -- that the camera RESPONDS CONTINUOUSLY to
// scroll instead of parking and then lurching -- is tested as speed
// properties, never as exact easing constants.

/** Every progress value outside the deliberate collision hold. */
function movingProgress(step = 0.001): number[] {
  const out: number[] = [];
  for (let p = 0; p <= 1 + 1e-9; p += step) {
    if (p >= COLLISION_PROGRESS - 0.002 && p < BREAK_CUT + 0.002) continue;
    out.push(Math.min(p, 1));
  }
  return out;
}

function span(points: { x: number; y: number }[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return { deltaX: Math.max(...xs) - Math.min(...xs), deltaY: Math.max(...ys) - Math.min(...ys) };
}

describe("scene configuration", () => {
  it("mobile anchors are purely vertical -- same scenes, different choreography", () => {
    for (const scene of SCENES) expect(scene.mobileWorld.x).toBe(0);
  });

  it("keeps the total route length controlled, and under V3's 420vh", () => {
    expect(ROUTE_LENGTH_VH).toBeGreaterThan(0);
    expect(ROUTE_LENGTH_VH).toBeLessThan(420);
  });

  it("derives focal progress rather than authoring it, in strict route order", () => {
    let previous = -1;
    for (const id of SCENE_IDS) {
      const focus = sceneFocusProgress(id);
      expect(focus).toBeGreaterThan(previous);
      previous = focus;
    }
    expect(sceneFocusProgress("hero")).toBe(0);
    expect(sceneFocusProgress("handoff")).toBeCloseTo(1, 6);
  });
});

// The central V4 contract (§2, §3, §10): scrolling must always produce
// perceptible camera response. V3 measured 0.00 camera px per scroll px at
// every scene; that is what these tests exist to prevent returning.
describe("continuous camera response", () => {
  it("never parks the camera outside the collision hold, in either mode", () => {
    for (const mobile of [false, true]) {
      const average = averageCameraSpeed(mobile);
      for (const p of movingProgress()) {
        const speed = cameraSpeed(p, mobile);
        expect(
          speed / average,
          `camera effectively stationary at progress ${p.toFixed(3)} (mobile=${mobile})`,
        ).toBeGreaterThan(0.1);
      }
    }
  });

  it("slows at every scene without stopping -- focus is velocity, not parking", () => {
    const average = averageCameraSpeed();
    for (const id of SCENE_IDS) {
      const focus = sceneFocusProgress(id);
      // reorient sits exactly on the cut, where speed is undefined by design.
      if (Math.abs(focus - BREAK_CUT) < 1e-9) continue;
      const ratio = cameraSpeed(focus) / average;
      expect(ratio, `${id} is parked`).toBeGreaterThan(0.1);
      expect(ratio, `${id} is not a focus zone`).toBeLessThan(0.6);
    }
  });

  it("keeps the whole journey inside a narrow speed band -- no lurching", () => {
    const average = averageCameraSpeed();
    const speeds = movingProgress().map((p) => cameraSpeed(p));
    const min = Math.min(...speeds);
    const max = Math.max(...speeds);
    expect(min / average).toBeGreaterThan(0.1);
    expect(max / average).toBeLessThan(2.2);
    // V3's band was effectively 0x to 20x. Anything under an order of
    // magnitude is a different experience.
    expect(max / min).toBeLessThan(9);
  });

  it("matches speed on both sides of every segment join", () => {
    // The actual C1 property, measured one-sided so neither reading straddles
    // the join. A join where one easing ended and another started at a
    // different rate shows up here immediately; a merely-C2 kink does not,
    // which is correct -- curvature is allowed to change at an anchor.
    const h = 0.0002;
    const oneSided = (from: number, to: number, mobile: boolean) =>
      screenDistance(cameraPosition(from, mobile), cameraPosition(to, mobile)) /
      Math.abs(to - from);

    for (const mobile of [false, true]) {
      for (const id of SCENE_IDS) {
        const focus = sceneFocusProgress(id, mobile);
        // Skip the route ends and the cut, where there is no join to match.
        if (focus <= h || focus >= 1 - h) continue;
        if (Math.abs(focus - BREAK_CUT) < 1e-9) continue;

        const left = oneSided(focus - h, focus, mobile);
        const right = oneSided(focus, focus + h, mobile);
        expect(
          Math.abs(left - right) / Math.max(left, right),
          `speed mismatch across ${id} (mobile=${mobile}): ${left.toFixed(1)} vs ${right.toFixed(1)}`,
        ).toBeLessThan(0.03);
      }
    }
  });

  it("never steps sharply in speed anywhere along the route", () => {
    for (const mobile of [false, true]) {
      const step = 0.0005;
      const samples = movingProgress(step);
      for (let i = 1; i < samples.length; i += 1) {
        // Skip the pair that spans the excluded collision window: that gap is
        // the intentional discontinuity, not a join.
        if (samples[i]! - samples[i - 1]! > step * 1.5) continue;
        const a = cameraSpeed(samples[i - 1]!, mobile);
        const b = cameraSpeed(samples[i]!, mobile);
        // Loose enough to tolerate the finite-difference window smearing a
        // curvature change at a join, tight enough that a real velocity
        // discontinuity cannot hide.
        expect(
          Math.abs(b - a) / Math.max(a, b, 1),
          `speed step at ${samples[i]!.toFixed(4)} (mobile=${mobile})`,
        ).toBeLessThan(0.08);
      }
    }
  });

  it("advances monotonically along each route -- the camera never backtracks", () => {
    for (const [ids, lo, hi] of [
      [ROUTE_ONE_IDS, 0, COLLISION_PROGRESS],
      [ROUTE_TWO_IDS, BREAK_CUT, 1],
    ] as const) {
      const start = sceneAnchor(ids[0]!);
      let travelled = -1;
      for (let p = lo; p <= hi; p += 0.002) {
        const here = screenDistance(start, cameraPosition(p));
        expect(here).toBeGreaterThanOrEqual(travelled - 1e-6);
        travelled = here;
      }
    }
  });
});

describe("the curve still goes where the route says", () => {
  it("passes exactly through every scene anchor, in both modes", () => {
    for (const mobile of [false, true]) {
      for (const id of SCENE_IDS) {
        const at = cameraPosition(sceneFocusProgress(id, mobile), mobile);
        const anchor = sceneAnchor(id, mobile);
        expect(at.x).toBeCloseTo(anchor.x, 6);
        expect(at.y).toBeCloseTo(anchor.y, 6);
      }
    }
  });

  it("does not let smoothing bow the path away from the route", () => {
    // Between two anchors the curve must stay near the chord: a spline that
    // wandered would frame empty world instead of the scenes.
    const from = sceneAnchor("kivilcim");
    const to = sceneAnchor("dropspot");
    const chord = screenDistance(from, to);
    for (let p = sceneFocusProgress("kivilcim"); p <= sceneFocusProgress("dropspot"); p += 0.004) {
      const point = cameraPosition(p);
      const detour = screenDistance(from, point) + screenDistance(point, to);
      expect(detour).toBeLessThan(chord * 1.06);
    }
  });

  it("starts framed on the hero and ends framed on the handoff", () => {
    expect(cameraPosition(0)).toEqual(sceneAnchor("hero"));
    expect(cameraPosition(1)).toEqual(sceneAnchor("handoff"));
    expect(cameraPosition(-1)).toEqual(sceneAnchor("hero"));
    expect(cameraPosition(2)).toEqual(sceneAnchor("handoff"));
  });
});

describe("collision remains the one deliberate discontinuity", () => {
  it("stops dead at the wall and never eases past it or reverses off it", () => {
    const atWall = cameraPosition(COLLISION_PROGRESS);
    expect(atWall).toEqual(COLLISION_WORLD);
    expect(cameraPosition((COLLISION_PROGRESS + BREAK_CUT) / 2)).toEqual(atWall);
    expect(cameraPosition(BREAK_CUT - 0.001)).toEqual(atWall);
  });

  it("keeps the impact hold short -- it is the only stationary window", () => {
    expect(IMPACT_WINDOW).toBeLessThan(0.06);
    expect(BREAK_CUT - COLLISION_PROGRESS).toBeCloseTo(IMPACT_WINDOW, 9);
  });

  it("accelerates into the wall instead of easing into it", () => {
    const last = sceneFocusProgress("tail");
    const early = cameraSpeed(last + (COLLISION_PROGRESS - last) * 0.2);
    const late = cameraSpeed(last + (COLLISION_PROGRESS - last) * 0.9);
    expect(late).toBeGreaterThan(early * 1.5);
  });

  it("repositions discontinuously at the cut -- a break, not a continuation", () => {
    const justBefore = cameraPosition(BREAK_CUT - 0.001);
    const atCut = cameraPosition(BREAK_CUT);
    expect(atCut).toEqual(sceneAnchor("reorient"));
    expect(atCut.x).toBeLessThan(justBefore.x);
    expect(atCut.y).toBeGreaterThan(justBefore.y);
    expect(Math.abs(atCut.x - justBefore.x)).toBeGreaterThan(100);
  });

  it("uses the same collision progress in both modes, so the break cannot desync", () => {
    // Deriving the split per mode left the mobile camera parked between the
    // shared cut and its own route-two start.
    expect(cameraPosition(BREAK_CUT, true)).toEqual(sceneAnchor("reorient", true));
    expect(cameraPosition(BREAK_CUT - 0.001, true)).not.toEqual(sceneAnchor("reorient", true));
  });
});

describe("route two", () => {
  it("moves on BOTH axes after the collision", () => {
    const points: { x: number; y: number }[] = [];
    for (let p = BREAK_CUT; p <= 1; p += 0.01) points.push(cameraPosition(p));
    const { deltaX, deltaY } = span(points);
    expect(deltaX).toBeGreaterThan(50);
    expect(deltaY).toBeGreaterThan(20);
  });

  it("never holds x constant while y changes on any post-collision leg", () => {
    for (const [index, id] of ROUTE_TWO_IDS.entries()) {
      const nextId = ROUTE_TWO_IDS[index + 1];
      if (!nextId) break;
      const from = sceneAnchor(id);
      const to = sceneAnchor(nextId);
      expect(Math.abs(to.x - from.x)).toBeGreaterThan(0);
      expect(Math.abs(to.y - from.y)).toBeGreaterThan(0);
    }
  });

  it("climbs where route one descended, at a different slope", () => {
    expect(routeSlope(1)).toBeGreaterThan(0);
    expect(routeSlope(2)).toBeLessThan(0);
    expect(Math.abs(routeSlope(2) - routeSlope(1))).toBeGreaterThan(0.3);
  });

  it("gets a real share of the journey, and of the world's travel", () => {
    expect(1 - BREAK_CUT).toBeGreaterThan(0.25);
  });

  it("travels at a comparable speed to route one -- one world, not two paces", () => {
    const speedIn = (lo: number, hi: number) => {
      let total = 0;
      let count = 0;
      for (let p = lo; p <= hi; p += 0.002) {
        total += cameraSpeed(p);
        count += 1;
      }
      return total / count;
    };
    const one = speedIn(0, COLLISION_PROGRESS - 0.01);
    const two = speedIn(BREAK_CUT + 0.01, 1);
    expect(Math.max(one, two) / Math.min(one, two)).toBeLessThan(1.35);
  });
});

describe("currentSceneId and proximity", () => {
  it("names the scene that owns the camera at each focal moment", () => {
    for (const id of SCENE_IDS) {
      expect(currentSceneId(sceneFocusProgress(id))).toBe(id);
    }
  });

  it("reports the collision as its own camera-only event", () => {
    expect(currentSceneId(COLLISION_PROGRESS)).toBe("collision");
    expect(currentSceneId(BREAK_CUT)).toBe("reorient");
    expect(currentSceneId(1)).toBe("handoff");
  });

  it("resolves a scene fully at its anchor and not at all at its neighbours", () => {
    for (const id of SCENE_IDS) {
      expect(sceneProximity(id, sceneFocusProgress(id))).toBeCloseTo(1, 6);
    }
    expect(sceneProximity("kivilcim", sceneFocusProgress("dropspot"))).toBe(0);
    expect(sceneProximity("dropspot", sceneFocusProgress("hero"))).toBe(0);
  });
});

describe("impact and approach", () => {
  it("flags impact only while the camera is stopped at the wall", () => {
    expect(isImpact(COLLISION_PROGRESS - 0.01)).toBe(false);
    expect(isImpact(COLLISION_PROGRESS)).toBe(true);
    expect(isImpact(BREAK_CUT)).toBe(false);
  });

  it("builds tension across the run at the wall, and nowhere else", () => {
    expect(approachTension(0.2)).toBe(0);
    expect(approachTension(COLLISION_PROGRESS)).toBe(1);
    const mid = approachTension((sceneFocusProgress("tail") + COLLISION_PROGRESS) / 2);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
});

describe("scene break", () => {
  it("is parked off-screen outside its window and never covers the scenes", () => {
    expect(breakWipeOffset(0)).toBe(100);
    expect(breakWipeOffset(BREAK_COVER_START)).toBe(100);
    expect(breakWipeOffset(1)).toBe(-100);
    expect(isBreakActive(0.4)).toBe(false);
    expect(isBreakActive(1)).toBe(false);
  });

  it("fully covers the viewport at exactly the cut, so the jump is never witnessed", () => {
    expect(breakWipeOffset(BREAK_CUT)).toBe(0);
    expect(isBreakActive(BREAK_CUT)).toBe(true);
    for (let index = 0; index < SCENE_BREAK_BANDS; index += 1) {
      expect(Math.abs(breakBandOffset(BREAK_CUT, index))).toBeLessThan(1e-9);
    }
  });

  it("opens entirely before the camera resumes real travel", () => {
    // The reveal has to finish while route two is still in its slow focus
    // zone, or the panel would be sliding across a moving world.
    expect(BREAK_REVEAL_END).toBeLessThan(sceneFocusProgress("approach"));
  });

  it("closes from alternating sides at different rates, ahead of the solid field", () => {
    const mid = (BREAK_COVER_START + BREAK_CUT) / 2;
    const offsets = Array.from({ length: SCENE_BREAK_BANDS }, (_, i) => breakBandOffset(mid, i));
    expect(offsets.some((value) => value > 0)).toBe(true);
    expect(offsets.some((value) => value < 0)).toBe(true);
    expect(new Set(offsets.map((v) => Math.abs(v).toFixed(4))).size).toBeGreaterThan(1);
    const field = Math.abs(breakWipeOffset(mid));
    for (const offset of offsets) expect(Math.abs(offset)).toBeLessThan(field);
  });

  it("brackets the route's discontinuity", () => {
    expect(BREAK_COVER_START).toBeGreaterThan(COLLISION_PROGRESS);
    expect(BREAK_COVER_START).toBeLessThan(BREAK_CUT);
    expect(BREAK_REVEAL_END).toBeGreaterThan(BREAK_CUT);
    expect(hasRepositioned(BREAK_CUT - 0.001)).toBe(false);
    expect(hasRepositioned(BREAK_CUT)).toBe(true);
  });
});

describe("world grammar derives from the route", () => {
  it("samples the real curve for every travelled leg, not straight chords", () => {
    const legs = routeLegs();
    expect(legs).toHaveLength(6);
    expect(legs.filter((leg) => leg.route === 1)).toHaveLength(4);
    expect(legs.filter((leg) => leg.route === 2)).toHaveLength(2);
    for (const leg of legs) {
      expect(leg.toProgress).toBeGreaterThan(leg.fromProgress);
      expect(leg.points.length).toBeGreaterThan(4);
    }
  });

  it("draws rails that actually lie on the camera path", () => {
    // Distance to the drawn POLYLINE, not to its nearest vertex: the rail is
    // the line, and a camera position landing midway between two vertices is
    // on it. (Measuring to vertices instead makes the bound a function of the
    // sample count, which is a drawing detail, not a contract.)
    const distanceToPolyline = (points: { x: number; y: number }[], at: { x: number; y: number }) =>
      Math.min(
        ...points.slice(1).map((to, i) => {
          const from = points[i]!;
          const dx = (to.x - from.x) * VW_PER_VH;
          const dy = to.y - from.y;
          const lengthSquared = dx * dx + dy * dy;
          const t =
            lengthSquared > 0
              ? Math.min(
                  Math.max(
                    ((at.x - from.x) * VW_PER_VH * dx + (at.y - from.y) * dy) / lengthSquared,
                    0,
                  ),
                  1,
                )
              : 0;
          return screenDistance(
            { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t },
            at,
          );
        }),
      );

    for (const leg of routeLegs()) {
      for (let i = 0; i <= 6; i += 1) {
        const p = leg.fromProgress + ((leg.toProgress - leg.fromProgress) * i) / 6;
        expect(distanceToPolyline(leg.points, cameraPosition(p))).toBeLessThan(1);
      }
    }
  });

  it("points the erosion wind against the camera's screen travel", () => {
    const wind = travelWindVector();
    const from = sceneAnchor("tail");
    const screenTravelX = -(COLLISION_WORLD.x - from.x) * VW_PER_VH;
    const screenTravelY = -(COLLISION_WORLD.y - from.y);
    expect(wind.x * screenTravelX + wind.y * screenTravelY).toBeLessThan(0);
    expect(Math.hypot(wind.x, wind.y)).toBeCloseTo(1, 6);
  });

  it("sizes the hero's lead rule to the direction the camera leaves on", () => {
    const rule = heroLeadRule(18);
    const legRatio =
      (sceneAnchor("kivilcim").y - sceneAnchor("hero").y) /
      (sceneAnchor("kivilcim").x - sceneAnchor("hero").x);
    expect(rule.height / rule.width).toBeCloseTo(legRatio, 10);
  });
});
