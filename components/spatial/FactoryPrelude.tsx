"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { ramp } from "@/lib/spatial/signalPhase";
import styles from "./FactoryPrelude.module.css";

// Apertures in the actual 1600 x 1000 delivery-loop drawing. Their final
// positions are read from the original Figure, including its desktop crop.
const fragments = [
  { x: 59, y: 282, w: 367, h: 110, left: 0.73, top: 0.24, measure: 0.2 },
  { x: 795, y: 283, w: 369, h: 109, left: 0.88, top: 0.48, measure: 0.15 },
  { x: 59, y: 439, w: 328, h: 110, left: 0.51, top: 0.79, measure: 0.17 },
];

export function FactoryPrelude({
  progress,
  src,
  mobile,
}: {
  progress: MotionValue<number>;
  src: string;
  mobile: boolean;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const field = fieldRef.current;
    const image = document.querySelector<HTMLImageElement>(
      '[data-scene="software-factory"] [data-project-ground-source] img',
    );
    if (!field || !image || image.getAttribute("src") !== src) return;
    const focus = sceneFocusProgress("software-factory", mobile);
    const pieces = Array.from(field.children) as HTMLElement[];
    let frame = 0;
    function paint() {
      frame = 0;
      if (!field || !image) return;
      const t = progress.get() / focus;
      field.hidden = t <= 0.035 || t >= 0.99;
      if (field.hidden) return;
      const width = field.clientWidth,
        height = field.clientHeight;
      const plane = image.getBoundingClientRect();
      const lock = ramp(0.47, 0.88, t);
      const fade = 1 - ramp(0.88, 0.99, t);
      fragments.forEach((fragment, i) => {
        const piece = pieces[i];
        if (!piece) return;
        const looseScale = Math.min(
          (width * (fragment.measure + (mobile ? 0.12 : 0))) / fragment.w,
          0.82,
        );
        const scale = looseScale + (plane.width / 1600 - looseScale) * lock;
        const left =
          width * (fragment.left - t * (0.1 + i * 0.022)) - (looseScale * fragment.w) / 2;
        const top = height * (fragment.top - t * 0.09);
        const x = left + (plane.left + (plane.width * fragment.x) / 1600 - left) * lock;
        const y = top + (plane.top + (plane.height * fragment.y) / 1000 - top) * lock;
        piece.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
        piece.style.opacity = String(
          ramp(0.035 + i * 0.045, 0.33 + i * 0.05, t) * (0.29 + 0.33 * lock) * fade,
        );
      });
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    const stop = progress.on("change", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      stop();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    };
  }, [progress, src, mobile]);

  return (
    <div ref={fieldRef} className={styles.field} data-factory-prelude="" aria-hidden="true" hidden>
      {fragments.map(({ x, y, w, h }) => (
        <i
          key={x + "-" + y}
          style={{
            width: w,
            height: h,
            backgroundImage: `url("${src}")`,
            backgroundPosition: `-${x}px -${y}px`,
          }}
        />
      ))}
    </div>
  );
}
