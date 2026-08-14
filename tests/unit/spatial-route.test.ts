import { describe, expect, it } from "vitest";
import {
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_REVEAL_END,
  COLLISION_PROGRESS,
  COLLISION_WORLD,
  ROUTE_LENGTH_VH,
  ROUTE_ONE_IDS,
  ROUTE_TWO_IDS,
  SCENES,
  SCENE_BREAK_BANDS,
  VW_PER_VH,
  sceneAnchor,
  sceneById,
} from "@/lib/spatial/scenes";
import {
  approachTension,
  breakBandOffset,
  breakWipeOffset,
  cameraPosition,
  currentSceneId,
  hasRepositioned,
  heroLeadRule,
  isBreakActive,
  isImpact,
  routeLegs,
  routeSlope,
  travelWindVector,
} from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V3. The binding semantics carried over from V1/V2
// (collision != bounce, discontinuous reposition, mobile choreography, a
// controlled route length) are tested here unchanged in meaning. The V3
// subject -- that the journey CONTINUES as a spatial route after the break
// instead of dropping into straight-down flow -- is tested as directional
// properties, never as exact pixel values, so art direction stays free to
// move the world without rewriting the suite.

/** Samples camera positions across a progress window. */
function sample(from: number, to: number, steps = 24, mobile = false) {
  return Array.from({ length: steps + 1 }, (_, i) =>
    cameraPosition(from + ((to - from) * i) / steps, mobile),
  );
}

function span(points: { x: number; y: number }[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    deltaX: Math.max(...xs) - Math.min(...xs),
    deltaY: Math.max(...ys) - Math.min(...ys),
  };
}

describe("scene configuration", () => {
  it("every scene has a focus/hold window, in ascending route order", () => {
    let previous = -1;
    for (const scene of SCENES) {
      expect(scene.holdUntil).toBeGreaterThanOrEqual(scene.focus);
      expect(scene.focus).toBeGreaterThan(previous);
      previous = scene.focus;
    }
  });

  it("mobile anchors are purely vertical -- same scenes, different choreography", () => {
    for (const scene of SCENES) {
      expect(scene.mobileWorld.x).toBe(0);
    }
  });

  it("keeps the total route length controlled, well under V1's 600vh spacer", () => {
    expect(ROUTE_LENGTH_VH).toBeGreaterThan(0);
    expect(ROUTE_LENGTH_VH).toBeLessThan(500);
  });

  it("gives each scene its own dwell length rather than one convenient constant", () => {
    const dwells = SCENES.map((scene) => Number((scene.holdUntil - scene.focus).toFixed(4)));
    expect(new Set(dwells).size).toBeGreaterThan(1);
    // DropSpot leads with a real product screenshot and is deliberately the
    // longest hold on route one.
    const dropspot = sceneById("dropspot");
    for (const id of ["hero", "kivilcim", "tail"] as const) {
      const other = sceneById(id);
      expect(dropspot.holdUntil - dropspot.focus).toBeGreaterThan(other.holdUntil - other.focus);
    }
  });
});

describe("cameraPosition: route one", () => {
  it("starts framed on the hero scene", () => {
    expect(cameraPosition(0)).toEqual(sceneAnchor("hero"));
  });

  it("dwells on each travelled scene for its whole hold window, so it can be read", () => {
    for (const id of ROUTE_ONE_IDS) {
      const scene = sceneById(id);
      const anchor = sceneAnchor(id);
      expect(cameraPosition(scene.focus)).toEqual(anchor);
      expect(cameraPosition(scene.holdUntil)).toEqual(anchor);
      expect(cameraPosition((scene.focus + scene.holdUntil) / 2)).toEqual(anchor);
    }
  });

  it("travels between scenes, staying strictly between their anchors", () => {
    const from = sceneById("kivilcim");
    const to = sceneById("dropspot");
    const mid = cameraPosition((from.holdUntil + to.focus) / 2);
    expect(mid.x).toBeGreaterThan(sceneAnchor("kivilcim").x);
    expect(mid.x).toBeLessThan(sceneAnchor("dropspot").x);
    expect(mid.y).toBeGreaterThan(sceneAnchor("kivilcim").y);
    expect(mid.y).toBeLessThan(sceneAnchor("dropspot").y);
  });

  it("moves on BOTH axes across the whole of route one -- never straight down", () => {
    const { deltaX, deltaY } = span(sample(0, COLLISION_PROGRESS));
    expect(deltaX).toBeGreaterThan(0);
    expect(deltaY).toBeGreaterThan(0);
  });

  it("gives the hero a gentler first leg, so it stays readable as the camera commits", () => {
    const hero = sceneById("hero");
    const kivilcim = sceneById("kivilcim");
    const quarter = hero.holdUntil + (kivilcim.focus - hero.holdUntil) * 0.25;
    const travelled = cameraPosition(quarter).x - sceneAnchor("hero").x;
    const legLength = sceneAnchor("kivilcim").x - sceneAnchor("hero").x;
    // A quarter of the way through the leg, well under a quarter of the
    // distance has been covered: the hero has not been snatched away.
    expect(travelled / legLength).toBeLessThan(0.15);
  });

  it("stops dead at the wall and never eases past it or reverses off it (collision != bounce)", () => {
    const atWall = cameraPosition(COLLISION_PROGRESS);
    expect(atWall).toEqual(COLLISION_WORLD);
    // Held for the entire impact window: no drift onward, no rebound back
    // toward the tail.
    const midImpact = cameraPosition((COLLISION_PROGRESS + BREAK_CUT) / 2);
    expect(midImpact).toEqual(atWall);
    expect(cameraPosition(BREAK_CUT - 0.001)).toEqual(atWall);
  });
});

describe("cameraPosition: reposition and route two", () => {
  it("repositions discontinuously at the cut -- a break, not a continuation", () => {
    const justBefore = cameraPosition(BREAK_CUT - 0.001);
    const atCut = cameraPosition(BREAK_CUT);
    expect(atCut).toEqual(sceneAnchor("reorient"));
    // The jump reverses the direction of travel entirely: route one ran
    // left-to-right, and the reposition lands far back to the left and far
    // below. Nothing about this reads as the camera continuing on its path.
    expect(atCut.x).toBeLessThan(justBefore.x);
    expect(atCut.y).toBeGreaterThan(justBefore.y);
    expect(Math.abs(atCut.x - justBefore.x)).toBeGreaterThan(100);
  });

  it("does NOT park after the reposition -- a second route continues", () => {
    const parked = sceneAnchor("reorient");
    expect(cameraPosition(1)).not.toEqual(parked);
    expect(cameraPosition(1)).toEqual(sceneAnchor("handoff"));
  });

  // The single most important V3 contract (§5): after the collision the
  // camera must keep moving spatially, on both axes. A route that only
  // changed y would be exactly the straight-down document flow the owner
  // rejected.
  it("moves on BOTH axes after the collision: deltaX != 0 AND deltaY != 0", () => {
    const { deltaX, deltaY } = span(sample(BREAK_CUT, 1));
    expect(deltaX).not.toBe(0);
    expect(deltaY).not.toBe(0);
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

  it("climbs where route one descended -- the second route is not a repeat", () => {
    expect(routeSlope(1)).toBeGreaterThan(0);
    expect(routeSlope(2)).toBeLessThan(0);
    expect(Math.abs(routeSlope(2) - routeSlope(1))).toBeGreaterThan(0.3);
  });

  it("uses a different rhythm as well as a different direction: no repeated leg angle", () => {
    const slopes = routeLegs().map((leg) =>
      ((leg.to.y - leg.from.y) / (leg.to.x - leg.from.x)).toFixed(3),
    );
    expect(new Set(slopes).size).toBe(slopes.length);
  });

  it("dwells on each route-two scene so the second route is read, not skimmed", () => {
    for (const id of ROUTE_TWO_IDS) {
      const scene = sceneById(id);
      expect(cameraPosition(scene.focus)).toEqual(sceneAnchor(id));
      expect(cameraPosition((scene.focus + scene.holdUntil) / 2)).toEqual(sceneAnchor(id));
    }
  });

  it("spends a real share of the journey after the break", () => {
    // Not a token beat: at least a fifth of the whole route is post-collision.
    expect(1 - BREAK_CUT).toBeGreaterThan(0.2);
  });

  it("clamps out-of-range progress", () => {
    expect(cameraPosition(-1)).toEqual(sceneAnchor("hero"));
    expect(cameraPosition(2)).toEqual(sceneAnchor("handoff"));
  });

  it("keeps the mobile camera on a single vertical axis for the whole route", () => {
    for (let p = 0; p <= 1; p += 0.05) {
      expect(cameraPosition(p, true).x).toBe(0);
    }
    expect(cameraPosition(sceneById("dropspot").focus, true)).toEqual(
      sceneAnchor("dropspot", true),
    );
    // Mobile still breaks and repositions -- same world, different camera.
    expect(cameraPosition(BREAK_CUT, true).y).toBeGreaterThan(
      cameraPosition(BREAK_CUT - 0.001, true).y + 100,
    );
  });
});

describe("currentSceneId", () => {
  it("names the scene that owns the camera at each focal moment", () => {
    for (const scene of SCENES) {
      expect(currentSceneId(scene.focus)).toBe(scene.id);
    }
  });

  it("reports the collision as its own camera-only event, then route two after the cut", () => {
    expect(currentSceneId(COLLISION_PROGRESS)).toBe("collision");
    expect(currentSceneId(BREAK_CUT)).toBe("reorient");
    expect(currentSceneId(1)).toBe("handoff");
  });
});

describe("impact and approach", () => {
  it("flags impact only while the camera is stopped at the wall", () => {
    expect(isImpact(COLLISION_PROGRESS - 0.01)).toBe(false);
    expect(isImpact(COLLISION_PROGRESS)).toBe(true);
    expect(isImpact(BREAK_CUT)).toBe(false);
  });

  it("builds tension continuously from the tail to the wall, and nowhere else", () => {
    const tail = sceneById("tail");
    expect(approachTension(tail.holdUntil)).toBe(0);
    expect(approachTension(COLLISION_PROGRESS)).toBe(1);
    const mid = approachTension((tail.holdUntil + COLLISION_PROGRESS) / 2);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(approachTension(0.2)).toBe(0);
  });
});

describe("scene break", () => {
  it("is parked off-screen outside its window and never covers the scenes", () => {
    expect(breakWipeOffset(0)).toBe(100);
    expect(breakWipeOffset(BREAK_COVER_START)).toBe(100);
    expect(breakWipeOffset(1)).toBe(-100);
    expect(isBreakActive(0.5)).toBe(false);
    expect(isBreakActive(1)).toBe(false);
  });

  it("fully covers the viewport at exactly the cut, so the jump is never witnessed", () => {
    expect(breakWipeOffset(BREAK_CUT)).toBe(0);
    expect(isBreakActive(BREAK_CUT)).toBe(true);
    // Every rail closes onto zero at the cut too -- no rail can leave a gap
    // through which the discontinuity would be visible.
    for (let index = 0; index < SCENE_BREAK_BANDS; index += 1) {
      expect(Math.abs(breakBandOffset(BREAK_CUT, index))).toBeLessThan(1e-9);
    }
  });

  it("closes from alternating sides -- convergence, not a single sweep", () => {
    const mid = (BREAK_COVER_START + BREAK_CUT) / 2;
    const offsets = Array.from({ length: SCENE_BREAK_BANDS }, (_, i) => breakBandOffset(mid, i));
    expect(offsets.some((value) => value > 0)).toBe(true);
    expect(offsets.some((value) => value < 0)).toBe(true);
  });

  it("gives adjacent rails different arrival rates, so alignment snaps unevenly", () => {
    const mid = (BREAK_COVER_START + BREAK_CUT) / 2;
    const magnitudes = Array.from({ length: SCENE_BREAK_BANDS }, (_, i) =>
      Math.abs(breakBandOffset(mid, i)).toFixed(4),
    );
    expect(new Set(magnitudes).size).toBeGreaterThan(1);
  });

  it("keeps every rail ahead of the solid field, which closes last", () => {
    const mid = (BREAK_COVER_START + BREAK_CUT) / 2;
    const field = Math.abs(breakWipeOffset(mid));
    for (let index = 0; index < SCENE_BREAK_BANDS; index += 1) {
      expect(Math.abs(breakBandOffset(mid, index))).toBeLessThan(field);
    }
  });

  it("wipes in before the cut and out after it, in one direction per rail", () => {
    const covering = breakWipeOffset((BREAK_COVER_START + BREAK_CUT) / 2);
    const revealing = breakWipeOffset((BREAK_CUT + BREAK_REVEAL_END) / 2);
    expect(covering).toBeGreaterThan(0);
    expect(covering).toBeLessThan(100);
    expect(revealing).toBeLessThan(0);
    expect(revealing).toBeGreaterThan(-100);
    // A rail that closed from the right opens to the left, and vice versa.
    expect(Math.sign(breakBandOffset((BREAK_COVER_START + BREAK_CUT) / 2, 0))).toBe(1);
    expect(Math.sign(breakBandOffset((BREAK_CUT + BREAK_REVEAL_END) / 2, 0))).toBe(-1);
  });

  it("brackets the route's discontinuity: cover starts before the cut, reveal ends after", () => {
    expect(BREAK_COVER_START).toBeLessThan(BREAK_CUT);
    expect(BREAK_REVEAL_END).toBeGreaterThan(BREAK_CUT);
    expect(hasRepositioned(BREAK_CUT - 0.001)).toBe(false);
    expect(hasRepositioned(BREAK_CUT)).toBe(true);
  });
});

describe("world grammar derives from the route", () => {
  it("draws a rail for every travelled leg, including the run at the wall", () => {
    const legs = routeLegs();
    expect(legs).toHaveLength(6);
    expect(legs.filter((leg) => leg.route === 1)).toHaveLength(4);
    expect(legs.filter((leg) => leg.route === 2)).toHaveLength(2);
    for (const leg of legs) {
      expect(leg.toProgress).toBeGreaterThan(leg.fromProgress);
    }
  });

  it("points the erosion wind against the camera's screen travel, not at an arbitrary angle", () => {
    const wind = travelWindVector();
    const from = sceneAnchor("tail");
    // Screen displacement of the world during the approach is the negation
    // of the camera's advance; fragments must trail the opposite way.
    const screenTravelX = -(COLLISION_WORLD.x - from.x) * VW_PER_VH;
    const screenTravelY = -(COLLISION_WORLD.y - from.y);
    expect(wind.x * screenTravelX + wind.y * screenTravelY).toBeLessThan(0);
    expect(Math.hypot(wind.x, wind.y)).toBeCloseTo(1, 6);
  });

  it("sizes the hero's lead rule to the first leg's own angle", () => {
    const rule = heroLeadRule(18);
    const legRatio =
      (sceneAnchor("kivilcim").y - sceneAnchor("hero").y) /
      (sceneAnchor("kivilcim").x - sceneAnchor("hero").x);
    expect(rule.height / rule.width).toBeCloseTo(legRatio, 10);
  });
});
