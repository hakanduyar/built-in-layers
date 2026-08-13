"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { AtmosphereEmbers } from "@/components/spatial/AtmosphereEmbers";
import {
  cameraPosition,
  currentRouteId,
  DESKTOP_NODE_POSITION,
  IMPACT_END_PROGRESS,
  isImpact,
  MOBILE_NODE_POSITION,
  NODE_PROGRESS,
  ROUTE_ORDER,
  type RouteId,
} from "@/lib/spatial/sceneRoute";
import { useHasMounted } from "@/lib/utils/useHasMounted";

/** One real content node per named route stop -- same content, positioned
 *  differently depending on enhancement/viewport, never duplicated. */
type SpatialCameraProps = Record<RouteId, ReactNode>;

// Total real scroll distance (in viewport heights) driving the whole route:
// hero -> kivilcim -> dropspot -> tail -> collision -> impact -> sceneTwo,
// plus a short dwell at the end. Not scroll-hijacked -- this is genuine
// page height; the camera is a function of real scrollY via Motion's
// useScroll, the same "pinned/sticky scrollytelling" technique used by many
// production sites, not a wheel-event interception.
const SPACER_VH = 600;

const ROUTE_LABELS: Record<ReturnType<typeof currentRouteId>, string> = {
  hero: "00 · HERO",
  kivilcim: "01 · KIVILCIM",
  dropspot: "02 · DROPSPOT",
  tail: "03 · TAIL",
  collision: "04 · IMPACT",
  sceneTwo: "05 · REPOSITIONED",
};

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );
  useEffect(() => {
    // The lazy useState initializer above already reads the correct value
    // on the client's first render -- this effect only needs to subscribe
    // to future changes (e.g. a resize across the breakpoint), never to
    // set the initial value again.
    const query = window.matchMedia("(min-width: 1024px)");
    const handler = (event: MediaQueryListEvent) => setDesktop(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);
  return desktop;
}

// DESIGN_SYSTEM §18 (this branch only): the camera concept, real scroll
// re-mapped to world position and a genuine wall/collision, is a disclosed
// departure from the approved system's "no scroll-linked animation" rule --
// see that section for the full disclosure. Everything else here (real
// content in real DOM order, progressive enhancement, keyboard-triggered
// re-centering, reduced-motion static fallback) follows this codebase's
// existing accessibility conventions exactly (compare LayerExplorer.tsx).
export function SpatialCamera(props: SpatialCameraProps) {
  const mounted = useHasMounted();
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const enhanced = mounted && !reduceMotion;

  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: spacerRef, offset: ["start start", "end end"] });

  const [impact, setImpact] = useState(false);
  const [routeId, setRouteId] = useState<ReturnType<typeof currentRouteId>>("hero");

  // Only two derived, discrete values are ever set from the continuous
  // scroll signal -- React bails out of re-rendering when a value is
  // unchanged, so this fires actual re-renders only at the handful of
  // progress boundaries where impact/routeId genuinely change, not on
  // every scroll frame. The camera's own per-frame movement (below) never
  // goes through React state at all -- it's a MotionValue, applied to the
  // DOM directly by Motion outside React's render cycle.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setImpact(isImpact(value));
    setRouteId(currentRouteId(value));
  });

  const worldX = useTransform(
    scrollYProgress,
    (value) => `${-cameraPosition(value, !isDesktop).x}vw`,
  );
  const worldY = useTransform(
    scrollYProgress,
    (value) => `${-cameraPosition(value, !isDesktop).y}vh`,
  );

  function scrollToProgress(progress: number) {
    const spacer = spacerRef.current;
    if (!spacer) return;
    const rect = spacer.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const end = start + spacer.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + (end - start) * progress, behavior: "smooth" });
  }

  if (!enhanced) {
    // No-JS and reduced-motion fallback: the exact same real content, in
    // normal linear document flow. No transform, no pinning, no camera --
    // just a readable, fully scrollable stack, matching this codebase's
    // existing progressive-enhancement pattern (LayerExplorer, MobileNav).
    return (
      <div className="flex flex-col gap-24 lg:gap-40">
        {ROUTE_ORDER.map((id) => (
          <div key={id}>{props[id]}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={spacerRef} style={{ height: `${SPACER_VH}vh` }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-paper">
        <AtmosphereEmbers impact={impact} dense={!isDesktop} />

        <motion.div
          className="absolute inset-0"
          animate={impact ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <motion.div
            className="absolute left-6 top-20 lg:left-10 lg:top-24"
            style={{ x: worldX, y: worldY }}
          >
            {ROUTE_ORDER.map((id) => {
              const point = isDesktop ? DESKTOP_NODE_POSITION[id] : MOBILE_NODE_POSITION[id];
              return (
                <div
                  key={id}
                  // Keyboard/AT re-centering: content off the currently
                  // visible camera position is clipped by the sticky box's
                  // `overflow: hidden`, not hidden from the accessibility
                  // tree or from Tab order (position: absolute + overflow:
                  // hidden clips paint only). Without this, a keyboard user
                  // could Tab focus into a node the camera hasn't panned
                  // to yet, landing on something invisible -- a real
                  // "focus goes nowhere visible" defect. Focusing any
                  // interactive element inside a node re-centers the
                  // camera on that node first, so focus is always visible.
                  onFocus={() => scrollToProgress(NODE_PROGRESS[id] ?? IMPACT_END_PROGRESS)}
                  className="absolute max-w-[85vw] sm:max-w-sm"
                  style={{ transform: `translate3d(${point.x}vw, ${point.y}vh, 0)` }}
                >
                  {props[id]}
                </div>
              );
            })}
          </motion.div>

          {impact && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-signal"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.28, 0] }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            />
          )}
        </motion.div>

        <div
          aria-hidden="true"
          className="absolute bottom-6 left-6 font-mono text-mono-meta tracking-mono-meta text-ink-muted lg:bottom-8 lg:left-8"
        >
          {ROUTE_LABELS[routeId]}
        </div>
      </div>
    </div>
  );
}
