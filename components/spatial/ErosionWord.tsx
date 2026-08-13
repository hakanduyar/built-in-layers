"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

// Spatial Portfolio V2 (feature/spatial-portfolio-v2, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). The single atmospheric prototype.
//
// V1's atmosphere was a continuously-running canvas ember field that ran
// across the whole journey and was rejected as "random debug particles."
// V2 replaces it with an erosion-wind treatment that (a) is attached to
// exactly ONE transition and does not exist outside it, (b) acts on
// expressive typography rather than floating in space unattached to
// anything, and (c) uses plain DOM transforms -- no canvas, no particle
// system, no WebGL, no dependency.
//
// Only the giant decorative word erodes. Body text, project content, and
// every functional label are untouched (§20).

type ErosionWordProps = {
  /** The word to erode. Decorative: always aria-hidden, always duplicated
   *  in real semantic copy elsewhere on the page. */
  word: string;
  /**
   * 0..1 erosion progress for this one transition: start -> peak -> decay.
   * `null` under reduced motion / before hydration, where the word still
   * renders at full scale as a real compositional element but nothing
   * detaches or drifts.
   */
  erosion: MotionValue<number> | null;
};

// Three depth layers rather than one, so fragments do not drift in visible
// lockstep -- but all along a single shared wind vector (up and to the
// right), which is what keeps it reading as one weather event instead of a
// generic particle spray.
const WIND = { x: 1, y: -0.42 };

// Fragment sizes are in `em`, so they scale with the giant word itself
// rather than staying fixed pixel specks. An earlier pass used 3-6px
// literals and the effect was invisible against ~180px letterforms at
// 1440px -- caught by direct screenshot review, not by a test.
const FRAGMENT_LAYERS = [
  { count: 6, speed: 1, width: 0.11, height: 0.05 },
  { count: 6, speed: 1.7, width: 0.07, height: 0.035 },
  { count: 5, speed: 2.6, width: 0.045, height: 0.025 },
] as const;

/** Deterministic pseudo-random in [0,1). Seeded by index so server and
 *  client always agree and fragments never re-scatter between renders. */
function seeded(index: number): number {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function ErosionWord({ word, erosion }: ErosionWordProps) {
  return (
    // The scene's type scale lives on this wrapper, not on the word span, so
    // the fragment layers inherit it and their `em` sizes stay proportional
    // to the letterforms they are breaking off.
    // The clamp floor is viewport-driven rather than a fixed rem: a single
    // unbreakable word cannot wrap, so a rem-based minimum overflowed the
    // 320px viewport by ~14px in the linear fallback (caught by the
    // responsive e2e check, not by eye).
    <div className="relative inline-block text-[clamp(2.5rem,16vw,15rem)]" aria-hidden="true">
      <span className="block font-display leading-[0.82] tracking-[-0.03em] uppercase text-ink">
        {word}
      </span>

      {erosion !== null &&
        FRAGMENT_LAYERS.map((layer, layerIndex) => (
          <FragmentLayer key={layerIndex} layer={layer} layerIndex={layerIndex} erosion={erosion} />
        ))}
    </div>
  );
}

function FragmentLayer({
  layer,
  layerIndex,
  erosion,
}: {
  layer: (typeof FRAGMENT_LAYERS)[number];
  layerIndex: number;
  erosion: MotionValue<number>;
}) {
  // One transform per layer, driven straight off the scroll MotionValue --
  // never React state, so this costs no re-renders while scrolling.
  const x = useTransform(erosion, [0, 1], [0, WIND.x * 190 * layer.speed]);
  const y = useTransform(erosion, [0, 1], [0, WIND.y * 190 * layer.speed]);
  // Start -> peak -> decay (§19): fragments lift off, carry, then thin out
  // as the camera reaches the wall.
  const opacity = useTransform(erosion, [0, 0.18, 0.62, 1], [0, 0.85, 0.6, 0]);

  return (
    <motion.div
      // Test hook, same convention as Reveal's `data-reveal`: lets the e2e
      // suite prove the atmosphere is genuinely absent under reduced motion
      // rather than merely invisible.
      data-erosion-fragments="true"
      className="pointer-events-none absolute inset-0"
      style={{ x, y, opacity }}
    >
      {Array.from({ length: layer.count }, (_, i) => {
        const seed = seeded(layerIndex * 31 + i * 7);
        const seed2 = seeded(layerIndex * 17 + i * 13 + 5);
        // Fragments detach from the word's trailing half and sit within its
        // cap height, so they read as pieces coming off the letterforms
        // rather than dust sprinkled over the whole block.
        const left = 46 + seed * 56;
        const top = 8 + seed2 * 56;
        return (
          <span
            key={i}
            className={i % 4 === 0 ? "absolute bg-signal" : "absolute bg-ink"}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${layer.width}em`,
              height: `${layer.height}em`,
            }}
          />
        );
      })}
    </motion.div>
  );
}
