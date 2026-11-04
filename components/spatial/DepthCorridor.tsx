"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { MotionValue } from "motion/react";
import { ramp, signalPhase, type TourProject } from "@/lib/spatial/signalPhase";
import type { SignalFrame } from "./SignalPassage";
import styles from "./DepthCorridor.module.css";
import { archiveFrames } from "@/lib/spatial/archiveFrames";

type DepthCorridorProps = {
  progress: MotionValue<number>;
  mobile: boolean;
  from: TourProject;
  to: TourProject;
  frames: SignalFrame[];
};

const DEPTH_SPAN = 5400;
const DEPTH_COUNT = 12;

// Twelve distances, with independent upright reels on either side of the
// sightline. Reusing the far plane happens entirely behind the far fade.
export function DepthCorridor({ progress, mobile, from, to }: DepthCorridorProps) {
  const root = useRef<HTMLDivElement>(null);
  const rails = useMemo(
    () =>
      Array.from({ length: DEPTH_COUNT * (mobile ? 2 : 3) }, (_, index) => ({
        index,
        band: Math.floor(index / (mobile ? 2 : 3)),
        side: index % (mobile ? 2 : 3),
      })),
    [mobile],
  );

  useEffect(() => {
    const field = root.current;
    if (!field) return;
    const columns = Array.from(field.children) as HTMLDivElement[];
    let pending = 0;
    const leg = from === "software-factory" ? 0 : from === "kivilcim" ? 1 : 2;
    function paint() {
      pending = 0;
      if (!field) return;
      const t = signalPhase(progress.get(), mobile, from, to);
      field.hidden = t <= 0 || t >= 0.85;
      if (field.hidden) return;
      // Pull back first. Traverse the archive, then advance through it.
      // Position alone drives this curve, so reverse scrolling retraces it.
      const retreat = -470 * ramp(0, 0.18, t);
      const advance = (leg === 1 ? 7800 : 5900) * ramp(0.25, 0.82, t);
      const travel = retreat + advance;
      const crossing = ramp(0.11, 0.4, t);
      const cameraX = (leg === 1 ? -1 : 1) * crossing * (mobile ? 25 : 140);
      const cameraY =
        leg === 2
          ? -590 * ramp(0.17, 0.76, t)
          : Math.sin(t * Math.PI * 2) * (leg === 0 ? 130 : -170);
      field.style.opacity = String(ramp(0, 0.15, t) * (1 - ramp(0.68, 0.85, t)));
      const viewportWidth = field.clientWidth;
      const viewportHeight = field.clientHeight;
      const perspective = mobile ? 740 : 920;
      for (const rail of rails) {
        const column = columns[rail.index];
        if (!column) continue;
        const initialZ = -rail.band * (DEPTH_SPAN / DEPTH_COUNT) - rail.side * 115;
        // Positive modulus gives the same result when traveling backwards.
        const z = ((((initialZ + travel + 4750) % DEPTH_SPAN) + DEPTH_SPAN) % DEPTH_SPAN) - 4750;
        const polarity = (rail.side + rail.band) % 2 ? 1 : -1;
        const spread = mobile
          ? 105 + ((rail.band * 67 + rail.side * 73) % 260)
          : 285 + ((rail.band * 97 + rail.side * 173) % 1100);
        const railWidth = mobile ? 150 : 200;
        // The nearest rails leave through the sides before their wrap fade,
        // so their surfaces remain opaque while they are in the reading field.
        const exit = 1 + ramp(80, 500, z) * 0.8;
        const x = (polarity * spread - (polarity < 0 ? railWidth : 0) - cameraX) * exit;
        const y = ((rail.band * 211 + rail.side * 271) % 780) - 390 - cameraY;
        const fade = ramp(-4750, -4250, z) * (1 - ramp(580, 650, z));
        column.style.opacity = String(fade);
        column.style.setProperty("--wash", String(0.42 * (1 - ramp(-4200, -350, z))));
        // Clipping flattens this stage: explicitly keep the nearest reel on top.
        column.style.zIndex = String(Math.round(z + 4750));
        column.style.transform = `translate3d(${x}px,${y}px,${z}px)`;
        column.style.visibility = fade < 0.005 ? "hidden" : "visible";
        const scale = perspective / (perspective - z);
        const left = viewportWidth / 2 + x * scale;
        const top = viewportHeight * 0.46 + (y - 640) * scale;
        const visible =
          fade >= 0.005 &&
          left < viewportWidth + 300 &&
          left + railWidth * scale > -300 &&
          top < viewportHeight + 300 &&
          top + (mobile ? 900 : 1100) * scale > -300;
        column.dataset.active = String(visible || (z > 0 && fade >= 0.005));
      }
    }
    const schedule = () => {
      if (!pending) pending = requestAnimationFrame(paint);
    };
    paint();
    const stop = progress.on("change", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      stop();
      cancelAnimationFrame(pending);
      window.removeEventListener("resize", schedule);
    };
  }, [progress, mobile, from, to, rails]);

  if (archiveFrames.length < DEPTH_COUNT * 3 * 6) return null;
  const count = 6;
  return (
    <div ref={root} className={styles.corridor} data-depth-corridor="" aria-hidden="true" hidden>
      {rails.map(({ index, band, side }) => {
        const exposures = Array.from(
          { length: count },
          (_, i) => archiveFrames[index * count + i]!,
        );
        return (
          <div
            className={styles.rail}
            key={index}
            data-depth-band={band}
            style={
              {
                "--reel-time": `${5.6 + (index % 5) * 0.82}s`,
                "--reel-delay": `-${index * 0.73}s`,
                "--reel-direction": (band + side) % 2 ? "reverse" : "normal",
              } as CSSProperties
            }
          >
            <div className={styles.window}>
              <div className={styles.reel}>
                {[0, 1].map((copy) => (
                  <div className={styles.sequence} key={copy}>
                    {exposures.map((frame) => (
                      <div className={styles.exposure} key={frame.id} data-archive-frame={frame.id}>
                        <span
                          className={styles.frame}
                          style={{ backgroundImage: `url("${frame.src}")` }}
                        />
                        <span className={styles.registration}>
                          <span>ARCHIVE / {frame.id.replace(/^archive-/, "")}</span>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
