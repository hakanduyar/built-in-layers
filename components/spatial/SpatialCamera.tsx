"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { DirectionalField } from "@/components/spatial/DirectionalField";
import { ErosionWord } from "@/components/spatial/ErosionWord";
import { SceneBreak } from "@/components/spatial/SceneBreak";
import { SystemPOV } from "@/components/spatial/SystemPOV";
import { WorldGrammar } from "@/components/spatial/WorldGrammar";
import { advanceFilter, type FilterState } from "@/lib/spatial/cameraFilter";
import {
  CAMERA_INSET,
  CAMERA_INSET_MOBILE,
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
  BREAK_CUT,
  COLLISION_PROGRESS,
  approachTension,
  cameraPosition,
  isImpact,
  sceneApproach,
  sceneFocusProgress,
} from "@/lib/spatial/sceneRoute";
import type { SystemAnnotation } from "@/lib/spatial/systemPov";
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
  /**
   * What the observing system is allowed to say about a scene, derived from
   * real project frontmatter by lib/spatial/systemPov.ts. Scenes without one
   * are simply not annotated -- there is no placeholder readout.
   */
  annotations?: Partial<Record<SceneId, SystemAnnotation>>;
};

/**
 * Velocity-aware scroll filtering (§7). V4's fixed overdamped spring is
 * replaced by two cascaded first-order lags whose time constant shrinks as
 * scroll speed rises -- see lib/spatial/cameraFilter.ts for the measurements
 * that motivated it and the proof that it cannot overshoot.
 *
 * Everything visual still reads ONE value. Deriving some of it from raw
 * scroll and some from the filtered value is what would smear the collision
 * cut, by letting the break panel and the camera jump disagree about when the
 * cut happened.
 */
function useFilteredProgress(source: MotionValue<number>, enabled: boolean): MotionValue<number> {
  const filtered = useMotionValue(source.get());
  const state = useRef<FilterState>({
    stage1: source.get(),
    stage2: source.get(),
    speed: 0,
  });

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
    // than teleporting the camera through the collision.
    const next = advanceFilter(previous, target, source.getVelocity(), Math.min(delta, 50));
    state.current = next;
    filtered.set(next.stage2);
  });

  return enabled ? filtered : source;
}

export function SpatialCamera({
  erosionWord,
  distantMaterial,
  nearMaterial,
  annotations = {},
  ...scenes
}: SpatialCameraProps) {
  const mounted = useHasMounted();
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const enhanced = mounted && !reduceMotion;
  const mobile = !isDesktop;

  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: spacerRef, offset: ["start start", "end end"] });

  // Raw scroll drives a filtered "visual progress"; EVERYTHING visual reads
  // from the filtered value -- camera, break, erosion, depth, system
  // annotations.
  const progress = useFilteredProgress(scrollYProgress, !reduceMotion);

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
        {SCENE_IDS.map((id) => {
          const annotation = annotations[id];
          return (
            // The system annotation survives here in its resolved, static form:
            // §37 keeps useful system metadata, and these two rows are real
            // project facts stated nowhere else on the page.
            <div key={id} className={annotation ? "relative" : undefined}>
              {annotation && <SystemPOV annotation={annotation} approach={null} />}
              {id === "tail" ? <ErosionWord word={erosionWord} erosion={null} /> : scenes[id]}
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
              {/* Directional architecture (§22-23). Exactly two fields in the
                  whole journey: one in the run at the wall, which compresses
                  as the route runs out of room (§24), and one on the far side
                  of the reposition, re-aimed along the new route. Not behind
                  any scene, and not on mobile -- there is no distant plane
                  there at all (§36). */}
              <DirectionalField
                at={(sceneFocusProgress("tail") + COLLISION_PROGRESS) / 2}
                along={[sceneFocusProgress("tail"), COLLISION_PROGRESS]}
                offset={{ x: 46, y: 20 }}
                tension={tension}
                opacity={0.075}
              />
              <DirectionalField
                at={(BREAK_CUT + sceneFocusProgress("approach")) / 2}
                along={[BREAK_CUT, sceneFocusProgress("approach")]}
                offset={{ x: 38, y: 16 }}
                count={4}
                opacity={0.06}
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
            <WorldGrammar progress={progress} tension={tension} mobile={mobile} />

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
