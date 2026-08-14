"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { ErosionWord } from "@/components/spatial/ErosionWord";
import { SceneBreak } from "@/components/spatial/SceneBreak";
import { WorldGrammar } from "@/components/spatial/WorldGrammar";
import {
  CAMERA_INSET,
  CAMERA_INSET_MOBILE,
  PLANE_DISTANT,
  PLANE_NEAR,
  ROUTE_LENGTH_VH,
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
  BREAK_CUT,
  COLLISION_PROGRESS,
  approachTension,
  cameraPosition,
  isImpact,
  sceneFocusProgress,
  sceneProximity,
} from "@/lib/spatial/sceneRoute";
import { useHasMounted } from "@/lib/utils/useHasMounted";

/** Composed scenes. `tail` is the near-empty beat before the wall, and its
 *  whole composition is the giant eroding word, which only this component can
 *  drive. */
type ComposedSceneId = Exclude<SceneId, "tail">;

type SpatialCameraProps = Record<ComposedSceneId, ReactNode> & {
  erosionWord: string;
  /** Distant/near travel material, rendered on their own depth planes. */
  distantMaterial?: ReactNode;
  nearMaterial?: ReactNode;
};

/**
 * Scroll smoothing (§7).
 *
 * Deliberately OVERDAMPED (damping ratio ~1.07, not the bouncy default): an
 * underdamped spring would overshoot, and because the collision cut is a
 * threshold on this same value, overshoot could carry the journey across
 * BREAK_CUT and back again -- the reposition would flicker. Overdamping makes
 * that impossible by construction, which is the explicit boundary strategy
 * §8 asks for: rather than special-casing the cut, the smoothing simply
 * cannot cross it twice.
 *
 * The time constant is ~70ms (about four frames). Enough to dissolve
 * wheel-step edges, short enough that the camera never reads as chasing the
 * scroll position.
 */
const SMOOTHING = { stiffness: 170, damping: 28, mass: 1, restDelta: 0.00002 } as const;

export function SpatialCamera({
  erosionWord,
  distantMaterial,
  nearMaterial,
  ...scenes
}: SpatialCameraProps) {
  const mounted = useHasMounted();
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const enhanced = mounted && !reduceMotion;
  const mobile = !isDesktop;

  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: spacerRef, offset: ["start start", "end end"] });

  // Raw scroll drives a smoothed "visual progress"; EVERYTHING visual reads
  // from the smoothed value -- camera, break, erosion, depth. Deriving some
  // of it from raw and some from smoothed is what would smear the cut, by
  // letting the panel and the jump disagree about when the cut happened.
  const smoothed = useSpring(scrollYProgress, SMOOTHING);
  const progress = reduceMotion ? scrollYProgress : smoothed;

  const [impact, setImpact] = useState(false);

  // Still the only continuous scroll signal that reaches React state, and it
  // is a boolean: React bails out when unchanged, so this re-renders at
  // exactly two progress boundaries for the whole journey.
  useMotionValueEvent(progress, "change", (value) => setImpact(isImpact(value)));

  const tension = useTransform(progress, (value) => approachTension(value, mobile));
  const erosion = useTransform(
    progress,
    [sceneFocusProgress("tail", mobile), COLLISION_PROGRESS, BREAK_CUT],
    [0, 1, 1],
  );

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
    // no depth motion, no erosion, no world grammar, no travel material.
    // Each scene keeps its full V4 composition, so this reads as a designed
    // linear page rather than a stripped dump.
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

  const inset = isDesktop ? CAMERA_INSET : CAMERA_INSET_MOBILE;

  return (
    <div ref={spacerRef} style={{ height: `${ROUTE_LENGTH_VH}vh` }} className="relative">
      {/* `overflow-clip`, not `overflow-hidden`: an `overflow: hidden` box is
          still a programmatically scrollable container, so focusing a link the
          camera had not reached made the browser scroll THIS box internally
          and shift the whole world off its camera position. */}
      <div className="sticky top-0 h-screen w-full overflow-clip bg-paper">
        <motion.div
          className="absolute inset-0"
          // One short, controlled impulse. No spring, no overshoot, no
          // elastic settle -- a hit, not a bounce.
          animate={impact ? { x: [0, -7, 6, -3, 0] } : { x: 0 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
        >
          {/* Depth planes (§12). Mobile keeps the world plane only: parallax
              at 375px buys little and risks motion sickness (§30). */}
          {isDesktop && (
            <CameraPlane progress={progress} rate={PLANE_DISTANT} inset={inset} mobile={mobile}>
              {distantMaterial}
            </CameraPlane>
          )}

          <CameraPlane
            progress={progress}
            rate={1}
            inset={inset}
            mobile={mobile}
            data-camera-plane="world"
          >
            <WorldGrammar progress={progress} tension={tension} mobile={mobile} />

            {SCENE_IDS.map((id) => (
              <SceneFrame
                key={id}
                id={id}
                progress={progress}
                mobile={mobile}
                isDesktop={isDesktop}
                onFocus={() => recenterOnScene(id)}
              >
                {id === "tail" ? (
                  <ErosionWord word={erosionWord} erosion={erosion} tension={tension} />
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
        </motion.div>

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
  onFocus,
  children,
}: {
  id: SceneId;
  progress: MotionValue<number>;
  mobile: boolean;
  isDesktop: boolean;
  onFocus: () => void;
  children: ReactNode;
}) {
  const point = sceneAnchor(id, mobile);
  const resolve = useTransform(progress, (value) => sceneProximity(id, value, mobile));
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
