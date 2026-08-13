import { describe, expect, it } from "vitest";
import {
  cameraPosition,
  COLLISION_PROGRESS,
  currentRouteId,
  DESKTOP_NODE_POSITION,
  IMPACT_BAND,
  IMPACT_END_PROGRESS,
  isImpact,
  MOBILE_NODE_POSITION,
  NODE_PROGRESS,
} from "@/lib/spatial/sceneRoute";

describe("cameraPosition", () => {
  it("starts exactly at hero", () => {
    expect(cameraPosition(0)).toEqual(DESKTOP_NODE_POSITION.hero);
  });

  it("reaches kivilcim, dropspot, and tail exactly at their progress stops", () => {
    expect(cameraPosition(NODE_PROGRESS.kivilcim)).toEqual(DESKTOP_NODE_POSITION.kivilcim);
    expect(cameraPosition(NODE_PROGRESS.dropspot)).toEqual(DESKTOP_NODE_POSITION.dropspot);
    expect(cameraPosition(NODE_PROGRESS.tail)).toEqual(DESKTOP_NODE_POSITION.tail);
  });

  it("interpolates smoothly between two known waypoints", () => {
    const mid = (NODE_PROGRESS.kivilcim + NODE_PROGRESS.dropspot) / 2;
    const point = cameraPosition(mid);
    expect(point.x).toBeGreaterThan(DESKTOP_NODE_POSITION.kivilcim.x);
    expect(point.x).toBeLessThan(DESKTOP_NODE_POSITION.dropspot.x);
    expect(point.y).toBeGreaterThan(DESKTOP_NODE_POSITION.kivilcim.y);
    expect(point.y).toBeLessThan(DESKTOP_NODE_POSITION.dropspot.y);
  });

  it("holds at the collision wall throughout the impact band (no easing onward, no reversal)", () => {
    const atCollision = cameraPosition(COLLISION_PROGRESS);
    const midImpact = cameraPosition((IMPACT_BAND[0] + IMPACT_BAND[1]) / 2);
    expect(midImpact).toEqual(atCollision);
  });

  it("jumps discontinuously to sceneTwo at IMPACT_END_PROGRESS -- not a continuation of the diagonal", () => {
    const justBefore = cameraPosition(IMPACT_END_PROGRESS - 0.001);
    const atJump = cameraPosition(IMPACT_END_PROGRESS);
    expect(atJump).toEqual(DESKTOP_NODE_POSITION.sceneTwo);
    // A real discontinuity: the jump is not a small step continuing the
    // same direction of travel -- sceneTwo's x is far below the collision
    // wall's x, encoding "reposition", not "arrival".
    expect(Math.abs(atJump.x - justBefore.x)).toBeGreaterThan(10);
  });

  it("stays at sceneTwo for the remaining dwell scroll (no further movement, no bounce-back)", () => {
    expect(cameraPosition(0.8)).toEqual(DESKTOP_NODE_POSITION.sceneTwo);
    expect(cameraPosition(1)).toEqual(DESKTOP_NODE_POSITION.sceneTwo);
  });

  it("clamps out-of-range progress", () => {
    expect(cameraPosition(-1)).toEqual(DESKTOP_NODE_POSITION.hero);
    expect(cameraPosition(2)).toEqual(DESKTOP_NODE_POSITION.sceneTwo);
  });

  it("mobile route stays at x=0 throughout -- same nodes, vertical-only choreography", () => {
    for (const p of [0, 0.1, NODE_PROGRESS.kivilcim, 0.3, NODE_PROGRESS.dropspot, 0.5, 0.7, 1]) {
      expect(cameraPosition(p, true).x).toBe(0);
    }
    expect(cameraPosition(NODE_PROGRESS.kivilcim, true)).toEqual(MOBILE_NODE_POSITION.kivilcim);
  });

  it("desktop route genuinely moves diagonally (x and y both increase) before the collision", () => {
    const early = cameraPosition(0.05);
    const later = cameraPosition(NODE_PROGRESS.tail);
    expect(later.x).toBeGreaterThan(early.x);
    expect(later.y).toBeGreaterThan(early.y);
  });
});

describe("currentRouteId", () => {
  it("returns the right id at each named progress stop and inside the impact band", () => {
    expect(currentRouteId(0)).toBe("hero");
    expect(currentRouteId(NODE_PROGRESS.kivilcim)).toBe("kivilcim");
    expect(currentRouteId(NODE_PROGRESS.dropspot)).toBe("dropspot");
    expect(currentRouteId(NODE_PROGRESS.tail)).toBe("tail");
    expect(currentRouteId(COLLISION_PROGRESS)).toBe("collision");
    expect(currentRouteId(IMPACT_END_PROGRESS)).toBe("sceneTwo");
    expect(currentRouteId(1)).toBe("sceneTwo");
  });
});

describe("isImpact", () => {
  it("is true only inside the impact band, false at its own end and outside", () => {
    expect(isImpact(COLLISION_PROGRESS - 0.01)).toBe(false);
    expect(isImpact(COLLISION_PROGRESS)).toBe(true);
    expect(isImpact((IMPACT_BAND[0] + IMPACT_BAND[1]) / 2)).toBe(true);
    expect(isImpact(IMPACT_END_PROGRESS)).toBe(false);
  });

  it("impact band precedes the sceneTwo jump", () => {
    expect(IMPACT_BAND[1]).toBeLessThanOrEqual(1);
    expect(IMPACT_BAND[0]).toBeLessThan(IMPACT_BAND[1]);
  });
});
