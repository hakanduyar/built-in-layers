"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import {
  DestinationSurface,
  type DestinationPreview,
} from "@/components/spatial/DestinationSurface";
import { DirectionalField } from "@/components/spatial/DirectionalField";
import { ProjectPlane } from "@/components/spatial/ProjectPlane";
import { SceneBreak } from "@/components/spatial/SceneBreak";
import { SystemField } from "@/components/spatial/SystemField";
import { SystemsWord } from "@/components/spatial/SystemsWord";
import { SystemPOV } from "@/components/spatial/SystemPOV";
import { WorldGrammar } from "@/components/spatial/WorldGrammar";
import {
  BREAK_ABORT_PX,
  BREAK_PLAYBACK_MS,
  advanceFilter,
  glideStep,
  type FilterState,
} from "@/lib/spatial/cameraFilter";
import {
  CAMERA_INSET,
  CAMERA_INSET_MOBILE,
  PLANE_DEEP,
  PLANE_DISTANT,
  PLANE_NEAR,
  ROUTE_LENGTH_VH,
  ROUTE_TWO_IDS,
  SCENE_IDS,
  SCENE_MIN_HEIGHT,
  SCENE_SCALE_FAR,
  SCENE_SCALE_FOCUS,
  SCENE_WIDTH,
  SCENE_WIDTH_MOBILE,
  sceneAnchor,
  type SceneId,
} from "@/lib/spatial/scenes";
import {
  BREAK_COVER_CLOSED,
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_GUARD_FROM,
  BREAK_GUARD_TO,
  BREAK_REVEAL_START,
  ENTRY_GLIDE_TO,
  cameraPosition,
  sceneApproach,
  sceneFocusProgress,
} from "@/lib/spatial/sceneRoute";
import type { SystemAnnotation } from "@/lib/spatial/systemPov";
import { useHasMounted } from "@/lib/utils/useHasMounted";

/** Composed scenes. `tail` is the near-empty beat before the cut, and its
 *  whole composition is the giant word the structural plane opens behind, which
 *  only this component can drive. */
type ComposedSceneId = Exclude<SceneId, "tail">;

type SpatialCameraProps = Record<ComposedSceneId, ReactNode> & {
  /** The giant expressive word the structural plane opens behind. */
  systemsWord: string;
  /** Distant/near travel material, rendered on their own depth planes. */
  distantMaterial?: ReactNode;
  nearMaterial?: ReactNode;
  /**
   * V6.4 (§4B-C): the two destinations foreshadowed along the exit traverse, as
   * DATA rather than as nodes.
   *
   * They have to be constructed in here because they read the filtered progress
   * value, which only exists on the client -- but every word in them comes from
   * the server component's own copy module, so this file still names no section
   * and invents no line. Placement lives in DestinationSurface with the rest of
   * the art direction.
   */
  nearDestination?: DestinationPreview;
  deepDestination?: DestinationPreview;
  /**
   * V6.4 (§4A): the real project names the work-route branch points at. Passed in
   * rather than imported, because only the server component has the content
   * loader -- there is no slug table in here and nothing invented.
   */
  branchDestinations?: readonly string[];
  /**
   * What the observing system is allowed to say about a scene, derived from
   * real project frontmatter by lib/spatial/systemPov.ts. Scenes without one
   * are simply not annotated -- there is no placeholder readout.
   */
  annotations?: Partial<Record<SceneId, SystemAnnotation>>;
};

/**
 * THE SCENE-BREAK EVENT. Scroll TRIGGERS it; scroll velocity does not drive it.
 *
 * V6.4 KEPT THIS AND CHANGED NOTHING STRUCTURAL. The V6.4 brief retires the
 * collision but explicitly asks for the fast-scroll timing protection learned in
 * V6.2/V6.3 to survive, and to be simplified "as much as reasonably possible".
 * The honest answer to the second half is: there is nothing left to remove. Each
 * of the four parts below exists because a measured failure demanded it, and the
 * V6.4 simplification is that it now protects THREE phases instead of five, over
 * a shorter band, at a shorter duration -- not that the mechanism got smaller.
 *
 * THE ARCHITECTURE, in the order it runs:
 *
 *   scroll crosses the threshold
 *     -> the event latches, on a monotonic wall clock
 *     -> the occlusion plays at a fixed rate for BREAK_PLAYBACK_MS
 *     -> incoming forward scroll intent inside the window is absorbed, not queued
 *     -> the event completes and control returns, with no reconciliation jump
 *
 * WHY THE RAMP DRIVES SCROLL RATHER THAN THE VISUAL. V6.2 clamped scroll only when
 * it ran AHEAD of the ramp, while driving the visual along the ramp
 * unconditionally. Those two rules disagree for any reader moving slower than the
 * ramp: the visual is played forward while the scroll position stays behind it,
 * and at release the filter snaps the visual back to where scroll actually is --
 * rewinding the event mid-play. How long the break appeared to be visible was
 * really a measure of how far that divergence had got, which is why it measured
 * anywhere from 50ms to 2.9s across profiles.
 *
 * Here the ramp drives SCROLL ITSELF, in both directions. The visual is then just
 * the ordinary filtered scroll position, exactly as everywhere else in the world,
 * so there is nothing for the two to disagree about and nothing to reconcile at
 * the end.
 *
 * WHY THIS IS NOT GENERAL SCROLL-JACKING, precisely:
 *
 *   - It is armed only inside ONE 0.089-wide band of ONE section -- 238px of a
 *     3115px route. Everywhere else scroll is untouched by any of this.
 *   - It has a HARD time limit. After BREAK_PLAYBACK_MS it releases no matter
 *     what, so it cannot trap a reader even if every other check fails.
 *   - Scrolling BACK aborts it immediately (BREAK_ABORT_PX). The escape is
 *     always available, always one gesture, and never rate-limited.
 *   - FORWARD wheel input is cancelled while the event plays, and only then --
 *     see the absorber below for why that turned out to be unavoidable, and for
 *     the three bounds that keep it from being general scroll-jacking. Backward
 *     input is never cancelled. The page is never pinned and no scroll container
 *     is frozen; assistive technology and in-page navigation are untouched.
 *   - It requires recent real scroll input to arm, so keyboard re-centering, skip
 *     links, in-page anchors, scroll restoration and tests driving `scrollTo` are
 *     never captured.
 *
 * It lives entirely in the enhanced path, so reduced motion never sees it.
 */
/** How recently real scroll input must have happened for the event to arm. Long
 *  enough to cover a fling's inertia, short enough that a programmatic jump
 *  seconds later is never mistaken for one. */
const USER_INPUT_WINDOW_MS = 400;

type FilterResyncRef = React.RefObject<((value: number) => void) | null>;

function useSceneBreakEvent(
  spacerRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  resyncRef: FilterResyncRef,
): void {
  const state = useRef<{
    phase: "idle" | "playing" | "spent";
    /** Which way the transition is playing. V6.7: the event is bidirectional. */
    dir: 1 | -1;
    startedAt: number;
    lastY: number;
    /** The reader's last real direction of travel, used to resolve a stall. */
    lastMoveDir: 1 | -1;
  }>({ phase: "idle", dir: 1, startedAt: 0, lastY: -1, lastMoveDir: 1 });

  // Spacer geometry, measured out of the frame loop. Refreshed on mount and on
  // resize; the spacer's height is a fixed vh value and its offset only changes
  // when layout above it does, so nothing else can invalidate it.
  const boxRef = useRef<{ top: number; span: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const spacer = spacerRef.current;
      if (!spacer) return;
      boxRef.current = {
        top: spacer.getBoundingClientRect().top + window.scrollY,
        span: spacer.offsetHeight - window.innerHeight,
      };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [spacerRef, enabled]);

  // The event protects against a USER flinging past it. It must not fire on a
  // PROGRAMMATIC jump -- `recenterOnScene`'s keyboard re-centering, a skip link,
  // an in-page anchor, the browser restoring a scroll position on reload, or a
  // test driving `window.scrollTo`. Capturing those would fight navigation the
  // reader explicitly asked for and would leave focus somewhere the camera is not.
  //
  // So arming requires recent real scroll input. Passive listeners only: nothing
  // here cancels or delays an event, it just records that one happened.
  const inputAtRef = useRef(-Infinity);
  useEffect(() => {
    const mark = () => {
      inputAtRef.current = performance.now();
    };
    const keys = new Set([
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
      "Spacebar",
    ]);
    const onKey = (event: KeyboardEvent) => {
      if (keys.has(event.key)) mark();
    };
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchmove", mark, { passive: true });
    window.addEventListener("keydown", onKey, { passive: true });
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  /**
   * FORWARD-INPUT ABSORPTION, and the reason the V6.2 approach could not have
   * worked no matter how the ramp was shaped.
   *
   * Setting `window.scrollY` does not cancel Chromium's in-flight wheel scroll
   * animation, which runs on the compositor and keeps re-applying its own target.
   * Measured on a 900px x 14 burst, the position ALTERNATED every frame between
   * the ramp and the fling's target -- 1513, 2430, 1547, 2456, 1563, 2472 -- for
   * 830ms. The guard was doing exactly what it was told and the browser was
   * overwriting it on the intervening frames, so half of the event's frames
   * were rendered at a point 0.27 of progress past it. That is why the measured
   * time inside the impact window came out at 17ms while the guard reported
   * holding for 2.6s: both numbers were true.
   *
   * So forward wheel input is CANCELLED for the duration of the event. Three
   * things keep this from being the general scroll-jacking §2 forbids:
   *
   *   - `deltaY > 0` only. Scrolling BACK is never cancelled -- it passes
   *     straight through and trips the abort, so the escape is always one
   *     gesture and is never rate-limited.
   *   - It is only ever cancelled while the event is actually playing, which is
   *     bounded at BREAK_PLAYBACK_MS by a check that runs before anything
   *     else in the frame loop.
   *   - The non-passive listener is only ATTACHED while the reader is within
   *     ~1.5 viewports of the break, and removed again on the way out. A
   *     non-passive wheel listener costs scroll performance for as long as it
   *     exists, so it does not exist anywhere else on the page or on any other
   *     page.
   *
   * The absorbed momentum is not queued and replayed afterwards. That is a
   * deliberate choice rather than an omission: reconciling to the destination the
   * fling was aiming at would end the signature event with a jump of a couple of
   * thousand pixels, which is a worse artefact than the one it fixes -- and
   * absorbing it is also simply what an occlusion does to intent: the reader
   * cannot aim at something they cannot see.
   */
  const absorbRef = useRef<{ attach: () => void; detach: () => void } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let attached = false;
    const block = (event: WheelEvent) => {
      const st = state.current;
      if (st.phase !== "playing") return;
      // V6.7: only input in the direction the transition is ALREADY TRAVELLING is
      // absorbed. The opposing gesture is never cancelled -- it passes straight
      // through and trips the abort, so the escape is always one gesture and is
      // never rate-limited, in either direction. Through V6.6 this was hardcoded to
      // `deltaY > 0`, which meant a reverse transition absorbed nothing and a
      // forward one could not be escaped by the gesture a reader actually makes.
      if (st.dir === 1 ? event.deltaY > 0 : event.deltaY < 0) event.preventDefault();
    };
    const api = {
      attach: () => {
        if (attached) return;
        window.addEventListener("wheel", block, { passive: false });
        attached = true;
      },
      detach: () => {
        if (!attached) return;
        window.removeEventListener("wheel", block);
        attached = false;
      },
    };
    absorbRef.current = api;
    return () => {
      api.detach();
      absorbRef.current = null;
    };
  }, [enabled]);

  useAnimationFrame(() => {
    // `performance.now()` rather than the frameloop's own timestamp: Motion's clock
    // has a different time ORIGIN from performance.now(), so comparing a frameloop
    // time against an input time recorded by a DOM listener yields a negative
    // difference that passes every `< window` test. That silently made the
    // user-input gate always true, and the latch fired on programmatic scrolls --
    // caught by four e2e tests that drive `window.scrollTo`.
    const now = performance.now();
    if (!enabled) {
      state.current = { phase: "idle", dir: 1, startedAt: 0, lastY: -1, lastMoveDir: 1 };
      return;
    }
    // Geometry comes from the cached measurement, never from a fresh
    // getBoundingClientRect().
    //
    // Measuring the spacer inside the frame loop forces a layout on EVERY frame
    // of every page view, which is exactly the kind of cost this world has spent
    // three passes avoiding. It also had a visible consequence: on WebKit the
    // extra per-frame layout delayed the camera filter enough that the break's
    // fully-closed dwell was no longer settled within the e2e sweep's 120ms
    // window, and the rail-gap test went from passing to a 537px gap.
    const box = boxRef.current;
    if (!box || box.span <= 0) return;

    const yStart = box.top + BREAK_GUARD_FROM * box.span;
    const yEnd = box.top + BREAK_GUARD_TO * box.span;
    // The ONLY fully-opaque span. "Stuck in black" is not a feeling, it is resting
    // between these two scroll positions, so this is what the stall resolver below
    // actually tests against.
    const yBlackFrom = box.top + BREAK_COVER_CLOSED * box.span;
    const yBlackTo = box.top + BREAK_REVEAL_START * box.span;
    const y = window.scrollY;
    const st = state.current;
    const previousY = st.lastY;
    st.lastY = y;
    if (previousY >= 0 && Math.abs(y - previousY) > 1) st.lastMoveDir = y > previousY ? 1 : -1;

    // The forward-input absorber exists only in the break's neighbourhood.
    // See the comment on absorbRef: a non-passive wheel listener costs scroll
    // performance for as long as it is attached, so it is attached for about
    // three viewports of one section and nowhere else.
    const near = y > yStart - window.innerHeight * 1.5 && y < yEnd + window.innerHeight;
    if (near) absorbRef.current?.attach();
    else absorbRef.current?.detach();

    /**
     * Begin a transition. `dir` 1 plays SYSTEMS -> black -> UNDERNEATH; -1 plays the
     * exact reverse. Both start by snapping scroll to the band edge they begin from,
     * which is the one place scroll is moved against the reader -- and it only
     * happens on an overshoot that would otherwise have skipped the event.
     */
    const play = (dir: 1 | -1) => {
      st.phase = "playing";
      st.dir = dir;
      st.startedAt = now;
      const from = dir === 1 ? yStart : yEnd;
      window.scrollTo(0, Math.round(from));
      // Re-seat the visual filter at the same edge. Without this the filter still
      // carries the fling's far target, so the visual sits mid-band -- i.e. fully
      // covered -- while scroll restarts the ramp, and the event plays out from
      // behind a black frame it never leaves.
      resyncRef.current?.(dir === 1 ? BREAK_GUARD_FROM : BREAK_GUARD_TO);
    };

    if (st.phase === "playing") {
      const elapsed = now - st.startedAt;
      // Release, checked before anything else and unconditional: the hard time
      // limit is what makes this a protected window rather than a trap.
      if (elapsed >= BREAK_PLAYBACK_MS) {
        st.phase = "spent";
        return;
      }

      const played = elapsed / BREAK_PLAYBACK_MS;
      const target =
        st.dir === 1 ? yStart + (yEnd - yStart) * played : yEnd - (yEnd - yStart) * played;

      // ESCAPE, now symmetric. "Against the playback" is up for a forward
      // transition and down for a reverse one; either way, one firm notch of it
      // aborts immediately and leaves the reader exactly where they put themselves.
      const against = st.dir === 1 ? target - y : y - target;
      if (against > BREAK_ABORT_PX) {
        st.phase = "spent";
        return;
      }

      // THE PLAYBACK. Scroll AND the value the visual reads are both written from
      // the same ramp, every frame, in both directions.
      //
      // V6.6 wrote only scroll and let the filter follow it. That is correct at any
      // speed a reader can produce by hand, and wrong for a fling: `scrollTo` does
      // not cancel Chromium's in-flight wheel animation, which keeps re-applying
      // its own target on the frames in between, so the filtered value the break
      // reads spends part of the event chasing a position past the band. Measured
      // on the extreme profile, that showed the fully-black dwell for 17ms where
      // the same event at reading pace showed it for 267ms -- not skipped, but not
      // perceptible either, and its duration was being set by scroll velocity,
      // which is exactly what the brief forbids.
      //
      // Writing both from one ramp makes the transition's duration a property of
      // the state machine alone. They cannot diverge, so there is still nothing to
      // reconcile when the window closes.
      if (Math.abs(y - target) > 0.5) window.scrollTo(0, Math.round(target));
      resyncRef.current?.((target - box.top) / box.span);
      return;
    }

    if (previousY < 0) {
      // First frame after mount. If the browser restored a scroll position inside
      // the band, treat the event as already spent rather than replaying it the
      // moment the reader touches the wheel -- being yanked on a reload is a bug,
      // not a signature moment. The stall resolver below still applies, so a
      // restore landing in solid black does not stay there.
      if (y >= yStart && y < yEnd) st.phase = "spent";
      return;
    }

    if (st.phase === "spent") {
      // Re-armable once the band has been left in EITHER direction. Through V6.6
      // this only re-armed backwards, so a reader who completed the forward
      // transition and then scrolled back up got no reverse transition at all.
      if (y < yStart - 4 || y > yEnd + 4) st.phase = "idle";
      // deliberately falls through: a reader who aborted INSIDE the opaque dwell
      // must still be resolved out of it.
    }

    const userDriven = now - inputAtRef.current < USER_INPUT_WINDOW_MS;

    /**
     * THE STALL RESOLVER -- the guarantee that the page can never stay black.
     *
     * If the reader has come to rest (no input for USER_INPUT_WINDOW_MS, and not
     * moving) at a scroll position inside the fully-covered dwell, the transition
     * is replayed out of it. It resolves in the direction the reader was last
     * actually travelling, so aborting upward returns to SYSTEMS and aborting
     * downward continues to UNDERNEATH -- it respects the intent rather than
     * picking the nearer edge arbitrarily.
     *
     * This is what makes the black a TRANSITION rather than a state. There is no
     * scroll position at which the world is opaque and stationary.
     */
    if (
      y > yBlackFrom &&
      y < yBlackTo &&
      !userDriven &&
      // ...but the reader must have scrolled AT SOME POINT. A position the page was
      // never scrolled to by a person -- a test driving `window.scrollTo`, a deep
      // link, a restored position -- is not a stall to rescue, and playing a
      // transition at it would move a page whose reader has not touched it. Real
      // readers always satisfy this within one gesture of arriving.
      Number.isFinite(inputAtRef.current) &&
      Math.abs(y - previousY) <= 1
    ) {
      play(st.lastMoveDir);
      return;
    }

    if (st.phase !== "idle") return;

    // ARMING ON A CROSSING, not on containment.
    //
    // A fling of ~1400px per notch takes the scroll position from before the band
    // to past it WITHIN ONE FRAME, so a containment test never sees a sample inside
    // the band and the event never arms. Detecting the crossing catches the
    // single-frame case in both directions; containment is kept as well so a reader
    // who is simply already inside the band still arms.
    const inside = y >= yStart && y < yEnd;
    const crossedForward = previousY < yStart && y >= yStart;
    const crossedReverse = previousY > yEnd && y <= yEnd;
    if (!userDriven) return;
    if (crossedForward || (inside && y > previousY)) {
      play(1);
      return;
    }
    if (crossedReverse || (inside && y < previousY)) {
      play(-1);
    }
  });
}

/**
 * V6.4 REMOVED THE IMPACT PULSE that stood here.
 *
 * It was a latched one-shot on a wall clock, added in V6.3 as a second,
 * independent guarantee that the hit played in full even if the scroll guard
 * failed to arm. It drove the wrapper recoil and the ImpactShock layer. With the
 * collision retired there is no hit to guarantee: the occlusion is expressed
 * entirely by the break's own geometry, which is a pure function of progress and
 * therefore cannot be half-played -- if the reader is at a progress, the surfaces
 * are exactly where that progress puts them.
 *
 * That is the deeper reason V6.3 needed two mechanisms and V6.4 needs one. An
 * animation with its own timeline can desync from scroll and has to be protected
 * separately; a value derived from scroll cannot. The scroll guard alone is now
 * sufficient, and one less clock is one less thing that can disagree.
 */

/**
 * How far back along the leg INTO `tail` the opening starts, as a fraction of
 * that leg.
 *
 * 0.36 is measured, not guessed, and it is RE-measured for V6.5 rather than
 * carried over. V6.4 used 0.41, fitted to V6.4's route; shortening the exit
 * traverse moved every progress in the world, and re-sweeping the live page at
 * 0.005 intervals -- reading the word's own bounding box back out of the browser --
 * puts the giant word 100% inside the viewport between 0.390 and 0.452, and at
 * least 90% inside from 0.383 to 0.468.
 *
 * 0.36 opens the window at 0.379, with the word ~92% framed and still arriving. The
 * aperture finishes opening at 0.429, in the middle of the fully-framed band, and
 * the plane then stands open until the cover begins at 0.460 -- i.e. the resolved
 * state gets the part of the window where the word is best framed, which is the
 * beat V6.4 spent closing again.
 *
 * Fitting it to `tail`'s focal progress instead -- the obvious choice, and the
 * first thing tried in V6.4 -- is wrong by about a fifth of the window, because the
 * camera leaves this anchor at travelling speed toward the cut rather than
 * lingering.
 */
const OPENING_LEAD = 0.36;

/** Progress window the SYSTEMS opening occupies, derived from the route. */
function openingWindow(mobile: boolean): [number, number] {
  const tail = sceneFocusProgress("tail", mobile);
  const previous = sceneFocusProgress("dropspot", mobile);
  return [tail - (tail - previous) * OPENING_LEAD, BREAK_COVER_START];
}

/**
 * Velocity-aware scroll filtering (§7). V4's fixed overdamped spring is
 * replaced by two cascaded first-order lags whose time constant shrinks as
 * scroll speed rises -- see lib/spatial/cameraFilter.ts for the measurements
 * that motivated it and the proof that it cannot overshoot.
 *
 * Everything visual still reads ONE value. Deriving some of it from raw
 * scroll and some from the filtered value is what would smear the cut, by
 * letting the break panel and the camera jump disagree about when the cut
 * happened.
 */
function useFilteredProgress(
  source: MotionValue<number>,
  enabled: boolean,
  resyncRef: FilterResyncRef,
): MotionValue<number> {
  const filtered = useMotionValue(source.get());
  const state = useRef<FilterState>({
    stage1: source.get(),
    stage2: source.get(),
    speed: 0,
  });

  // Imperative re-seat, used only by the scene-break event when it moves scroll
  // backwards onto the band. Installed in an effect rather than during render:
  // both closed-over values are refs/MotionValues that never change identity, and
  // a render-time assignment would be a write during render.
  useEffect(() => {
    resyncRef.current = (value: number) => {
      state.current = { stage1: value, stage2: value, speed: 0 };
      filtered.set(value);
    };
    return () => {
      resyncRef.current = null;
    };
  }, [filtered, resyncRef]);

  useAnimationFrame((_, delta) => {
    if (!enabled) return;
    const target = source.get();
    const previous = state.current;
    // Cheap bail-out once the filter has caught up: the frame callback still
    // fires, but a settled camera costs nothing.
    if (
      Math.abs(target - previous.stage1) < 1e-7 &&
      Math.abs(previous.stage1 - previous.stage2) < 1e-7 &&
      previous.speed < 1e-4
    ) {
      return;
    }
    // Clamped so a backgrounded tab returning after a long gap resumes rather
    // than teleporting the camera through the cut.
    const next = advanceFilter(previous, target, source.getVelocity(), Math.min(delta, 50));
    // V6.8: THE OPENING GLIDE. Inside the entry zone the camera's rate is
    // governed, whatever the wheel does -- see GLIDE_MAX_RATE for the
    // measurements. Both stages are re-seated to the governed value so leaving
    // the zone hands over to the ordinary filter dynamics without a lurch.
    const glided = glideStep(previous.stage2, next.stage2, Math.min(delta, 50), ENTRY_GLIDE_TO);
    state.current =
      glided === next.stage2 ? next : { stage1: glided, stage2: glided, speed: next.speed };
    filtered.set(state.current.stage2);
  });

  return enabled ? filtered : source;
}

export function SpatialCamera({
  systemsWord,
  distantMaterial,
  nearMaterial,
  nearDestination,
  deepDestination,
  branchDestinations = [],
  annotations = {},
  ...scenes
}: SpatialCameraProps) {
  const mounted = useHasMounted();
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const enhanced = mounted && !reduceMotion;
  const mobile = !isDesktop;

  const spacerRef = useRef<HTMLDivElement>(null);
  // The target is supplied only while the enhanced tree is actually rendered.
  // The spacer exists ONLY in that tree (see the early return below), so on the
  // first render and for every reduced-motion visitor `spacerRef.current` is
  // null -- and Motion's useScroll asserts exactly that case:
  //   Error: Target ref is defined but not hydrated.
  // Dev-only (the invariant is stripped from the production bundle, confirmed by
  // loading the production build with reducedMotion: "reduce"), but it is real
  // noise in the owner's console and the tracker it warns about is one nobody
  // reads: in the non-enhanced tree the filtered progress value is never
  // consumed. Omitting the target leaves useScroll tracking the viewport
  // harmlessly until `enhanced` flips true, at which point Motion re-initialises
  // against the spacer that now exists.
  const { scrollYProgress } = useScroll(
    enhanced
      ? { target: spacerRef, offset: ["start start", "end end"] }
      : { offset: ["start start", "end end"] },
  );

  // Raw scroll drives a filtered "visual progress"; EVERYTHING visual reads
  // from the filtered value -- camera, break, inspection, depth, system
  // annotations.
  const filterResyncRef = useRef<((value: number) => void) | null>(null);
  const progress = useFilteredProgress(scrollYProgress, !reduceMotion, filterResyncRef);
  // Plays the occlusion across a fixed window once scroll triggers it, so the
  // event cannot be compressed or skipped by scroll velocity. See
  // useSceneBreakEvent.
  useSceneBreakEvent(spacerRef, enhanced, filterResyncRef);

  // 0..1 across the SYSTEMS opening (V6.5).
  //
  // IT ENDS AT BREAK_COVER_START, so the plane is fully open and has been standing
  // open for a while by the time the occlusion begins. V6.4 spent this same window
  // opening AND closing, which is why its sequence resolved to nothing having
  // happened; here the second half of the window is the resolved state itself.
  //
  // IT BEGINS BEFORE THE WORD IS FRAMED, and that is a correction rather than a
  // flourish. Measured on the first V6.4 build, running it from `tail`'s focus to
  // the cover left 0.0355 of progress -- 142px of scroll, under a fifth of a
  // second at reading pace -- for the whole sequence. Reaching back into the leg
  // gives it 0.080 of progress, ~320px, and is derived from the neighbouring
  // anchors rather than authored, so it cannot silently shrink again the next time
  // the route's proportions move.
  const opening = useTransform(progress, openingWindow(mobile), [0, 1]);
  // V6.6: whether the surface cut is PAINTED at all. See the `active` prop on
  // SystemsWord for the measurement that made this necessary -- the cut is a large
  // rotated layer, and leaving it in the paint tree for the whole route cost 27
  // extra frames over 32ms across a scripted scroll. It exists from just before the
  // opening begins until the occlusion is fully closed over it, and nowhere else.
  const systemsActive = useTransform(progress, (value): number => {
    const [from] = openingWindow(mobile);
    return value > from - 0.03 && value < BREAK_CUT ? 1 : 0;
  });

  function scrollToProgress(target: number) {
    const spacer = spacerRef.current;
    if (!spacer) return;
    const rect = spacer.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const end = start + spacer.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + (end - start) * target, behavior: "smooth" });
  }

  /**
   * Bring the camera to the scene a newly-focused element belongs to.
   * Re-asserted on the next frame because WebKit runs its own native "scroll
   * the focused element into view" pass AFTER this handler, and because the
   * element lives inside a transformed world layer that computation lands the
   * camera in an unrelated region.
   */
  function recenterOnScene(id: SceneId) {
    const target = sceneFocusProgress(id, mobile);
    scrollToProgress(target);
    requestAnimationFrame(() => scrollToProgress(target));
  }

  if (!enhanced) {
    // No-JS and reduced-motion fallback (§31): the same real, fully composed
    // scenes in normal document flow -- no camera, no pinning, no parallax,
    // no depth motion, no inspection, no world grammar, no travel material.
    // Each scene keeps its full V4 composition, so this reads as a designed
    // linear page rather than a stripped dump.
    return (
      <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-24 px-4 py-16 md:px-6 lg:gap-40 lg:px-8">
        {SCENE_IDS.map((id) => {
          const annotation = annotations[id];
          return (
            // The system annotation survives here in its resolved, static form:
            // §37 keeps useful system metadata, and these two rows are real
            // project facts stated nowhere else on the page.
            <div key={id} className={annotation ? "relative" : undefined}>
              {annotation && <SystemPOV annotation={annotation} approach={null} />}
              {id === "tail" ? (
                <SystemsWord word={systemsWord} opening={null} active={null} />
              ) : (
                scenes[id]
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const inset = isDesktop ? CAMERA_INSET : CAMERA_INSET_MOBILE;

  return (
    <div ref={spacerRef} style={{ height: `${ROUTE_LENGTH_VH}vh` }} className="relative">
      {/* `overflow-clip`, not `overflow-hidden`: an `overflow: hidden` box is
          still a programmatically scrollable container, so focusing a link the
          camera had not reached made the browser scroll THIS box internally
          and shift the whole world off its camera position. */}
      <div className="sticky top-0 h-screen w-full overflow-clip bg-paper">
        {/* V6.4 REMOVED THE RECOIL that this wrapper used to carry: a 1.5% scale
            compression, 0.55deg of tilt and a residual x/y jitter, fired by the
            latched impact pulse. It was the last piece of the world "answering a
            hit", and with the hit gone it is not reduced, it is deleted -- an
            occlusion cut does not shake the thing it occludes.

            The element stays because the depth planes need one shared transformed
            parent, but it is now a plain container with no animation on it. */}
        <div className="absolute inset-0">
          {/* V6 (§20.1): the world's pulse, behind every depth plane. Driven by
              RAW progress rather than by the camera, so scroll always produces
              visible response even inside a focus zone where the camera has
              deliberately slowed to 0.42 of average. Desktop only -- it is
              texture, and mobile spends its budget on the content. */}
          {isDesktop && (
            <SystemField
              progress={progress}
              routeOne={[sceneFocusProgress("hero"), BREAK_CUT]}
              routeTwo={[BREAK_CUT, sceneFocusProgress("handoff")]}
            />
          )}

          {/* V6.4 (§4C): the deepest plane, carrying the destination foreshadowed
              furthest ahead. Behind the travel material, so the two future
              surfaces are genuinely at different distances rather than at two
              opacities on one plane. */}
          {isDesktop && deepDestination && (
            <CameraPlane progress={progress} rate={PLANE_DEEP} inset={inset} mobile={mobile}>
              <DestinationSurface slot="deep" preview={deepDestination} progress={progress} />
            </CameraPlane>
          )}

          {/* Depth planes (§12). Mobile keeps the world plane only: parallax
              at 375px buys little and risks motion sickness (§30). */}
          {isDesktop && (
            <CameraPlane progress={progress} rate={PLANE_DISTANT} inset={inset} mobile={mobile}>
              {/* V6.8 (§28): each project's field plane -- the second depth surface
                  its composition is read against. On this plane, not the world
                  plane, so the project slides across it as the camera travels. */}
              <ProjectPlane
                scene="kivilcim"
                // Review: anchor the plane's left edge to the identity column's own
                // margin (x offset 0 = the camera inset the text sits on) and give
                // the top a legible stagger below the media's top rule instead of
                // an 8px near-miss.
                // Final remediation: converted from vw/vh ({0,11} 58x60) to scene
                // fractions chosen to render IDENTICALLY at 1440x900 (0.0839 x 1180
                // = 99px = the old 11vh, 0.7078 x 1180 = 835px = the old 58vw), so
                // the approved composition is untouched -- verified by pixel diff
                // against the approved artifact. What changes is every OTHER
                // viewport: the plane now holds its registration to the px-capped
                // scene instead of inflating with the frame.
                offset={{ x: 0, y: 0.0839 }}
                width={0.7078}
                height={0.4576}
                progress={progress}
              />
              <ProjectPlane
                scene="dropspot"
                // DROPSPOT REMEDIATION: the review-build plane ({26,-6} 52x58)
                // framed as a band ABOVE the media, and the media's arrival buried
                // it -- at focus it survived as a pale strip behind the summary,
                // which is exactly the "rectangle behind content" the plane exists
                // to not be. It is now the GROUND the evidence stands on, offset
                // down-right of it -- the direction the camera is travelling. At
                // focus (1440x900) the media overhangs the plane's top and left
                // edges, so the two can never read as a frame and its picture,
                // and the plane's RIGHT EDGE REGISTERS EXACTLY ON THE SCENE
                // BLOCK'S RIGHT EDGE -- offset.x + width == 1.00 scene units, so
                // the registration holds at every viewport by construction, not
                // by arithmetic that happens to work at one width.
                //
                // This corrects a real regression. The comment here used to claim
                // the right edge landed on "91vw", arithmetic left over from when
                // these offsets were authored in vw; after the conversion to scene
                // fractions the claim was measurably false in the shipped build --
                // 91vw at 1440 is 1310px and the plane's edge sat at 1367, 57px
                // adrift, registering to nothing. That is the "badly / arbitrarily
                // aligned" plane the review reported, and it was a stale number
                // rather than an unmade decision. The 0.62-rate lag walks it down-right
                // across the whole composition as the camera passes -- arriving
                // ahead of the evidence, separating from it on departure, which is
                // what makes the exit read as the camera leaving a place.
                //
                // The geometry closed three earlier review-panel findings and the
                // final remediation converted it to scene fractions (see
                // ProjectPlane) and retuned it around the two-shot evidence group:
                //   - the offset keeps the plane's corner out of the frozen
                //     Kivilcim focus frame (verified by pixel diff);
                //   - the media crosses the plane's left edge from the entry beat
                //     on -- never "a card on a mat";
                //   - the plane's top stays clear of the media's top rule at the
                //     mid beat, where an earlier value landed the two within 2px
                //     and read as a shared bound.
                // y 0.22 / h 0.45 (not 0.20/0.44): at viewports taller than the
                // scene's 72vh min-height the SceneFrame centres the block, which
                // shifts the scene content down (+34px at 1200) while the plane
                // stays camera-anchored -- 0.20 put the plane's top a 10px sliver
                // ABOVE the media there, a near-flush misregistration (review
                // finding). 0.22 keeps the media overhanging the plane's top at
                // 900 and 1200 alike.
                // x 0.21 / w 0.85 (not 0.14/0.92 -- same right edge): at 0.14 the
                // plane's whisper corner re-entered the frozen Kivilcim focus
                // frame at 1440 (x = 115 + 0.14*1180 + 0.62*122vw = 1369), the
                // exact regression class the earlier pass fixed; 0.21 puts the
                // corner at 1452 (off-frame) and past 2552's frame as well, at
                // the cost of 82px of the ground's lower-left reveal.
                offset={{ x: 0.21, y: 0.22 }}
                width={0.79}
                height={0.45}
                progress={progress}
              />
              {distantMaterial}
              {nearDestination && (
                <DestinationSurface slot="near" preview={nearDestination} progress={progress} />
              )}
              {/* Directional architecture (§22-23). Exactly two fields in the
                  whole journey: one in the run into the cut and one on the far
                  side of it, re-aimed along the new route. Not behind any scene,
                  and not on mobile -- there is no distant plane there at all
                  (§36).
                  V6.4 dropped the first field's `tension` input along with the
                  collision: the compression it drove was §24's "the route is
                  running out of room", which was a statement about a wall. */}
              <DirectionalField
                at={(sceneFocusProgress("tail") + BREAK_CUT) / 2}
                along={[sceneFocusProgress("tail"), BREAK_CUT]}
                offset={{ x: 46, y: 20 }}
                opacity={0.06}
              />
              <DirectionalField
                at={(BREAK_CUT + sceneFocusProgress("approach")) / 2}
                along={[BREAK_CUT, sceneFocusProgress("approach")]}
                offset={{ x: 38, y: 16 }}
                count={4}
                opacity={0.05}
              />
            </CameraPlane>
          )}

          <CameraPlane
            progress={progress}
            rate={1}
            inset={inset}
            mobile={mobile}
            data-camera-plane="world"
          >
            <WorldGrammar
              progress={progress}
              mobile={mobile}
              branchDestinations={isDesktop ? branchDestinations : []}
            />

            {SCENE_IDS.map((id) => (
              <SceneFrame
                key={id}
                id={id}
                progress={progress}
                mobile={mobile}
                isDesktop={isDesktop}
                annotation={annotations[id]}
                onFocus={() => recenterOnScene(id)}
              >
                {id === "tail" ? (
                  <SystemsWord word={systemsWord} opening={opening} active={systemsActive} />
                ) : (
                  scenes[id]
                )}
              </SceneFrame>
            ))}
          </CameraPlane>

          {isDesktop && (
            <CameraPlane progress={progress} rate={PLANE_NEAR} inset={inset} mobile={mobile}>
              {nearMaterial}
            </CameraPlane>
          )}
        </div>

        <SceneBreak progress={progress} />
      </div>
    </div>
  );
}

/**
 * One depth plane. `rate` is how strongly it answers the camera: below 1 it
 * lags (distant), above 1 it leads (near). The world plane is pinned at
 * exactly 1 because the route rails and registration ticks are derived from
 * the camera path -- sliding them would make the world's orientation system
 * point somewhere the camera never goes.
 */
function CameraPlane({
  progress,
  rate,
  inset,
  mobile,
  children,
  ...rest
}: {
  progress: MotionValue<number>;
  rate: number;
  inset: { left: string; top: string };
  mobile: boolean;
  children: ReactNode;
} & Record<`data-${string}`, string | undefined>) {
  const x = useTransform(progress, (value) => `${-cameraPosition(value, mobile).x * rate}vw`);
  const y = useTransform(progress, (value) => `${-cameraPosition(value, mobile).y * rate}vh`);
  return (
    <motion.div className="absolute" style={{ x, y, ...inset }} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * A scene, framed at its world anchor and resolving in depth as the camera
 * arrives (§14). Two things change, both small:
 *
 *   - scale, by under 3%, so arrival reads as coming into resolution;
 *   - a `--depth-resolve` custom property (0 distant -> 1 focused), which the
 *     scene compositions use to settle their own sub-elements into
 *     registration. Driving it as a CSS variable rather than through React
 *     context keeps the scene components server-rendered and keeps every
 *     functional element's final resting position fixed.
 */
function SceneFrame({
  id,
  progress,
  mobile,
  isDesktop,
  annotation,
  onFocus,
  children,
}: {
  id: SceneId;
  progress: MotionValue<number>;
  mobile: boolean;
  isDesktop: boolean;
  annotation?: SystemAnnotation;
  onFocus: () => void;
  children: ReactNode;
}) {
  const point = sceneAnchor(id, mobile);
  const approach = useTransform(progress, (value) => sceneApproach(id, value, mobile));
  const resolve = useTransform(approach, (value) => 1 - Math.abs(value));
  const scale = useTransform(resolve, [0, 1], [SCENE_SCALE_FAR, SCENE_SCALE_FOCUS]);
  // Mobile keeps scenes at full size: depth treatment is reduced there (§30).
  const flat = useMotionValue(1);

  return (
    <motion.div
      // Keyboard/AT re-centering: content the camera has not reached is
      // clipped by the sticky box's overflow, never removed from the
      // accessibility tree or from Tab order.
      onFocus={onFocus}
      className="absolute left-0 top-0 flex items-center"
      style={
        {
          width: isDesktop ? SCENE_WIDTH : SCENE_WIDTH_MOBILE,
          minHeight: SCENE_MIN_HEIGHT,
          translateX: `${point.x}vw`,
          translateY: `${point.y}vh`,
          scale: isDesktop ? scale : flat,
          "--depth-resolve": isDesktop ? resolve : flat,
          // Lets a scene's evidence break its own alignment edge. Only set
          // here, where the camera frame can clip the result.
          "--scene-overhang": isDesktop ? "-9%" : "0px",
        } as MotionStyle
      }
    >
      {children}
      {annotation && (
        <SystemPOV
          annotation={annotation}
          approach={approach}
          compact={mobile}
          resolved={ROUTE_TWO_IDS.some((routeTwoId) => routeTwoId === id)}
        />
      )}
    </motion.div>
  );
}

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const handler = (event: MediaQueryListEvent) => setDesktop(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);
  return desktop;
}
