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
    const windows = columns.map((column) => column.firstElementChild as HTMLDivElement);
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
      const stageStyle = (field.closest("[data-signal-passage]") as HTMLElement | null)?.style;
      const look = (axis: string) => Number(stageStyle?.getPropertyValue("--look-" + axis) || 0);
      const lookX = look("x"),
        lookY = look("y"),
        lookZ = look("z");
      const originX = viewportWidth * (0.5 + lookX * 0.13);
      const originY = viewportHeight * (0.46 + lookY * 0.11);
      const depths: { index: number; z: number; fade: number }[] = [];
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
        // Explicit projection avoids WebKit flattening ancestor perspective.
        // The camera geometry is identical, but every engine receives a 2D plate.
        const scale = perspective / (perspective - z - lookZ * 60);
        const left = originX + (viewportWidth / 2 + x - lookX * 70 - originX) * scale;
        const railTop = originY + (viewportHeight * 0.46 + y - 750 - lookY * 60 - originY) * scale;
        column.style.transform = `translate3d(${left}px,${railTop}px,0) scale(${scale})`;
        column.style.visibility = fade < 0.005 ? "hidden" : "visible";

        const top = railTop + 110 * scale;
        const visible =
          fade >= 0.005 &&
          left < viewportWidth + 300 &&
          left + railWidth * scale > -300 &&
          top < viewportHeight + 300 &&
          top + (mobile ? 900 : 1100) * scale > -300;
        column.dataset.active = String(visible || (z > 0 && fade >= 0.005));
        depths.push({ index: rail.index, z, fade });
      }
      // Compose in projected space, after all transforms have been written.
      // A reel's animation stays inside its window, so this clearance remains
      // valid for every frame of its vertical cycle, not only a sampled image.
      const viewport = field.getBoundingClientRect();
      const selected: { left: number; right: number; top: number; bottom: number; fade: number }[] =
        [];
      const gutter = mobile ? 8 : 12;
      for (const candidate of depths.sort((a, b) => b.z - a.z)) {
        const aperture = windows[candidate.index]!;
        const raw = aperture.getBoundingClientRect();
        const box = {
          left: Math.max(raw.left, viewport.left),
          right: Math.min(raw.right, viewport.right),
          top: Math.max(raw.top, viewport.top),
          bottom: Math.min(raw.bottom, viewport.bottom),
        };
        let separation = 1;
        for (const occupied of selected) {
          const clearance = Math.max(
            occupied.left - box.right,
            box.left - occupied.right,
            occupied.top - box.bottom,
            box.top - occupied.bottom,
          );
          const fadeDistance = Math.max(16, Math.min(96, raw.width * 0.4));
          separation *= 1 - occupied.fade * (1 - ramp(gutter, gutter + fadeDistance, clearance));
        }
        const edgeDistance = Math.max(12, Math.min(48, raw.width * 0.25));
        const visibleArea =
          ramp(0, edgeDistance, box.right - box.left) * ramp(0, edgeDistance, box.bottom - box.top);
        const packing = visibleArea * separation;
        aperture.style.opacity = String(packing);
        aperture.style.visibility = packing > 0.001 ? "visible" : "hidden";
        selected.push({
          left: raw.left,
          right: raw.right,
          top: raw.top,
          bottom: raw.bottom,
          fade: ramp(0, 0.08, candidate.fade),
        });
        if (packing <= 0.001) columns[candidate.index]!.dataset.active = "false";
      }
    }
    const schedule = () => {
      if (!pending) pending = requestAnimationFrame(paint);
    };
    paint();
    const stop = progress.on("change", schedule);
    window.addEventListener("resize", schedule);
    const stage = field.closest("[data-signal-passage]");
    let previousLook = "";
    const observer = new MutationObserver(() => {
      const style = (stage as HTMLElement | null)?.style;
      const look = ["x", "y", "z"]
        .map((axis) => style?.getPropertyValue("--look-" + axis))
        .join(",");
      if (look !== previousLook) {
        previousLook = look;
        schedule();
      }
    });
    if (stage) observer.observe(stage, { attributes: true, attributeFilter: ["style"] });
    return () => {
      stop();
      cancelAnimationFrame(pending);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
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
