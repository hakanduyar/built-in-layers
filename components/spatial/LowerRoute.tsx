"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useSettledReducedMotion } from "@/lib/utils/useSettledReducedMotion";

// V14.1 (owner §5, §13, §19) -- THE ROUTE CONTINUES DOWN THE PAGE.
//
// THE MEASURED DEFECT. The world ends on the terminus map and the surface-
// return junction, and below that nothing inherits the world's structure: no
// route, no stations, no travelled / ahead state. Each lower section re-opened
// its own hairline spine on bare paper (SystemNode), so the four of them read
// as four documents wearing the same chrome -- the owner's "a spatial first
// half followed by an editorial website", verbatim (docs/review/v14.1-fable/
// before/stills/1440x900--{selected-systems,how-i-build,field-notes,about}.png,
// and the @50 lower-world frame, where the drift reads as misalignment because
// its datum was removed and nothing replaced it).
//
// THE FIX IS ONE LINE. The route the reader has been travelling turns the
// corner at the surface-return junction and runs DOWN the page as one rail, in
// the world's own grammar and states:
//
//   AHEAD      dotted survey, as on the route above
//   TRAVELLED  solid ink, laid as the reader comes down -- a compositor-only
//              scaleY on a hairline, driven by the page's own scroll
//   STATIONS   one ring per section at the section's top, carrying the
//              section's real IA index (05..08), filling as the reader
//              reaches it -- the same glyph as the world's stations and the
//              map's dots, so one stop has one symbol everywhere
//   TERMINUS   the closed corner at the rail's foot, where the finale begins
//
// The rail stands at the drift track's own left datum (--drift-pad), so the
// blocks' lateral drift is finally displacement FROM something: the gap
// between the rail and each block's corner is the drift, stated.
//
// It draws nothing that is not true: the sections exist, they are in this
// order, they carry these indices, and the reader is this far down. Desktop
// only -- the mobile lower page is the V13 gate's. Reduced motion renders the
// rail travelled and every station filled, statically.

type Station = { id: string; index: string; top: number };

// Layout is read before paint on the client; the alias is module-scoped so the
// hooks rules recognise it as the effect it is (EditorialDrift does the same).
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const STATION_SIZE = "max(10px, 0.52vw)";

export function LowerRoute() {
  const reduceMotion = useSettledReducedMotion();
  const [layout, setLayout] = useState<{ height: number; stations: Station[] } | null>(null);
  // The rail's own element spans the drift container top to bottom, so it is
  // both the thing to measure against and the scroll target. It has to be
  // its OWN ref: a child's layout effect runs before its parent's ref is
  // attached, so a ref handed down from the container is still null here --
  // which is exactly how the first build of this rail drew no stations.
  const ref = useRef<HTMLDivElement>(null);

  useMeasureEffect(() => {
    const container = ref.current?.parentElement;
    if (!container) return;
    const measure = () => {
      const top = container.getBoundingClientRect().top;
      const blocks = container.querySelectorAll<HTMLElement>("[data-drift-block]");
      const stations: Station[] = [];
      blocks.forEach((block) => {
        const id = block.getAttribute("data-drift-block") ?? "";
        const index = block.querySelector<HTMLElement>("[data-node-index]")?.dataset.nodeIndex;
        if (!index) return;
        // The station sits at the section's register line, not the block's
        // padded top: the register is where the section states itself.
        const register = block.querySelector<HTMLElement>("[data-node-register]");
        const y = (register ?? block).getBoundingClientRect().top - top;
        stations.push({ id, index, top: y });
      });
      setLayout({ height: container.getBoundingClientRect().height, stations });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // The reader's position down the rail: 0 when the rail's top reaches the
  // viewport's 60% line, 1 when its foot does. What lies above that line has
  // been travelled.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.6", "end 0.6"],
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-lower-route="true"
      className="pointer-events-none absolute bottom-0 top-0 hidden w-0 lg:block"
      style={{ left: "var(--drift-pad)" }}
    >
      {/* AHEAD: the dotted survey, the rail's full height. */}
      <span
        className="absolute bottom-0 top-0 block w-px"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(22,22,22,0.55) 0 1.5px, rgba(0,0,0,0) 1.5px 8px)",
        }}
      />
      {/* TRAVELLED: solid ink, laid from the top as the reader comes down. */}
      <motion.span
        data-lower-route-travelled="true"
        className="absolute left-0 top-0 block h-full w-px origin-top bg-ink opacity-70"
        style={{ scaleY: reduceMotion ? 1 : scrollYProgress }}
      />
      {layout?.stations.map((station) => (
        <RailStation
          key={station.id}
          station={station}
          fraction={layout.height > 0 ? station.top / layout.height : 0}
          progress={scrollYProgress}
          reduceMotion={reduceMotion}
        />
      ))}
      {/* TERMINUS: the world's closed corner, at the rail's foot. */}
      <span className="absolute bottom-0 left-0 block h-px w-5 bg-ink opacity-70" />
      <span className="absolute bottom-0 left-0 block h-5 w-px bg-ink opacity-70" />
      <span className="absolute bottom-1.5 left-1.5 block h-px w-2.5 bg-ink opacity-50" />
    </div>
  );
}

function RailStation({
  station,
  fraction,
  progress,
  reduceMotion,
}: {
  station: Station;
  fraction: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // The ring fills as the reader's line passes the station: acquired.
  const fill = useTransform(progress, [fraction - 0.04, fraction + 0.01], [0, 1]);
  const ringOpacity = useTransform(progress, [fraction - 0.12, fraction], [0.55, 0.95]);
  return (
    <>
      <motion.span
        data-lower-route-station={station.id}
        className="absolute block -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink bg-paper"
        style={{
          top: station.top,
          left: 0,
          width: STATION_SIZE,
          height: STATION_SIZE,
          opacity: reduceMotion ? 0.95 : ringOpacity,
        }}
      >
        <motion.span
          className="absolute inset-[18%] block rounded-full bg-ink"
          style={{ scale: reduceMotion ? 1 : fill }}
        />
      </motion.span>
      <span
        className="absolute block whitespace-nowrap font-mono text-mono-label tracking-mono-label text-ink-muted"
        style={{
          top: station.top,
          left: 0,
          marginLeft: `calc(${STATION_SIZE} * -1 - 2.6em)`,
          marginTop: "-0.55em",
        }}
      >
        {station.index}
      </span>
    </>
  );
}
