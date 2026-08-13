import { describe, expect, it } from "vitest";
import {
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_REVEAL_END,
  COLLISION_PROGRESS,
  COLLISION_WORLD,
  ROUTE_LENGTH_VH,
  SCENES,
  sceneAnchor,
  sceneById,
} from "@/lib/spatial/scenes";
import {
  approachTension,
  breakWipeOffset,
  cameraPosition,
  currentSceneId,
  hasRepositioned,
  isBreakActive,
  isImpact,
} from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V2. The binding semantics carried over from V1
// (collision != bounce, discontinuous reposition, mobile choreography) are
// tested here unchanged in meaning; the V2 additions (scene dwell, a
// controlled route length, and a break that bridges the cut) are tested
// alongside them. Deliberately no assertions on arbitrary exact world
// coordinates -- those are art direction and must stay free to move.

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
});

describe("cameraPosition", () => {
  it("starts framed on the hero scene", () => {
    expect(cameraPosition(0)).toEqual(sceneAnchor("hero"));
  });

  it("dwells on each travelled scene for its whole hold window, so it can be read", () => {
    for (const id of ["hero", "kivilcim", "dropspot", "tail"] as const) {
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

  it("travels diagonally on desktop -- both axes advance across the route", () => {
    const early = cameraPosition(sceneById("hero").focus);
    const late = cameraPosition(sceneById("tail").focus);
    expect(late.x).toBeGreaterThan(early.x);
    expect(late.y).toBeGreaterThan(early.y);
  });

  it("does not repeat one zig-zag angle between consecutive scene legs", () => {
    const legs = (["hero", "kivilcim", "dropspot", "tail"] as const)
      .map((id) => sceneAnchor(id))
      .slice(1)
      .map((point, index) => {
        const previous = sceneAnchor((["hero", "kivilcim", "dropspot"] as const)[index]!);
        return (point.y - previous.y) / (point.x - previous.x);
      });
    expect(new Set(legs.map((slope) => slope.toFixed(3))).size).toBe(legs.length);
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

  it("repositions discontinuously at the cut -- a break, not a continuation", () => {
    const justBefore = cameraPosition(BREAK_CUT - 0.001);
    const atCut = cameraPosition(BREAK_CUT);
    expect(atCut).toEqual(sceneAnchor("sceneTwo"));
    // The jump reverses direction of travel entirely: the whole route ran
    // left-to-right, and sceneTwo sits far back to the left. Nothing about
    // this reads as the camera continuing on its path.
    expect(atCut.x).toBeLessThan(justBefore.x);
    expect(Math.abs(atCut.x - justBefore.x)).toBeGreaterThan(100);
  });

  it("settles at sceneTwo for the remaining dwell -- no drift, no bounce-back", () => {
    expect(cameraPosition(0.95)).toEqual(sceneAnchor("sceneTwo"));
    expect(cameraPosition(1)).toEqual(sceneAnchor("sceneTwo"));
  });

  it("clamps out-of-range progress", () => {
    expect(cameraPosition(-1)).toEqual(sceneAnchor("hero"));
    expect(cameraPosition(2)).toEqual(sceneAnchor("sceneTwo"));
  });

  it("keeps the mobile camera on a single vertical axis for the whole route", () => {
    for (let p = 0; p <= 1; p += 0.05) {
      expect(cameraPosition(p, true).x).toBe(0);
    }
    expect(cameraPosition(sceneById("dropspot").focus, true)).toEqual(
      sceneAnchor("dropspot", true),
    );
  });
});

describe("currentSceneId", () => {
  it("names the scene that owns the camera at each focal moment", () => {
    for (const scene of SCENES) {
      expect(currentSceneId(scene.focus)).toBe(scene.id);
    }
  });

  it("reports the collision as its own camera-only event, then sceneTwo after the cut", () => {
    expect(currentSceneId(COLLISION_PROGRESS)).toBe("collision");
    expect(currentSceneId(BREAK_CUT)).toBe("sceneTwo");
    expect(currentSceneId(1)).toBe("sceneTwo");
  });
});

describe("impact and approach", () => {
  it("flags impact only while the camera is stopped at the wall", () => {
    expect(isImpact(COLLISION_PROGRESS - 0.01)).toBe(false);
    expect(isImpact(COLLISION_PROGRESS)).toBe(true);
    expect(isImpact(BREAK_CUT)).toBe(false);
  });

  it("builds tension continuously from the tail to the wall", () => {
    const tail = sceneById("tail");
    expect(approachTension(tail.holdUntil)).toBe(0);
    expect(approachTension(COLLISION_PROGRESS)).toBe(1);
    const mid = approachTension((tail.holdUntil + COLLISION_PROGRESS) / 2);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
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
  });

  it("wipes in before the cut and out after it, in one direction", () => {
    const covering = breakWipeOffset((BREAK_COVER_START + BREAK_CUT) / 2);
    const revealing = breakWipeOffset((BREAK_CUT + BREAK_REVEAL_END) / 2);
    expect(covering).toBeGreaterThan(0);
    expect(covering).toBeLessThan(100);
    expect(revealing).toBeLessThan(0);
    expect(revealing).toBeGreaterThan(-100);
  });

  it("brackets the route's discontinuity: cover starts before the cut, reveal ends after", () => {
    expect(BREAK_COVER_START).toBeLessThan(BREAK_CUT);
    expect(BREAK_REVEAL_END).toBeGreaterThan(BREAK_CUT);
    expect(hasRepositioned(BREAK_CUT - 0.001)).toBe(false);
    expect(hasRepositioned(BREAK_CUT)).toBe(true);
  });
});
