"use client";

import { useEffect, useRef, type RefObject } from "react";
import styles from "./SignalPassage.module.css";

export type CameraMode = "guided" | "look";

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

function applyLook(
  el: HTMLDivElement | null,
  point: RefObject<{ x: number; y: number; z: number }>,
  x: number,
  y: number,
  z: number,
) {
  if (!el) return;
  point.current = { x: clamp(x), y: clamp(y), z: clamp(z) };
  for (const axis of ["x", "y", "z"] as const)
    el.style.setProperty("--look-" + axis, String(point.current[axis]));
}

export function CameraComparison({
  stage,
  mode,
  switchMode,
}: {
  stage: RefObject<HTMLDivElement | null>;
  mode: CameraMode;
  switchMode: (value: CameraMode) => void;
}) {
  const point = useRef({ x: 0, y: 0, z: 0 });
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number } | null>(
    null,
  );

  const aim = (x: number, y: number, z: number) => applyLook(stage.current, point, x, y, z);
  useEffect(() => {
    const el = stage.current;
    if (!el || mode !== "look") return;
    const move = (e: PointerEvent) => {
      if (
        e.pointerType !== "mouse" ||
        drag.current ||
        el.hidden ||
        (e.target instanceof Element && e.target.closest("[data-camera-control]"))
      )
        return;
      applyLook(
        el,
        point,
        (e.clientX / innerWidth - 0.5) * 2,
        (e.clientY / innerHeight - 0.5) * 2,
        point.current.z,
      );
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      for (const axis of ["x", "y", "z"]) el.style.removeProperty("--look-" + axis);
    };
  }, [stage, mode]);
  return (
    <div
      data-camera-control=""
      className={styles.cameraControl}
      aria-label="Kamera karşılaştırması"
      role="group"
    >
      <div className={styles.cameraModes}>
        <button aria-pressed={mode === "guided"} onClick={() => switchMode("guided")}>
          A · Rota
        </button>
        <button aria-pressed={mode === "look"} onClick={() => switchMode("look")}>
          B · Serbest bakış
        </button>
      </div>
      {mode === "look" && (
        <div className={styles.cameraTools}>
          <button
            className={styles.pad}
            aria-label="Bakışı yönlendir. Sürükle veya yön tuşlarını kullan. Tıklayarak ortala."
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = {
                id: e.pointerId,
                x: point.current.x,
                y: point.current.y,
                startX: e.clientX,
                startY: e.clientY,
              };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (d?.id !== e.pointerId) return;
              aim(
                d.x + (e.clientX - d.startX) / 52,
                d.y + (e.clientY - d.startY) / 52,
                point.current.z,
              );
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              if (
                d?.id === e.pointerId &&
                Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4
              )
                aim(0, 0, 0);
              drag.current = null;
            }}
            onLostPointerCapture={() => {
              drag.current = null;
            }}
            onKeyDown={(e) => {
              const delta: Record<string, [number, number]> = {
                ArrowLeft: [-0.25, 0],
                ArrowRight: [0.25, 0],
                ArrowUp: [0, -0.25],
                ArrowDown: [0, 0.25],
              };
              const d = delta[e.key];
              if (d) {
                e.preventDefault();
                e.stopPropagation();
                aim(point.current.x + d[0], point.current.y + d[1], point.current.z);
              } else if (e.key === "Enter" || e.key === " ") aim(0, 0, 0);
            }}
          >
            ✥ Sürükle
          </button>
          <button
            aria-label="Uzaklaş"
            onClick={() => aim(point.current.x, point.current.y, point.current.z - 0.35)}
          >
            −
          </button>
          <button
            aria-label="Yaklaş"
            onClick={() => aim(point.current.x, point.current.y, point.current.z + 0.35)}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
