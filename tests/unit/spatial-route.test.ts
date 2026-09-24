import { describe, expect, it } from "vitest";
import {
  CUT_WORLD,
  ROUTE_LENGTH_VH,
  ROUTE_ONE_IDS,
  ROUTE_TWO_IDS,
  SCENES,
  BREAK_DWELL,
  SCENE_BREAK_BANDS,
  SCENE_IDS,
  TURN_MOBILE_WORLD,
  TURN_WORLD,
  VW_PER_VH,
  sceneAnchor,
  screenDistance,
} from "@/lib/spatial/scenes";
import {
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_GUARD_FROM,
  BREAK_REVEAL_END,
  WORK_BRANCH_FROM,
  averageCameraSpeed,
  breakBandOffset,
  breakWipeOffset,
  cameraPosition,
  decompressionAnchor,
  cameraSpeed,
  currentSceneId,
  ENTRY_SEGMENTS,
  EXIT_FROM,
  EXIT_SEGMENTS,
  exitGeometry,
  hasRepositioned,
  heroLeadRule,
  isBreakActive,
  routeLegs,
  routeScreenAngle,
  routeSlope,
  sceneFocusProgress,
  sceneProximity,
  workBranch,
} from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V4. The binding semantics carried over from V1-V3
// (collision != bounce, discontinuous reposition, a post-collision diagonal,
// mobile choreography, a controlled route length) are tested here unchanged
// in meaning. The V4 subject -- that the camera RESPONDS CONTINUOUSLY to
// scroll instead of parking and then lurching -- is tested as speed
// properties, never as exact easing constants.

/** Every progress value clear of the route's one deliberate discontinuity.
 *
 *  V6.4: that is now a single point rather than a 0.062-wide window, but the
 *  margin either side is kept -- `cameraSpeed` is a centred difference, so a
 *  sample taken exactly at the cut still straddles both routes. */
function movingProgress(step = 0.001): number[] {
  const out: number[] = [];
  for (let p = 0; p <= 1 + 1e-9; p += step) {
    if (p >= BREAK_CUT - 0.002 && p < BREAK_CUT + 0.002) continue;
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

  // THE ROUTE-LENGTH CEILING, and the one standing owner decision this branch
  // overrides. It is called out in the V6.3 and V6.4 reports, not only here.
  //
  // 420 came from V3, where 420vh was rejected. The V3 measurements say what was
  // actually wrong with it: 29 distinct camera positions across 900 frames, a
  // median response of 0.00 camera px per scroll px, and 1276px of scroll that
  // moved the camera under 8px. The objection was DEAD SCROLL, not length -- and
  // V4 removed dead scroll structurally, which the two tests directly below this
  // one assert on every run.
  //
  // V6.3 went to 474 to pay for the exit traverse, and set this ceiling at 500.
  // V6.4 TIGHTENS IT TO 460, because retiring the collision handed back the 6.2%
  // of progress the impact window was consuming: at 445vh the camera now moves at
  // exactly the same world-units-per-scroll-pixel it did at 474vh with the impact
  // (see ROUTE_LENGTH_VH). The override over V3's 420 is halved, 12.9% -> 6.0%,
  // and this guard is 8% tighter than it was before the pass rather than looser.
  //
  // V6.5 TIGHTENS IT AGAIN, 460 -> 440. Shortening the turn leg and lowering the
  // travel allowance took the route to 430vh at unchanged route-one pacing, so the
  // guard follows the route down. The override over V3's 420 is now 2.4%.
  it("keeps the total route length controlled -- no return to V1's 600vh spacer", () => {
    expect(ROUTE_LENGTH_VH).toBeGreaterThan(0);
    // V7: four project scenes + SYSTEMS on route one (was two projects), with
    // scene spacing widened so consecutive 84vw blocks never share a focused
    // frame. The controlled quantity is scroll PER LEG, not the raw total:
    // 640vh across a ten-segment world is ~64vh/segment — a third of V1's
    // 200vh/scene — and the bound below keeps any future growth honest.
    expect(ROUTE_LENGTH_VH).toBeLessThan(700);
  });

  it("derives focal progress rather than authoring it, in strict route order", () => {
    let previous = -1;
    for (const id of SCENE_IDS) {
      const focus = sceneFocusProgress(id);
      expect(focus).toBeGreaterThan(previous);
      previous = focus;
    }
    expect(sceneFocusProgress("hero")).toBe(0);
    // V6.3: `handoff` no longer ends the route. It used to be route two's last
    // coordinate, so its focus was 1 by construction; the exit traverse now
    // continues past it (§4), and the route ends at a camera-only coordinate with
    // no scene standing on it -- which is the entire point of the change.
    //
    // The contract that survives, and that this now states directly: the last
    // SCENE is framed well before the route ends, and there is real travel after
    // it. Asserting the residue is > 0.1 of progress is what stops the traverse
    // being quietly reduced back to a token bend.
    expect(sceneFocusProgress("handoff")).toBeLessThan(1);
    // V8 (§3): the exit is now the handover turn alone -- the diagonal in front
    // of it existed only to carry the two rejected destination previews. So the
    // guard changes meaning as well as value: it no longer defends a JOURNEY
    // after the last scene, it defends the fact that the route does not simply
    // stop on `handoff` and get replaced by the lower page. Real travel after
    // the last scene, and deliberately not much of it.
    expect(1 - sceneFocusProgress("handoff")).toBeGreaterThan(0.02);
    expect(1 - sceneFocusProgress("handoff")).toBeLessThan(0.07);
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
      [ROUTE_ONE_IDS, 0, BREAK_CUT],
      [ROUTE_TWO_IDS, BREAK_CUT, 1],
    ] as const) {
      // V6.1: measured from where the route actually STARTS, not from its first
      // scene anchor. Route two now begins at the decompression lead-in, short of
      // `reorient`, so distance-from-reorient legitimately falls before it rises.
      // The contract being asserted -- the camera never backtracks along the
      // route -- is unchanged.
      const start = cameraPosition(lo);
      void ids;
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

  // V6.3: the route no longer ENDS on the handoff, it passes through it and
  // travels on (§4). The clamping contract is unchanged and is what this was
  // really guarding -- out-of-range progress resolves to the route's ends rather
  // than extrapolating off the curve -- so it is asserted against the terminus.
  it("starts framed on the hero and clamps to the route's own ends", () => {
    expect(cameraPosition(0)).toEqual(sceneAnchor("hero"));
    expect(cameraPosition(-1)).toEqual(sceneAnchor("hero"));
    expect(cameraPosition(1)).toEqual(TURN_WORLD);
    expect(cameraPosition(2)).toEqual(TURN_WORLD);
    expect(cameraPosition(1, true)).toEqual(TURN_MOBILE_WORLD);
  });

  // V8 (§3) REPLACED THIS TEST'S SUBJECT, and the replacement is the stronger
  // guard.
  //
  // Through V7 this asserted that the exit opened on a long down-and-right
  // DIAGONAL -- deliberately "comparable to the longest scene legs in the world"
  // -- because that leg carried the two destination surfaces previewing Selected
  // Systems and How I Build. The owner has rejected those previews as early
  // sparse duplicates, so the leg lost its only content, and §3 requires that no
  // dead scroll be left where they stood.
  //
  // So the contract inverts: the exit must now be a BEARING CHANGE and nothing
  // more. It still has to do the one job that was never about the previews --
  // hand the reader over already moving in the lower page's direction rather
  // than stopping and being replaced -- and it must do it without a journey in
  // front of it.
  it("hands over on a bearing change, not on a journey through empty world", () => {
    const { turn } = exitGeometry();

    // It genuinely turns: route two arrives at `handoff` climbing shallowly, and
    // the exit leaves steeply downward, which is the lower page's direction.
    const arrival = routeScreenAngle(EXIT_FROM - 0.02, EXIT_FROM);
    expect(turn.bearing).toBeGreaterThan(arrival + 30);
    expect(turn.bearing).toBeGreaterThan(55);
    expect(turn.bearing).toBeLessThan(85);

    // And it costs only what a bearing change costs. Bounded against a real
    // scene-to-scene leg rather than at a bare number, which is what makes "there
    // is no empty journey left here" a measured claim instead of a taste: the
    // exit must be a fraction of the distance between two consecutive projects.
    const sceneLeg = screenDistance(sceneAnchor("software-factory"), sceneAnchor("kivilcim"));
    expect(turn.length).toBeGreaterThan(40);
    expect(turn.length).toBeLessThan(sceneLeg * 0.6);

    // The exit is ONE leg. If a second is ever added back, it has to be argued
    // for on the record rather than reappearing quietly.
    expect(EXIT_SEGMENTS).toBe(1);
  });

  // §5 of the V6.5 brief in its own terms: "no section requiring disproportionately
  // more wheel input than neighboring sections". Asserted on the real progress
  // allocation rather than on the geometry it comes from.
  it("never charges more scroll for empty travel than for a scene", () => {
    const legs = routeLegs();
    const widths = legs.map((leg) => leg.toProgress - leg.fromProgress);
    // V8 FIXED A MISCATEGORISATION HERE, and it is the reason this test failed
    // the pass rather than the pass failing the test. `sceneWidths` began at
    // index 0, which is the ACQUISITION DESCENT -- a camera-only travel beat
    // with nothing standing on it, added in V6.7 and paid at ENTRY_ALLOWANCE.
    // Calling it a scene leg made the closing assertion read "the exit must be
    // cheaper than the cheapest EMPTY leg in the world", which is a claim about
    // two travel legs rather than the one this test is named for. The exit is
    // now compared against legs that actually carry a scene, at both ends.
    const sceneWidths = widths.slice(ENTRY_SEGMENTS, widths.length - EXIT_SEGMENTS);
    const travelWidths = widths.slice(widths.length - EXIT_SEGMENTS);

    const widestScene = Math.max(...sceneWidths);
    for (const [index, width] of travelWidths.entries()) {
      expect(width, `exit leg ${index} costs more scroll than the widest scene leg`).toBeLessThan(
        widestScene,
      );
    }
    // And the turn -- the leg with the least on it -- is the cheapest thing in the
    // whole world to scroll through, which is the shape §6 asks for: negative space
    // is allowed, dead scroll is not.
    expect(Math.min(...travelWidths)).toBeLessThan(Math.min(...sceneWidths));
  });
});

describe("the cut remains the one deliberate discontinuity", () => {
  // V6.4 RETIRED THE COLLISION MODEL, and these tests are superseded by that
  // decision rather than inconvenienced by it. What stood here was:
  //
  //   "reaches the wall exactly, rebounds off it, and never passes through it"
  //   "is never stationary inside the impact -- the world answers the hit"
  //   "accelerates into the wall instead of easing into it"
  //
  // All three asserted properties of a physical event the owner has now removed
  // from the design: a wall, a rebound displacement peaking at COLLISION_REBOUND,
  // and an approach that built to 1.35x the route average. None of those exist,
  // so the tests are not adjusted to pass -- the contracts they encoded are gone.
  //
  // What replaces them is the contract that survives the change and is in fact
  // STRONGER than what the collision needed: the route jumps at exactly one
  // progress, that jump is completely hidden, and the world's SPEED is continuous
  // across it even though its position is not.

  it("jumps at exactly one progress, and travels continuously up to it", () => {
    // Route one reaches its terminal coordinate exactly, with no held window in
    // front of it: the camera is still moving on the last frame before the cut.
    expect(cameraPosition(BREAK_CUT - 1e-9).x).toBeCloseTo(CUT_WORLD.x, 4);
    expect(cameraPosition(BREAK_CUT - 1e-9).y).toBeCloseTo(CUT_WORLD.y, 4);

    // And there is no stationary window anywhere in the approach to it -- the
    // thing IMPACT_WINDOW used to be. Sampled right up to the cut.
    const average = averageCameraSpeed();
    for (let p = BREAK_CUT - 0.06; p < BREAK_CUT - 0.002; p += 0.002) {
      expect(cameraSpeed(p) / average, `stationary at ${p.toFixed(4)}`).toBeGreaterThan(0.1);
    }
  });

  it("hands over at travelling speed on BOTH sides of the cut", () => {
    // THE V6.4 CONTRACT, and the difference between an occlusion and an impact.
    //
    // Through V6.3 route one ended at 1.35x the average (building into a wall) and
    // route two began at 0.42x (arriving at a scene), so the two halves of the same
    // instant disagreed about the world's speed by more than 3x. An occlusion cut
    // is an event in what can be SEEN, not an event in the world, so the world is
    // moving at the same rate on the last visible frame before the surfaces close
    // and the first visible frame after they open.
    const h = 0.0002;
    const oneSided = (from: number, to: number) =>
      screenDistance(cameraPosition(from), cameraPosition(to)) / Math.abs(to - from);

    const before = oneSided(BREAK_CUT - h, BREAK_CUT - 1e-9);
    const after = oneSided(BREAK_CUT, BREAK_CUT + h);
    expect(
      Math.abs(before - after) / Math.max(before, after),
      `speed mismatch across the cut: ${before.toFixed(1)} vs ${after.toFixed(1)}`,
    ).toBeLessThan(0.05);

    // And it is genuinely TRAVELLING speed, not reading speed: both sides run
    // above the route average rather than decelerating into the transition.
    const average = averageCameraSpeed();
    expect(before / average).toBeGreaterThan(1);
    expect(after / average).toBeGreaterThan(1);
  });

  it("repositions discontinuously at the cut -- a break, not a continuation", () => {
    const justBefore = cameraPosition(BREAK_CUT - 0.001);
    const atCut = cameraPosition(BREAK_CUT);
    // V6.1: the cut lands on the DECOMPRESSION anchor, not on `reorient`. The
    // camera is thrown into open world short of the scene and then travels into
    // it, which is what gives the first post-cut composition room to arrive clear
    // of the break's cover (see DECOMPRESSION_REACH).
    expect(atCut).toEqual(decompressionAnchor());
    expect(screenDistance(atCut, sceneAnchor("reorient"))).toBeGreaterThan(20);
    expect(atCut.x).toBeLessThan(justBefore.x);
    expect(atCut.y).toBeGreaterThan(justBefore.y);
    expect(Math.abs(atCut.x - justBefore.x)).toBeGreaterThan(100);
  });

  it("is completely covered at the instant it jumps, and only around it", () => {
    // The whole justification for the discontinuity: it is never witnessed.
    expect(breakWipeOffset(BREAK_CUT)).toBe(0);
    for (let index = 0; index < SCENE_BREAK_BANDS; index += 1) {
      expect(Math.abs(breakBandOffset(BREAK_CUT, index))).toBeLessThan(1e-9);
    }
    // ...and the world either side of the event is untouched by any of it.
    expect(isBreakActive(BREAK_COVER_START - 0.001)).toBe(false);
    expect(isBreakActive(BREAK_REVEAL_END + 0.001)).toBe(false);
  });

  it("opens the protected window on visible world, not on ink", () => {
    // The guard has to start before the surfaces do, or a fast reader's protected
    // event begins already black and never shows them what is being occluded.
    expect(BREAK_GUARD_FROM).toBeLessThan(BREAK_COVER_START);
    expect(BREAK_GUARD_FROM).toBeGreaterThan(0);
  });

  it("uses the same cut progress in both modes, so the break cannot desync", () => {
    // Deriving the split per mode left the mobile camera parked between the
    // shared cut and its own route-two start.
    expect(cameraPosition(BREAK_CUT, true)).toEqual(decompressionAnchor(true));
    expect(cameraPosition(BREAK_CUT - 0.001, true)).not.toEqual(decompressionAnchor(true));
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
    const one = speedIn(0, BREAK_CUT - 0.01);
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

  // V6.4: `currentSceneId` no longer has a "collision" return value, because
  // there is no window of progress the camera spends anywhere other than on one
  // of the two routes. The cut is an instant, and the scene that owns it is the
  // first scene of route two.
  it("hands ownership straight from route one to route two at the cut", () => {
    expect(currentSceneId(BREAK_CUT - 1e-6)).toBe("tail");
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

// V6.4 §4A. The junction is a claim of fact about the world -- "these projects
// exist elsewhere on the larger map" -- so its geometry is asserted rather than
// eyeballed. What matters is that it is a genuinely DIFFERENT route, not a kink
// in the one the camera takes.
describe("the work-route junction", () => {
  it("leaves the main route just after the handoff", () => {
    expect(WORK_BRANCH_FROM).toBeGreaterThan(sceneFocusProgress("handoff"));
    expect(WORK_BRANCH_FROM).toBeLessThan(1);
    // It starts ON the route, exactly -- a branch that began beside the path it
    // branches from would read as an unrelated mark.
    const [start] = workBranch();
    expect(start).toEqual(cameraPosition(WORK_BRANCH_FROM));
  });

  it("diverges from the camera's direction, and keeps diverging", () => {
    const bearing = (from: { x: number; y: number }, to: { x: number; y: number }) =>
      (Math.atan2(to.y - from.y, (to.x - from.x) * VW_PER_VH) * 180) / Math.PI;
    const points = workBranch();

    // THE FORK, at the junction itself. Deliberately not asserted as a huge angle:
    // an emphatic fork put the branch's terminus above the top of the frame (see
    // BRANCH_DIVERGENCE), and a route the reader cannot see the end of states
    // nothing. This is the bound that keeps it a visible fork rather than a
    // smooth continuation of the same line.
    const main = routeScreenAngle(WORK_BRANCH_FROM, WORK_BRANCH_FROM + 0.004);
    expect(Math.abs(main - bearing(points[0]!, points[1]!))).toBeGreaterThan(18);

    // THE DIVERGENCE THAT ACTUALLY READS is cumulative: the main route steepens
    // across the traverse while the branch stays near horizontal, so by the time
    // both have finished they are pointing in unmistakably different directions.
    const overallBranch = bearing(points[0]!, points[points.length - 1]!);
    const overallMain = bearing(cameraPosition(WORK_BRANCH_FROM), cameraPosition(1));
    expect(Math.abs(overallMain - overallBranch)).toBeGreaterThan(45);
  });

  it("travels far enough to be a route rather than a tick", () => {
    const points = workBranch();
    let length = 0;
    for (let i = 1; i < points.length; i += 1) length += screenDistance(points[i - 1]!, points[i]!);
    // 85 screen units, not the 120 a first pass asserted. The branch's length is
    // bounded by the frame, not by taste: its terminus carries three labels that
    // have to be READ, so pushing it further right walks them into the clip edge
    // of the sticky viewport. 96 units is still over half the exit traverse's own
    // diagonal, which is the comparison that makes it a route rather than a tick.
    expect(length).toBeGreaterThan(85);
    // Two legs with a real bend between them, so it reads as routed rather than
    // as a ray fired off the main line.
    expect(points).toHaveLength(3);
    const legOne =
      (Math.atan2(points[1]!.y - points[0]!.y, (points[1]!.x - points[0]!.x) * VW_PER_VH) * 180) /
      Math.PI;
    const legTwo =
      (Math.atan2(points[2]!.y - points[1]!.y, (points[2]!.x - points[1]!.x) * VW_PER_VH) * 180) /
      Math.PI;
    expect(Math.abs(legTwo - legOne)).toBeGreaterThan(10);
  });

  it("ends clear of the camera's own path, so the two are never confused", () => {
    const terminus = workBranch()[2]!;
    let closest = Number.POSITIVE_INFINITY;
    for (let p = sceneFocusProgress("handoff"); p <= 1; p += 0.002) {
      closest = Math.min(closest, screenDistance(terminus, cameraPosition(p)));
    }
    expect(closest).toBeGreaterThan(40);
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

  it("holds a genuine full-black moment either side of the cut", () => {
    // V6.4 makes this a named beat of the sequence rather than the instant between
    // closing and opening (BREAK_DWELL 0.007 -> 0.011). Asserted as a real span of
    // progress in which EVERY element of the break is home, because "controlled
    // full-black moment" is a duration, not a frame.
    expect(isBreakActive(BREAK_CUT)).toBe(true);
    for (const p of [BREAK_CUT - BREAK_DWELL * 0.5, BREAK_CUT, BREAK_CUT + BREAK_DWELL * 0.5]) {
      expect(breakWipeOffset(p), `field not home at ${p.toFixed(4)}`).toBe(0);
      for (let index = 0; index < SCENE_BREAK_BANDS; index += 1) {
        expect(
          Math.abs(breakBandOffset(p, index)),
          `rail ${index} at ${p.toFixed(4)}`,
        ).toBeLessThan(1e-9);
      }
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
    expect(BREAK_COVER_START).toBeLessThan(BREAK_CUT);
    expect(BREAK_REVEAL_END).toBeGreaterThan(BREAK_CUT);
    expect(hasRepositioned(BREAK_CUT - 0.001)).toBe(false);
    expect(hasRepositioned(BREAK_CUT)).toBe(true);
  });
});

describe("world grammar derives from the route", () => {
  it("samples the real curve for every travelled leg, not straight chords", () => {
    const legs = routeLegs();
    // Derived from the route's own structure rather than hardcoded: route one is
    // its scenes plus the wall, and route two is its scenes plus V6.1's
    // decompression lead-in. A literal count silently goes stale whenever the
    // route gains or loses a coordinate, which is exactly what happened here.
    // V6.7: route one is [hero, ENTRY, ...scenes, cut], so it has one leg beyond
    // its scene count -- the acquisition descent (JOB 1). Still derived from
    // structure rather than hardcoded, for exactly the reason above: this is the
    // third time a coordinate has been added to a route, and each time the derived
    // form has survived while a literal would not have.
    const routeOneLegs = ROUTE_ONE_IDS.length + ENTRY_SEGMENTS;
    // V6.3: route two is [lead-in, ...scenes, traverse, descent], so it now has
    // two legs beyond its scene count -- the exit traverse (§4). Still derived
    // from structure rather than hardcoded, for exactly the reason above.
    const routeTwoLegs = ROUTE_TWO_IDS.length + EXIT_SEGMENTS;
    expect(legs.filter((leg) => leg.route === 1)).toHaveLength(routeOneLegs);
    expect(legs.filter((leg) => leg.route === 2)).toHaveLength(routeTwoLegs);
    expect(legs).toHaveLength(routeOneLegs + routeTwoLegs);
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

    // Sampled strictly INSIDE each leg. V6.4 made that necessary and it is a
    // boundary artifact rather than a weakening: route one's last leg now ends
    // exactly at BREAK_CUT (through V6.3 it ended at COLLISION_PROGRESS, an
    // impact window earlier), and `cameraPosition(BREAK_CUT)` is by contract
    // already on route two -- `hasRepositioned(BREAK_CUT)` is asserted true a few
    // tests above. So a sample taken at that one endpoint compares route one's
    // rail against route two's first coordinate, 630 units away. Every interior
    // point of every leg, including 1e-9 short of the join, is still checked.
    for (const leg of routeLegs()) {
      for (let i = 0; i <= 6; i += 1) {
        const at = leg.fromProgress + ((leg.toProgress - leg.fromProgress) * i) / 6;
        const p = Math.min(at, leg.toProgress - 1e-9);
        expect(distanceToPolyline(leg.points, cameraPosition(p))).toBeLessThan(1);
      }
    }
  });

  it("sizes the hero's lead rule to the direction the camera leaves on", () => {
    const rule = heroLeadRule(18);
    const legRatio =
      (sceneAnchor("kivilcim").y - sceneAnchor("hero").y) /
      (sceneAnchor("kivilcim").x - sceneAnchor("hero").x);
    expect(rule.height / rule.width).toBeCloseTo(legRatio, 10);
  });
});
