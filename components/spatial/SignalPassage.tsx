"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { MotionValue } from "motion/react";
import { ramp, signalPhase } from "@/lib/spatial/signalPhase";
import styles from "./SignalPassage.module.css";

export type SignalFrame = { title: string; src: string; details: string[] };

// Each piece occupies its own depth plane. Coordinates are fractions of the
// viewport, so the crossing keeps its composition as the browser is resized.
const planes = [
  { x: 0.27, y: 0.23, width: 0.24, travel: 0.66 },
  { x: 0.88, y: 0.66, width: 0.19, travel: 0.48 },
  { x: 0.98, y: 0.28, width: 0.29, travel: 1.05 },
  { x: 0.48, y: 0.72, width: 0.48, travel: 1.88 },
];

// Vertical registration spines, each with a deliberately different run of
// exposures. The incoming project's screenshots sit deepest in the field.
const contactTracks = [
  [4, 31, 6, 2],
  [15, 64, 8, 3],
  [29, 9, 5, 2],
  [40, 36, 6, 3],
  [51, 17, 8, 2],
  [60, 56, 5, 3],
  [72, 25, 7, 3],
  [85, 69, 8, 2],
  [94, 8, 6, 3],
] as const;

export function SignalPassage({
  progress,
  frames,
  mobile,
}: {
  progress: MotionValue<number>;
  frames: SignalFrame[];
  mobile: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const landing = useRef<HTMLImageElement>(null);
  const destination = frames.at(-1);

  useEffect(() => {
    const field = stage.current;
    const lock = landing.current;
    if (!field || !lock || !destination) return;
    const target = document.querySelector<HTMLImageElement>(
      `[data-scene="dropspot"] [data-project-ground-source] img[src="${destination.src}"]`,
    );
    if (!target) return;
    let raf = 0;
    function paint() {
      raf = 0;
      if (!field || !lock || !target) return;
      const t = signalPhase(progress.get(), mobile);
      field.hidden = t <= 0 || t >= 1;
      if (field.hidden) {
        target.style.removeProperty("opacity");
        return;
      }
      // Reveal the original plate only after the traveling copy registers
      // with it. Otherwise the same screenshot ghosts through the zoom.
      target.style.opacity = String(t < 0.68 ? 1 : ramp(0.97, 1, t));
      const w = field.clientWidth;
      const h = field.clientHeight;
      const settle = ramp(0.68, 0.97, t);
      const reveal = ramp(0.33, 0.7, t);
      const rect = t >= 0.68 ? target.getBoundingClientRect() : null;
      const mix = (a: number, b: number) => a + (b - a) * settle;
      const width = w * (0.34 + 0.54 * reveal);
      const height = h * (0.32 + 0.48 * reveal);
      const x = w * (1.24 - 0.74 * reveal) - width / 2;
      const y = h * (0.49 - 0.04 * reveal) - height / 2;
      lock.style.transform = `translate3d(${mix(x, rect?.left ?? x)}px,${mix(y, rect?.top ?? y)}px,0)`;
      lock.style.width = `${mix(width, rect?.width ?? width)}px`;
      lock.style.height = `${mix(height, rect?.height ?? height)}px`;
      field.style.setProperty("--travel", String(t));
      field.style.setProperty("--enter", String(ramp(0, 0.17, t) * (1 - ramp(0.95, 1, t))));
      field.style.setProperty("--paper", String(1 - ramp(0.79, 0.97, t)));
      field.style.setProperty("--ink", String(1 - ramp(0.46, 0.72, t)));
      field.style.setProperty("--color", String(1 - reveal));
      field.style.setProperty("--slip", t > 0.43 && t < 0.47 ? "0.22" : "0");
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    const stop = progress.on("change", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      stop();
      target.style.removeProperty("opacity");
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
    };
  }, [destination, mobile, progress]);

  if (!destination) return null;
  const contacts = [destination.src, ...destination.details];
  return (
    <div ref={stage} data-signal-passage="" className={styles.stage} aria-hidden="true" hidden>
      <div className={styles.paper} />
      <div className={styles.field}>
        {contactTracks.map(([left, top, width, count], i) => {
          if (mobile && i % 2 === 1) return null;
          return (
            <div
              key={left}
              className={styles.contact}
              style={
                {
                  left: `${left}%`,
                  width: `${width}%`,
                  "--top": `${top}%`,
                  "--speed": 0.15 + (i % 3) * 0.11,
                } as CSSProperties
              }
            >
              <div>
                {Array.from({ length: mobile ? 2 : count }, (_, n) => (
                  <i
                    key={n}
                    style={{
                      backgroundImage: `url("${contacts[(i + n) % contacts.length]}")`,
                      backgroundPosition: `${(i * 19 + n * 31) % 100}% ${(29 + n * 27) % 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.field}>
        {frames.slice(0, -1).map((frame, i) => {
          const plane = planes[i];
          if (!plane) return null;
          return (
            <div
              key={frame.src}
              className={styles.column}
              style={
                {
                  "--x": plane.x,
                  "--y": plane.y,
                  "--width": plane.width,
                  "--speed": plane.travel,
                } as CSSProperties
              }
            >
              <div className={styles.cell}>
                {/* eslint-disable-next-line @next/next/no-img-element -- original evidence plate */}
                <img src={frame.src} alt="" draggable={false} />
                {frame.details.length > 0 && (
                  <div className={styles.details}>
                    {frame.details.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element -- registered project detail
                      <img key={src} src={src} alt="" draggable={false} />
                    ))}
                  </div>
                )}
                <span>{frame.title}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- match the incoming scene's original image */}
      <img
        ref={landing}
        className={styles.landing}
        src={destination.src}
        alt=""
        draggable={false}
      />
      <div className={styles.register}>
        <i />
        03—04<span>{destination.title}</span>
        <i />
      </div>
      <div className={styles.slip} />
    </div>
  );
}
