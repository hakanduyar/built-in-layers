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
  const pendingLook = useRef<{ x: number; y: number } | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number } | null>(
    null,
  );

  const aim = (x: number, y: number, z: number) => {
    pendingLook.current = null;
    applyLook(stage.current, point, x, y, z);
  };
  useEffect(() => {
    const el = stage.current;
    if (!el || mode !== "look") return;
    let raf = 0;
    let lastTime = 0;
    let lastPointer: { x: number; y: number } | null = null;
    const easeLook = (time: number) => {
      raf = 0;
      const target = pendingLook.current;
      if (!target || el.hidden) {
        lastTime = 0;
        return;
      }
      const weight = 1 - Math.exp(-Math.min(lastTime ? time - lastTime : 16, 48) / 105);
      lastTime = time;
      const x = point.current.x + (target.x - point.current.x) * weight;
      const y = point.current.y + (target.y - point.current.y) * weight;
      applyLook(el, point, x, y, point.current.z);
      if (Math.hypot(target.x - x, target.y - y) > 0.002) raf = requestAnimationFrame(easeLook);
      else {
        applyLook(el, point, target.x, target.y, point.current.z);
        pendingLook.current = null;
        lastTime = 0;
      }
    };
    const move = (e: PointerEvent) => {
      const previous = lastPointer;
      if (e.pointerType === "mouse") lastPointer = { x: e.clientX, y: e.clientY };
      if (
        e.pointerType !== "mouse" ||
        !previous ||
        drag.current ||
        el.hidden ||
        (e.target instanceof Element && e.target.closest("[data-camera-control]"))
      )
        return;
      pendingLook.current = {
        x: clamp(
          (pendingLook.current?.x ?? point.current.x) + ((e.clientX - previous.x) / innerWidth) * 2,
        ),
        y: clamp(
          (pendingLook.current?.y ?? point.current.y) +
            ((e.clientY - previous.y) / innerHeight) * 2,
        ),
      };
      if (!raf) raf = requestAnimationFrame(easeLook);
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      pendingLook.current = null;
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
