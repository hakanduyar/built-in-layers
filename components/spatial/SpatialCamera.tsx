"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ErosionWord } from "@/components/spatial/ErosionWord";
import {
  BREAK_CUT,
  CAMERA_INSET,
  CAMERA_INSET_MOBILE,
  COLLISION_PROGRESS,
  ROUTE_LENGTH_VH,
  SCENE_IDS,
  SCENE_MIN_HEIGHT,
  SCENE_WIDTH,
  SCENE_WIDTH_MOBILE,
  sceneAnchor,
  sceneById,
  type SceneId,
} from "@/lib/spatial/scenes";
import { breakWipeOffset, cameraPosition, isImpact } from "@/lib/spatial/sceneRoute";
import { useHasMounted } from "@/lib/utils/useHasMounted";

/** Composed scenes. `tail` is deliberately absent: it is the deliberately
 *  near-empty beat before the wall, and its whole composition is the giant
 *  eroding word, which only this component can drive. */
type ComposedSceneId = Exclude<SceneId, "tail">;

type SpatialCameraProps = Record<ComposedSceneId, ReactNode> & {
  /** Decorative word eroded by the wind during the tail->collision
   *  transition. Always duplicated in real semantic copy elsewhere. */
  erosionWord: string;
};

// Spatial Portfolio V2 (feature/spatial-portfolio-v2, not merged to main --
// see docs/DESIGN_SYSTEM.md §18).
//
// Preserved from V1 (proven infrastructure, deliberately not rewritten):
// the pinned/sticky camera over a real scroll spacer driven by Motion's
// `useScroll` (real scroll, never wheel interception), the mount-gated
// progressive-enhancement branch, the reduced-motion static fallback, and
// focus-driven re-centering so keyboard users never land on content the
// camera has not reached.
//
// Rebuilt for V2:
// - Scenes are viewport-scale and laid out from the shared scene geometry,
//   so world spacing and scene size can never drift apart. V1's core visual
//   failure was small cards at arbitrary world points; here a focal scene
//   occupies the viewport it is framed in.
// - The reposition is bridged by a scene-break wipe, so the discontinuous
//   route jump is never actually witnessed -- it reads as a cut.
// - V1's permanent bottom-left route-progress label is gone (§22: the world
//   was full of technical confetti; this was some of it).
export function SpatialCamera({ erosionWord, ...scenes }: SpatialCameraProps) {
  const mounted = useHasMounted();
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const enhanced = mounted && !reduceMotion;

  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: spacerRef, offset: ["start start", "end end"] });

  const [impact, setImpact] = useState(false);

  // The only continuous scroll signal that reaches React state, and it is a
  // boolean -- React bails out when unchanged, so this re-renders at exactly
  // two progress boundaries for the whole journey. Camera movement, the
  // wipe, and the erosion never touch React state at all: they are
  // MotionValues written straight to the DOM.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setImpact(isImpact(value));
  });

  const worldX = useTransform(
    scrollYProgress,
    (value) => `${-cameraPosition(value, !isDesktop).x}vw`,
  );
  const worldY = useTransform(
    scrollYProgress,
    (value) => `${-cameraPosition(value, !isDesktop).y}vh`,
  );
  const wipeX = useTransform(scrollYProgress, (value) => `${breakWipeOffset(value)}%`);
  // The erosion belongs to exactly one transition: it starts as the tail
  // scene is reached, peaks at the wall, and is gone by the cut (§19).
  const erosion = useTransform(
    scrollYProgress,
    [sceneById("tail").focus, COLLISION_PROGRESS, BREAK_CUT],
    [0, 1, 1],
  );

  function scrollToProgress(progress: number) {
    const spacer = spacerRef.current;
    if (!spacer) return;
    const rect = spacer.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const end = start + spacer.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + (end - start) * progress, behavior: "smooth" });
  }

  /**
   * Bring the camera to the scene a newly-focused element belongs to.
   *
   * Re-asserted on the next frame on purpose: WebKit runs its own native
   * "scroll the focused element into view" pass AFTER this handler, and
   * because the element lives inside a transformed world layer that
   * computation lands the camera in a completely unrelated region (measured
   * in WebKit: focus jumped the route to ~0.78 progress and left the link at
   * x=-922). Chromium happens to run its pass first, so it never showed the
   * bug. Re-issuing the scroll on the following frame makes the camera's own
   * framing authoritative in both engines.
   */
  function recenterOnScene(id: SceneId) {
    const target = sceneById(id).focus;
    scrollToProgress(target);
    requestAnimationFrame(() => scrollToProgress(target));
  }

  function sceneContent(id: SceneId): ReactNode {
    if (id === "tail") return <ErosionWord word={erosionWord} erosion={erosion} />;
    return scenes[id];
  }

  if (!enhanced) {
    // No-JS and reduced-motion fallback (§26): the same real, fully composed
    // scenes in normal document flow -- no camera, no pinning, no shake, no
    // erosion. Deliberately NOT a stripped-down dump: each scene keeps its
    // own full composition, so this reads as a designed linear page.
    return (
      <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-24 px-4 py-16 md:px-6 lg:gap-40 lg:px-8">
        {SCENE_IDS.map((id) => (
          <div key={id}>
            {id === "tail" ? <ErosionWord word={erosionWord} erosion={null} /> : scenes[id]}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={spacerRef} style={{ height: `${ROUTE_LENGTH_VH}vh` }} className="relative">
      {/* `overflow-clip`, not `overflow-hidden`. An `overflow: hidden` box is
          still a programmatically scrollable container, so when focus moved
          to a link the camera had not reached, the browser "helpfully"
          scrolled THIS box internally to reveal it -- shifting the entire
          world off its camera position and leaving the focused link
          off-screen anyway (measured: scrollLeft jumped to 2475px, link at
          x=-1178). `overflow: clip` creates no scroll container, so the only
          thing that can move the world is the camera itself. */}
      <div className="sticky top-0 h-screen w-full overflow-clip bg-paper">
        <motion.div
          className="absolute inset-0"
          // The impact impulse: one short, controlled shake (140ms, inside
          // the 80-180ms the brief allows), small amplitude, no spring, no
          // overshoot, no elastic settle -- a hit, not a bounce.
          animate={impact ? { x: [0, -7, 6, -3, 0] } : { x: 0 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
        >
          {/* World layer. Its own inset frames a focal scene comfortably
              inside the viewport, so scene anchors stay pure world
              coordinates rather than each carrying framing offsets. */}
          <motion.div
            className="absolute"
            style={{ x: worldX, y: worldY, ...(isDesktop ? CAMERA_INSET : CAMERA_INSET_MOBILE) }}
          >
            {SCENE_IDS.map((id) => {
              const point = sceneAnchor(id, !isDesktop);
              return (
                <div
                  key={id}
                  // Keyboard/AT re-centering, preserved from V1: content the
                  // camera has not reached is clipped by the sticky box's
                  // overflow, never hidden from the accessibility tree or
                  // from Tab order. Focusing anything inside a scene brings
                  // the camera there first, so focus is always visible.
                  onFocus={() => recenterOnScene(id)}
                  className="absolute left-0 top-0 flex items-center"
                  style={{
                    width: isDesktop ? SCENE_WIDTH : SCENE_WIDTH_MOBILE,
                    minHeight: SCENE_MIN_HEIGHT,
                    transform: `translate3d(${point.x}vw, ${point.y}vh, 0)`,
                  }}
                >
                  {sceneContent(id)}
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Scene break. A full-bleed ink panel wipes across, the route's
            discontinuous jump happens behind it at BREAK_CUT, then it wipes
            away to reveal the new region. This is the difference between a
            deliberate cut and V1's teleport. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-ink"
          style={{ x: wipeX }}
        />
      </div>
    </div>
  );
}

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );
  useEffect(() => {
    // The lazy initializer above already read the correct value on the
    // client's first render; this only subscribes to later changes.
    const query = window.matchMedia("(min-width: 1024px)");
    const handler = (event: MediaQueryListEvent) => setDesktop(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);
  return desktop;
}
