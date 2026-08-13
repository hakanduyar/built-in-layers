"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type AtmosphereEmbersProps = {
  /** Briefly increases emission/brightness -- ties the collision "spark"
   *  moment to Kıvılcım's own name ("spark") without inventing a new brand
   *  motif. */
  impact: boolean;
  dense?: boolean;
};

type Ember = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  drift: number;
  alpha: number;
};

const BASE_COUNT_DESKTOP = 24;
const BASE_COUNT_MOBILE = 12;
const IMPACT_BURST = 14;

function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function makeEmber(width: number, height: number): Ember {
  return {
    x: Math.random() * width,
    y: height + Math.random() * height * 0.3,
    r: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.15,
    vy: -(0.15 + Math.random() * 0.25),
    drift: Math.random() * Math.PI * 2,
    alpha: 0.3 + Math.random() * 0.5,
  };
}

// One deliberately restrained atmospheric/seasonal prototype (the brief's
// "exactly ONE" requirement) -- slow-drifting embers in the approved
// --color-signal / --color-line hues, tying "spark" (Kıvılcım's own name)
// to the collision moment. This is a real, disclosed departure from
// DESIGN_SYSTEM §13's forbidden "looping/idle animations" -- isolated to
// this experimental branch (see docs/DESIGN_SYSTEM.md §18), never merged.
// Canvas 2D only -- no WebGL, per the brief's explicit constraint.
export function AtmosphereEmbers({ impact, dense = false }: AtmosphereEmbersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<Ember[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Looping ambient motion has no place in a reduced-motion context --
    // this component simply does not run at all, rather than rendering a
    // frozen single frame that would still need to be reduced-motion
    // audited for meaning it doesn't actually carry.
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const signal = readToken("--color-signal", "#ff4f1f");
    const line = readToken("--color-line", "#b8b5ac");

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    function resize() {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize();

    const count = dense ? BASE_COUNT_MOBILE : BASE_COUNT_DESKTOP;
    embersRef.current = Array.from({ length: count }, () => makeEmber(width, height));

    let visible = document.visibilityState === "visible";
    function handleVisibility() {
      visible = document.visibilityState === "visible";
    }
    document.addEventListener("visibilitychange", handleVisibility);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    function tick() {
      rafRef.current = requestAnimationFrame(tick);
      if (!visible || !ctx) return;

      ctx.clearRect(0, 0, width, height);
      const embers = embersRef.current;

      for (const ember of embers) {
        ember.drift += 0.01;
        ember.y += ember.vy;
        ember.x += ember.vx + Math.sin(ember.drift) * 0.1;

        if (ember.y < -10) {
          Object.assign(ember, makeEmber(width, height));
        }

        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.r, 0, Math.PI * 2);
        ctx.fillStyle = ember.alpha > 0.55 ? signal : line;
        ctx.globalAlpha = ember.alpha;
        ctx.fill();
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reduceMotion, dense]);

  useEffect(() => {
    if (reduceMotion || !impact) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    for (let i = 0; i < IMPACT_BURST; i += 1) {
      const ember = makeEmber(width, height * 0.5);
      ember.vy -= 0.2;
      ember.alpha = 0.7;
      embersRef.current.push(ember);
    }
    embersRef.current = embersRef.current.slice(
      -((dense ? BASE_COUNT_MOBILE : BASE_COUNT_DESKTOP) + IMPACT_BURST),
    );
  }, [impact, reduceMotion, dense]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
