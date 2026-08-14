"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { travelWindVector } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). The single atmospheric prototype.
//
// V1's atmosphere was a continuously-running canvas ember field that ran
// across the whole journey and was rejected as "random debug particles."
// V2 replaced it with erosion wind attached to exactly one transition,
// acting on expressive typography, using plain DOM transforms.
//
// V3 keeps that concept and gives it a reason to point where it points.
// The wind vector is no longer a hand-picked direction: it is DERIVED from
// the collision-approach leg (see travelWindVector), so fragments trail the
// word along the exact screen vector the camera is dragging it against.
// Fragment count is reduced rather than increased -- fewer, more deliberate
// pieces (§18). The word itself also compresses toward the wall as tension
// rises, which is one of the things that makes the collision specific to
// this system rather than a generic transition (§4).
//
// Only the giant decorative word erodes. Body text, project content, and
// every functional label are untouched (§19).

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
  /** 0..1 approach tension, compressing the word toward the wall. */
  tension?: MotionValue<number> | null;
};

/** Screen-space trailing direction, taken from the route itself. */
const WIND = travelWindVector();

/** Peak drift distance in px for a speed-1 layer, before per-layer speed. */
const DRIFT = 190;

// Three depth layers so fragments do not drift in visible lockstep -- but
// all along the single shared wind vector, which is what keeps it reading as
// one weather event instead of a generic particle spray. 13 fragments total,
// down from V2's 17: the brief asks for fewer and more deliberate, never
// more.
//
// Sizes are in `em` so they scale with the giant word itself rather than
// staying fixed pixel specks. An earlier pass used 3-6px literals and the
// effect was invisible against ~180px letterforms at 1440px -- caught by
// direct screenshot review, not by a test.
const FRAGMENT_LAYERS = [
  { count: 5, speed: 1, width: 0.12, height: 0.055 },
  { count: 4, speed: 1.7, width: 0.075, height: 0.038 },
  { count: 4, speed: 2.6, width: 0.045, height: 0.025 },
] as const;

/** Deterministic pseudo-random in [0,1). Seeded by index so server and
 *  client always agree and fragments never re-scatter between renders. */
function seeded(index: number): number {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function ErosionWord({ word, erosion, tension = null }: ErosionWordProps) {
  return (
    // The scene's type scale lives on this wrapper, not on the word span, so
    // the fragment layers inherit it and their `em` sizes stay proportional
    // to the letterforms they are breaking off.
    // The clamp floor is viewport-driven rather than a fixed rem: a single
    // unbreakable word cannot wrap, so a rem-based minimum overflowed the
    // 320px viewport by ~14px in the linear fallback (caught by the
    // responsive e2e check, not by eye).
    <div className="relative inline-block text-[clamp(2.5rem,16vw,15rem)]" aria-hidden="true">
      {/* Two distinct component types rather than one conditional style, so
          the compressing and static words never share a hook order across
          the pre-hydration -> enhanced swap. */}
      {tension ? <CompressingWord word={word} tension={tension} /> : <StaticWord word={word} />}

      {erosion !== null &&
        FRAGMENT_LAYERS.map((layer, layerIndex) => (
          <FragmentLayer key={layerIndex} layer={layer} layerIndex={layerIndex} erosion={erosion} />
        ))}
    </div>
  );
}

const WORD_CLASS = "block font-display leading-[0.82] tracking-[-0.03em] uppercase text-ink";

function StaticWord({ word }: { word: string }) {
  return <span className={WORD_CLASS}>{word}</span>;
}

function CompressingWord({ word, tension }: { word: string; tension: MotionValue<number> }) {
  // A horizontal squeeze anchored on the trailing edge, so the word visibly
  // runs out of room in the direction the camera is travelling. No growth,
  // no spring, no rotation -- a deformation, not an effect.
  const scaleX = useTransform(tension, [0, 1], [1, 0.92]);
  return (
    <motion.span className={`origin-right ${WORD_CLASS}`} style={{ scaleX }}>
      {word}
    </motion.span>
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
  const x = useTransform(erosion, [0, 1], [0, WIND.x * DRIFT * layer.speed]);
  const y = useTransform(erosion, [0, 1], [0, WIND.y * DRIFT * layer.speed]);
  // Start -> peak -> decay: fragments lift off, carry, then thin out as the
  // camera reaches the wall.
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
