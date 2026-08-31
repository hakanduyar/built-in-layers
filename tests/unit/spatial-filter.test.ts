import { describe, expect, it } from "vitest";
import {
  ROUTE_MAX_RATE,
  SPEED_RELEASE_MS,
  SPEED_SETTLED,
  SPEED_TIGHT,
  TAU_SETTLED_MS,
  TAU_TIGHT_MS,
  advanceFilter,
  filterTau,
  lagStep,
  trackSpeed,
  type FilterState,
  GLIDE_MAX_RATE,
  GLIDE_RELEASE_GAIN,
  glideStep,
} from "@/lib/spatial/cameraFilter";
import { BREAK_CUT } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main).
//
// These tests exist because V5 replaced V4's single overdamped spring with two
// cascaded first-order lags, and that swap was made specifically to buy a
// STRONGER guarantee: a spring is overdamped by tuning, whereas a lag cascade
// cannot overshoot for ANY dt or tau, including a tau that changes every frame.
// The collision cut is a threshold on this filter's output, so "cannot cross
// twice" is a correctness property of the reposition, not a comfort setting.
//
// What is deliberately NOT tested here: the exact tuning constants' values.
// Those are art direction and are expected to move. The contracts below are
// what must survive re-tuning.

/** One frame of input at a fixed rate, as the camera's rAF loop would deliver. */
function run(
  targets: number[],
  dtMs = 16.7,
  speed = 0,
): { states: FilterState[]; output: number[] } {
  let state: FilterState = { stage1: targets[0]!, stage2: targets[0]!, speed: 0 };
  const states: FilterState[] = [];
  for (const target of targets) {
    state = advanceFilter(state, target, speed, dtMs);
    states.push(state);
  }
  return { states, output: states.map((s) => s.stage2) };
}

function ramp(from: number, to: number, steps: number): number[] {
  return Array.from({ length: steps }, (_, i) => from + ((to - from) * i) / (steps - 1));
}

describe("lagStep never passes its target", () => {
  it("stays on the near side of the target for a wide range of dt and tau", () => {
    // The no-overshoot property must hold for ANY dt/tau, which is exactly what
    // lets the camera change its time constant per frame.
    for (const dt of [0.5, 8, 16.7, 33, 50, 250, 5000]) {
      for (const tau of [1, 12, 26, 62, 400]) {
        expect(lagStep(0, 1, dt, tau)).toBeGreaterThan(0);
        expect(lagStep(0, 1, dt, tau)).toBeLessThanOrEqual(1);
        // Symmetric: approaching from above must not undershoot past it either.
        expect(lagStep(1, 0, dt, tau)).toBeGreaterThanOrEqual(0);
        expect(lagStep(1, 0, dt, tau)).toBeLessThan(1);
      }
    }
  });

  it("is a no-op for a non-positive dt", () => {
    // A paused tab or a duplicated frame timestamp must not move the camera.
    expect(lagStep(0.4, 1, 0, 62)).toBe(0.4);
    expect(lagStep(0.4, 1, -16, 62)).toBe(0.4);
  });

  it("moves further per frame as the time constant tightens", () => {
    const loose = lagStep(0, 1, 16.7, TAU_SETTLED_MS);
    const tight = lagStep(0, 1, 16.7, TAU_TIGHT_MS);
    expect(tight).toBeGreaterThan(loose);
  });
});

describe("filterTau maps input speed to responsiveness", () => {
  it("uses the settled constant at or below the settled speed", () => {
    expect(filterTau(0)).toBeCloseTo(TAU_SETTLED_MS, 10);
    expect(filterTau(SPEED_SETTLED)).toBeCloseTo(TAU_SETTLED_MS, 10);
    expect(filterTau(SPEED_SETTLED / 2)).toBeCloseTo(TAU_SETTLED_MS, 10);
  });

  it("uses the tight constant at or above the tight speed", () => {
    expect(filterTau(SPEED_TIGHT)).toBeCloseTo(TAU_TIGHT_MS, 10);
    expect(filterTau(SPEED_TIGHT * 4)).toBeCloseTo(TAU_TIGHT_MS, 10);
  });

  it("tightens monotonically between the two, and never inverts", () => {
    // §7's binding requirement is that the camera must not chase the user, so
    // tau must FALL as input speed rises -- the opposite of the brief's first
    // suggestion. A regression here would restore the coast V5 exists to remove.
    let previous = filterTau(0);
    for (let speed = 0; speed <= SPEED_TIGHT * 1.5; speed += 0.01) {
      const tau = filterTau(speed);
      expect(tau).toBeLessThanOrEqual(previous + 1e-12);
      expect(tau).toBeGreaterThanOrEqual(TAU_TIGHT_MS - 1e-12);
      expect(tau).toBeLessThanOrEqual(TAU_SETTLED_MS + 1e-12);
      previous = tau;
    }
  });

  it("is direction-agnostic — scrolling up tightens exactly as scrolling down", () => {
    for (const speed of [0.05, 0.2, 0.4, 0.9]) {
      expect(filterTau(-speed)).toBeCloseTo(filterTau(speed), 12);
    }
  });
});

describe("trackSpeed has instant attack and slow release", () => {
  it("adopts a faster input immediately", () => {
    expect(trackSpeed(0, 0.8, 16.7)).toBeCloseTo(0.8, 12);
  });

  it("decays rather than dropping when input slows", () => {
    const decayed = trackSpeed(0.8, 0, 16.7);
    expect(decayed).toBeLessThan(0.8);
    expect(decayed).toBeGreaterThan(0.7);
  });

  it("decays by the documented release constant", () => {
    // After one full release time-constant, e^-1 of the estimate remains.
    expect(trackSpeed(1, 0, SPEED_RELEASE_MS)).toBeCloseTo(Math.exp(-1), 6);
  });

  it("treats direction as irrelevant to speed", () => {
    expect(trackSpeed(0, -0.6, 16.7)).toBeCloseTo(0.6, 12);
  });
});

describe("the filter cannot overshoot a monotonic journey", () => {
  it("keeps the output monotonic and behind the input", () => {
    const targets = ramp(0, 1, 400);
    const { states, output } = run(targets, 16.7, 0.3);

    for (let i = 1; i < output.length; i += 1) {
      expect(output[i]!).toBeGreaterThanOrEqual(output[i - 1]! - 1e-12);
    }
    states.forEach((state, i) => {
      // stage1 trails the input, stage2 trails stage1: the cascade never leads.
      expect(state.stage1).toBeLessThanOrEqual(targets[i]! + 1e-12);
      expect(state.stage2).toBeLessThanOrEqual(state.stage1 + 1e-12);
    });
  });

  it("holds that guarantee even when the time constant changes every frame", () => {
    // The whole reason for choosing a lag cascade over a spring. Alternate
    // between the slowest and fastest response on consecutive frames -- a
    // pathological input a spring blend could not survive without overshoot.
    const targets = ramp(0, 1, 300);
    let state: FilterState = { stage1: 0, stage2: 0, speed: 0 };
    let previous = 0;
    targets.forEach((target, i) => {
      state = advanceFilter(state, target, i % 2 === 0 ? 0 : SPEED_TIGHT * 3, 16.7);
      expect(state.stage2).toBeGreaterThanOrEqual(previous - 1e-12);
      expect(state.stage2).toBeLessThanOrEqual(target + 1e-12);
      previous = state.stage2;
    });
  });

  it("does not teleport when a backgrounded tab returns", () => {
    // The camera clamps dt at 50ms upstream; the filter itself must still be
    // sane if handed a large dt, i.e. converge without passing the target.
    const state = advanceFilter({ stage1: 0, stage2: 0, speed: 0 }, 1, 0, 50);
    expect(state.stage2).toBeGreaterThan(0);
    expect(state.stage2).toBeLessThan(1);
  });
});

describe("the collision cut cannot flicker", () => {
  it("crosses BREAK_CUT exactly once for a monotonic approach", () => {
    // The reposition is a threshold on stage2. Crossing it twice would jump the
    // world back and forth. Monotonicity makes that impossible in principle,
    // and this is the test that says so about the real constant.
    const targets = ramp(BREAK_CUT - 0.08, BREAK_CUT + 0.08, 600);
    const { output } = run(targets, 16.7, 0.25);

    let crossings = 0;
    for (let i = 1; i < output.length; i += 1) {
      const before = output[i - 1]! >= BREAK_CUT;
      const after = output[i]! >= BREAK_CUT;
      if (before !== after) crossings += 1;
    }
    expect(crossings).toBe(1);
  });

  it("does not re-cross when the reader stops dead just past the cut", () => {
    // The realistic flicker risk: a flick that lands barely past the threshold
    // and then stops. An underdamped filter would ring back across it.
    const approach = ramp(BREAK_CUT - 0.05, BREAK_CUT + 0.004, 200);
    const held = Array.from({ length: 400 }, () => BREAK_CUT + 0.004);
    const { output } = run([...approach, ...held], 16.7, 0.5);

    const settled = output.slice(-200);
    expect(Math.min(...settled)).toBeGreaterThanOrEqual(
      Math.min(...output.slice(approach.length, approach.length + 5)) - 1e-9,
    );
    // Once past, it stays past.
    const firstPast = output.findIndex((value) => value >= BREAK_CUT);
    expect(firstPast).toBeGreaterThan(-1);
    expect(output.slice(firstPast).every((value) => value >= BREAK_CUT)).toBe(true);
  });
});

describe("the filter settles rather than chasing", () => {
  it("converges on a held target", () => {
    const held = Array.from({ length: 600 }, () => 0.5);
    let state: FilterState = { stage1: 0, stage2: 0, speed: 0 };
    for (const target of held) state = advanceFilter(state, target, 0, 16.7);
    expect(state.stage2).toBeCloseTo(0.5, 6);
  });

  it("settles sooner after fast input than after slow input", () => {
    // The measured complaint V5 fixes: at speed, V4 kept travelling after the
    // reader stopped. Tighter tau at speed means the residual gap closes faster.
    const stopAt = 0.4;
    function residualAfterStop(inputSpeed: number): number {
      let state: FilterState = { stage1: 0, stage2: 0, speed: 0 };
      for (let i = 0; i < 60; i += 1) {
        state = advanceFilter(state, (stopAt * i) / 59, inputSpeed, 16.7);
      }
      for (let i = 0; i < 12; i += 1) state = advanceFilter(state, stopAt, 0, 16.7);
      return stopAt - state.stage2;
    }
    expect(residualAfterStop(SPEED_TIGHT)).toBeLessThan(residualAfterStop(SPEED_SETTLED));
  });
});

describe("the filter is deterministic", () => {
  it("produces identical output for identical input", () => {
    const targets = ramp(0, 1, 250);
    expect(run(targets, 16.7, 0.3).output).toEqual(run(targets, 16.7, 0.3).output);
  });
});

// V6.8 (JOB 1): the opening glide governor. Measured before it existed, a normal
// wheel run peaked at 6,881 px/s of world movement in the departure and a trackpad
// fling crossed the whole opening in a single frame. These are the contracts that
// keep that fixed.
describe("glideStep bounds the opening departure", () => {
  const ZONE = 0.06;

  it("never exceeds the capped rate inside the glide zone", () => {
    let position = 0;
    for (let i = 0; i < 200 && position < ZONE; i += 1) {
      const next = glideStep(position, 0.5, 16.7, ZONE);
      expect(next - position).toBeLessThanOrEqual(GLIDE_MAX_RATE * (16.7 / 1000) + 1e-9);
      position = next;
    }
    expect(position).toBeGreaterThan(0);
  });

  it("is symmetric: reverse travel back into the zone is governed too", () => {
    const next = glideStep(0.03, -0.5, 16.7, ZONE);
    expect(0.03 - next).toBeLessThanOrEqual(GLIDE_MAX_RATE * (16.7 / 1000) + 1e-9);
    expect(next).toBeLessThan(0.03);
  });

  it("V7: holds the route-wide ceiling past the release band — never uncapped", () => {
    // The owner's §10 is absolute: progression may be slower than the designed
    // ceiling anywhere, faster nowhere. The old contract released to uncapped
    // past the band, which still allowed a fling to jump the rest of the route
    // in one frame; the band now ramps INTO ROUTE_MAX_RATE and stays there.
    const past = ZONE * (1 + 2);
    const step = glideStep(past, past + 0.3, 16.7, ZONE) - past;
    expect(step).toBeCloseTo(ROUTE_MAX_RATE * (16.7 / 1000), 6);
    // Small movements inside the budget still pass through exactly.
    const tiny = ROUTE_MAX_RATE * (16.7 / 1000) * 0.5;
    expect(glideStep(past, past + tiny, 16.7, ZONE)).toBe(past + tiny);
    // And the ceiling binds in reverse, symmetrically.
    const back = glideStep(past, past - 0.3, 16.7, ZONE) - past;
    expect(back).toBeCloseTo(-ROUTE_MAX_RATE * (16.7 / 1000), 6);
  });

  it("releases gradually: the band's cap grows but stays a cap", () => {
    const inBand = ZONE * 1.5;
    const step = glideStep(inBand, 0.9, 16.7, ZONE) - inBand;
    const capMax = GLIDE_MAX_RATE * GLIDE_RELEASE_GAIN * (16.7 / 1000);
    expect(step).toBeGreaterThan(GLIDE_MAX_RATE * (16.7 / 1000));
    expect(step).toBeLessThanOrEqual(capMax + 1e-9);
  });

  it("is a no-op when no zone is configured", () => {
    expect(glideStep(0, 0.4, 16.7, 0)).toBe(0.4);
  });

  it("leaves sub-cap movement exactly alone (slow reading is untouched)", () => {
    expect(glideStep(0.01, 0.0101, 16.7, ZONE)).toBe(0.0101);
  });
});
