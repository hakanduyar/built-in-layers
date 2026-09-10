"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ROUTE_STATIONS,
  activeStationIndex,
  stationLabel,
  type RouteStation,
} from "@/lib/spatial/routeNavigation";
import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { useHasMounted } from "@/lib/utils/useHasMounted";
import { useIsDesktop } from "@/lib/utils/useIsDesktop";
import { useSettledReducedMotion } from "@/lib/utils/useSettledReducedMotion";

// V14.9 NAVIGATION GATE -- THE ROUTE NAVIGATOR.
//
// WHAT THIS IS NOT. Not a navbar: it carries no logo, no site links and no
// menu -- the site's primary navigation is still `SiteHeader`, in the document,
// exactly as before. Not a HUD: nothing here reports a number, a percentage, a
// coordinate or a speed. Everything it draws is the world's existing grammar,
// laid horizontally: a rail that is dotted where the route is still ahead and
// solid where the reader has travelled, one station tick per destination, and
// at either end the terminus mark the world already closes a rail with, as the
// two directions of travel.
//
// IT IS NOT A SECOND SCROLL ENGINE, and that is the load-bearing decision. Every
// control here does exactly one thing: it sets `window.scrollTo`. The camera is
// a pure function of document scroll (`SpatialCamera`'s `scrollYProgress`), so
// moving the document IS moving the camera -- along the real route, through the
// real cut, with the real filter and the real governor. `SpatialCamera` already
// navigates this way for keyboard focus (`recenterOnScene` ->
// `scrollToProgress`), with the same `behavior: "smooth"` and the same
// next-frame re-assert; this reuses that mechanism rather than inventing a
// parallel one. Nothing here touches scroll physics, the wheel governor, the
// route's geometry or the break's timing.
//
// FREE SCROLL IS THE SOURCE OF TRUTH. The active station is never set by a click
// or a keypress. It is read from `window.scrollY`, and only from there, by
// `activeStationIndex`. A click and an arrow key move the document; the
// navigator then observes where the document went, exactly as it observes a
// wheel. That is why a reader can interrupt a navigation mid-flight with the
// wheel and the navigator stays correct -- there is one signal, and it is the
// scroll position.
//
// THE STATE IS AN EXTERNAL STORE, not `useState` in an effect. The thing being
// read -- where the document is, and where each station sits in it -- lives in
// the browser rather than in React, which is the same reason `useHasMounted`
// and the world's own fit are `useSyncExternalStore`. It also means the first
// render and the server render agree exactly, so mounting this component cannot
// perturb hydration.
//
// WHERE IT DOES NOT APPEAR. Below `lg` (this gate is desktop-only and the mobile
// art direction is frozen); under reduced motion and without JavaScript, where
// `SpatialCamera` renders the linear fallback and there is no camera route to
// address -- there the page is an ordinary document and ordinary scrolling is
// the navigation; and at the very top of the page until the reader has moved,
// so the first painted frame is exactly what it was before this gate.

/** How far into the page the reader must be before the navigator appears. Small
 *  on purpose: it exists to keep the hero's first frame untouched, not to hide
 *  the control. */
const ENTER_AT_PX = 24;

/** A station becomes current when it is this fraction of a viewport away, so the
 *  readout names what is arriving rather than what is leaving. */
const ACTIVE_LEAD = 0.35;

/** Where a lower section's register lands when it is navigated to, as a fraction
 *  of the viewport from the top. */
const SECTION_LEAD = 0.18;
const FINALE_LEAD = 0.06;

/** Session key for the first-load navigation cue. */
const CUE_KEY = "bil.route.cue";

/** The whole observable state, as one primitive, so the store needs no cache and
 *  can never hand React a new object for an unchanged reading. */
type Snapshot = string;
const IDLE: Snapshot = "0:0:0";

function readSnapshot(snapshot: Snapshot) {
  const [route = "0", entered = "0", active = "0"] = snapshot.split(":");
  return { hasRoute: route === "1", entered: entered === "1", active: Number(active) || 0 };
}

type RouteNavigatorProps = {
  /** Real project titles by slug, from the content loader, so the four case
   *  stations are labelled with the project's own frontmatter title and this
   *  component retypes no content. */
  projectTitles: Record<string, string>;
};

/**
 * Each station's document scroll position. Scenes are addressed by the camera's
 * own focus progress across the route spacer -- the identical expression
 * `SpatialCamera.scrollToProgress` uses -- and sections by their real register's
 * position in the document. One array, both worlds.
 */
function measureTargets(): number[] | null {
  const spacer = document.querySelector<HTMLElement>("[data-route-spacer]");
  if (!spacer) return null;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clamp = (value: number) => Math.min(Math.max(value, 0), maxScroll);
  const tourStart = window.scrollY + spacer.getBoundingClientRect().top;
  const tourSpan = Math.max(0, spacer.offsetHeight - window.innerHeight);

  return ROUTE_STATIONS.map((station) => {
    if (station.scene) {
      return clamp(tourStart + sceneFocusProgress(station.scene) * tourSpan);
    }
    if (station.section) {
      const block = document.querySelector<HTMLElement>(`[data-drift-block="${station.section}"]`);
      if (!block) return maxScroll;
      const register = block.querySelector<HTMLElement>("[data-node-register]") ?? block;
      return clamp(
        window.scrollY + register.getBoundingClientRect().top - window.innerHeight * SECTION_LEAD,
      );
    }
    const finale = document.querySelector<HTMLElement>(".spatial-finale");
    if (!finale) return maxScroll;
    return clamp(
      window.scrollY + finale.getBoundingClientRect().top - window.innerHeight * FINALE_LEAD,
    );
  });
}

export function RouteNavigator({ projectTitles }: RouteNavigatorProps) {
  const mounted = useHasMounted();
  const desktop = useIsDesktop();
  const reduceMotion = useSettledReducedMotion();
  const enabled = mounted && desktop && !reduceMotion;

  const targetsRef = useRef<number[]>([]);
  const snapshotRef = useRef<Snapshot>(IDLE);

  /** Read the document and compose the snapshot. The only writer of the store. */
  const read = useCallback((): Snapshot => {
    const targets = targetsRef.current;
    if (targets.length === 0) return IDLE;
    const y = window.scrollY;
    const active = activeStationIndex(y, targets, window.innerHeight * ACTIVE_LEAD);
    return `1:${y > ENTER_AT_PX ? 1 : 0}:${active}`;
  }, []);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!enabled) return () => {};

      const publish = () => {
        const next = read();
        if (next === snapshotRef.current) return;
        snapshotRef.current = next;
        onStoreChange();
      };
      const remeasure = () => {
        targetsRef.current = measureTargets() ?? [];
        publish();
      };

      // The first reading happens here rather than in an effect body, so the
      // store -- not a render pass -- is what discovers the world.
      targetsRef.current = measureTargets() ?? [];
      snapshotRef.current = read();
      queueMicrotask(onStoreChange);

      let frame = 0;
      const onScroll = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          publish();
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", remeasure);
      // The lower world's reveals and the drift track settle the document's
      // height after mount; re-measuring on that keeps every target honest
      // without measuring on every scroll frame.
      const observer = new ResizeObserver(remeasure);
      observer.observe(document.documentElement);

      return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", remeasure);
        observer.disconnect();
      };
    },
    [enabled, read],
  );

  const snapshot = useSyncExternalStore(
    subscribe,
    () => snapshotRef.current,
    () => IDLE,
  );
  const { hasRoute, entered, active } = readSnapshot(snapshot);

  /**
   * Move to a station. The whole navigation mechanism: one scripted document
   * scroll, re-asserted once on the next frame for the same reason
   * `recenterOnScene` re-asserts it -- a native "scroll into view" pass, or a
   * wheel animation still in flight, can land elsewhere on the frame the
   * command is issued.
   */
  const goTo = useCallback((index: number) => {
    const target = targetsRef.current[index];
    if (target === undefined) return;
    window.scrollTo({ top: target, behavior: "smooth" });
    requestAnimationFrame(() => window.scrollTo({ top: target, behavior: "smooth" }));
  }, []);

  const step = useCallback(
    (direction: -1 | 1) => {
      const next = active + direction;
      if (next < 0 || next >= ROUTE_STATIONS.length) return;
      goTo(next);
    },
    [active, goTo],
  );

  /**
   * THE FIRST-LOAD CUE. Once per session, and only until the reader moves.
   *
   * Read during the first render rather than set from an effect: the component
   * renders nothing until it has mounted, so this cannot disagree with the
   * server, and the store -- not a cascading render -- stays the only thing
   * that writes state here. The write-back happens in an effect, where a side
   * effect belongs.
   */
  const [cueEligible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(CUE_KEY) !== "seen";
    } catch {
      // Private mode, or storage denied: no cue rather than a broken one.
      return false;
    }
  });
  const cue = enabled && hasRoute && cueEligible && !entered;

  useEffect(() => {
    if (!cue) return;
    try {
      window.sessionStorage.setItem(CUE_KEY, "seen");
    } catch {
      // Nothing to do: the cue simply shows again next visit.
    }
  }, [cue]);

  // ArrowLeft / ArrowRight step the route. Deliberately NOT ArrowUp/ArrowDown,
  // PageUp/PageDown, Home/End or space: those are the browser's own scrolling --
  // the reader's free movement -- and the break guard already listens for them
  // as real input. Modified chords, and any key pressed inside a field or an
  // editable element, are left entirely alone.
  useEffect(() => {
    if (!enabled || !hasRoute) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, hasRoute, step]);

  if (!enabled || !hasRoute) return null;

  const current = ROUTE_STATIONS[active];
  const total = ROUTE_STATIONS.length;
  const travelled = total > 1 ? (active / (total - 1)) * 100 : 0;
  const label = current ? stationLabel(current, projectTitles) : "";

  return (
    // One landmark for the whole layer. The wrapper spans the viewport so the
    // rail can be centred against the frame and the two arrows can sit on its
    // edges, and it passes every pointer straight through -- only the controls
    // themselves are interactive.
    <nav
      data-route-navigator="true"
      aria-label="Route"
      className="pointer-events-none fixed inset-0 z-40 hidden lg:block"
    >
      {/* THE RAIL, centred on the frame. V14.10 (owner): it stood at the lower
          rail's 4vw datum, which read as a corner element; centred, it reads as
          the instrument the frame is travelling through. It arrives once the
          reader has moved, so the first painted frame is untouched, and it is
          hidden with `visibility` rather than opacity so its buttons are never
          focusable while invisible. */}
      <div
        data-nav-rail="true"
        className={`absolute inset-x-0 top-0 flex justify-center pt-5 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] ${
          entered ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="pointer-events-auto">
          {/* THE READOUT. Decorative: the active station's tick carries the same
              name as its accessible name and `aria-current`, so exposing this
              too would announce the reader's position twice. */}
          <p
            aria-hidden="true"
            data-nav-readout={current?.id}
            className="mb-2 flex items-baseline justify-center gap-2.5 font-mono text-mono-label tracking-mono-label uppercase"
          >
            {current?.index && <span className="text-ink-muted">{current.index}</span>}
            <span className="text-ink">{label}</span>
          </p>

          <div className="relative">
            {/* The route in the world's own two states: dotted where it is still
                ahead, solid ink where the reader has travelled. */}
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-1/2 block h-px -translate-y-1/2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, var(--color-line) 0 1.5px, rgba(0,0,0,0) 1.5px 6px)",
              }}
            />
            <span
              aria-hidden="true"
              data-nav-travelled="true"
              className="absolute left-0 top-1/2 block h-px -translate-y-1/2 bg-ink opacity-70"
              style={{ width: `${travelled}%` }}
            />
            <ol className="relative flex items-center">
              {ROUTE_STATIONS.map((station, index) => (
                <li key={station.id}>
                  <StationTick
                    station={station}
                    projectTitles={projectTitles}
                    state={index === active ? "active" : index < active ? "passed" : "ahead"}
                    onActivate={() => goTo(index)}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* THE TWO DIRECTIONS, on the frame's edges. Quiet at rest; they resolve
          under the pointer or on focus, exactly as every other mark in this
          world resolves as the system closes on it. */}
      <SideArrow
        direction={-1}
        station={ROUTE_STATIONS[active - 1]}
        projectTitles={projectTitles}
        cue={cue}
        onActivate={() => step(-1)}
      />
      <SideArrow
        direction={1}
        station={ROUTE_STATIONS[active + 1]}
        projectTitles={projectTitles}
        cue={cue}
        onActivate={() => step(1)}
      />
    </nav>
  );
}

/** One destination on the rail. The hit area is a full 24px square; what is drawn
 *  inside it is a single hairline tick. */
function StationTick({
  station,
  projectTitles,
  state,
  onActivate,
}: {
  station: RouteStation;
  projectTitles: Record<string, string>;
  state: "active" | "passed" | "ahead";
  onActivate: () => void;
}) {
  const name = stationLabel(station, projectTitles);
  return (
    <button
      type="button"
      data-nav-station={station.id}
      data-nav-state={state}
      aria-current={state === "active" ? "true" : undefined}
      onClick={onActivate}
      className="group flex h-6 w-6 items-center justify-center"
    >
      <span className="sr-only">{station.index ? `${station.index}, ${name}` : name}</span>
      <span
        aria-hidden="true"
        className={`block w-px transition-[height,opacity] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:h-3 group-hover:bg-ink group-hover:opacity-100 group-focus-visible:h-3 group-focus-visible:bg-ink group-focus-visible:opacity-100 ${
          state === "active"
            ? "h-3.5 bg-ink opacity-100"
            : state === "passed"
              ? "h-2 bg-ink opacity-55"
              : "h-1.5 bg-line opacity-100"
        }`}
      />
    </button>
  );
}

/**
 * PREVIOUS and NEXT, on the left and right edges of the frame.
 *
 * A chevron built the way every other mark in this world is built -- two
 * hairlines meeting at a corner, turned 45 degrees -- not a glyph and not an
 * icon from a set. At rest it sits at a quarter of ink, which is the weight of
 * the route's own dotted survey; under the pointer or on keyboard focus it
 * resolves, and the destination names itself beside it.
 *
 * On the reader's first visit of the session both arrows breathe twice
 * (`nav-cue-*`, styles/globals.css) and then stop for good: enough to say the
 * page moves left and right, and nothing more. The cue also ends the instant
 * the reader scrolls, because at that point they have found their own way.
 */
function SideArrow({
  direction,
  station,
  projectTitles,
  cue,
  onActivate,
}: {
  direction: -1 | 1;
  station: RouteStation | undefined;
  projectTitles: Record<string, string>;
  cue: boolean;
  onActivate: () => void;
}) {
  const previous = direction === -1;
  const word = previous ? "Previous" : "Next";
  return (
    <button
      type="button"
      data-nav-step={previous ? "previous" : "next"}
      data-nav-cue={cue ? "true" : undefined}
      disabled={!station}
      onClick={onActivate}
      aria-label={
        station ? `${word} section: ${stationLabel(station, projectTitles)}` : `${word} section`
      }
      className={`group pointer-events-auto absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] disabled:cursor-default disabled:opacity-10 ${
        previous ? "left-[1.6vw]" : "right-[1.6vw]"
      } opacity-25 ${cue ? "nav-cue" : ""} hover:opacity-80 focus-visible:opacity-80`}
    >
      <span
        aria-hidden="true"
        className={`block h-2.5 w-2.5 rotate-45 border-ink transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)] ${
          previous
            ? "border-b border-l group-hover:-translate-x-0.5"
            : "border-r border-t group-hover:translate-x-0.5"
        } ${cue ? (previous ? "nav-cue-left" : "nav-cue-right") : ""}`}
      />
      {/* The destination, named only while the reader is on the control. */}
      {station && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted opacity-0 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] group-hover:opacity-100 group-focus-visible:opacity-100 ${
            previous ? "left-full ml-1" : "right-full mr-1"
          }`}
        >
          {stationLabel(station, projectTitles)}
        </span>
      )}
    </button>
  );
}
