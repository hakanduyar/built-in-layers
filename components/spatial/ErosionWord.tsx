"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { travelWindVector } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). The MATERIAL SHIFT half of the V5 transition
// vocabulary (§32), and the iteration's signature effect (§15).
//
// WHAT CHANGED FROM V4
//
// V4's mental model was TEXT BREAKING APART: one flat word, with rectangles
// detaching from it. Close up, those rectangles were empty shapes and the word
// was just fading, so the effect read as generic disintegration.
//
// V5's model is A COATING PEELING OFF A MATERIAL (§15-17). The word has three
// registered layers:
//
//   1. SHELL      the word in ink -- the coating, always fully painted
//   2. SUBSTRATE  the word in graphite, masked to the eroded zones, so where
//                 the coating has gone the material underneath is exposed
//   3. TRACE      the word filled with a structural drawing, masked to the
//                 much smaller deep cores inside those zones
//
// It is drawn in that stacking order rather than by punching holes in the
// shell, which is the same percept and needs only additive positive masks --
// no mask-composite, no SVG mask, no compositing mode that behaves differently
// between Chromium and WebKit.
//
// The trace layer is the point of the whole effect: it says, in material,
// exactly what the site says in words. Interfaces on the surface. Systems
// underneath.
//
// EROSION IS NOT A FADE (§18). Coverage grows from irregular zones that open
// at two meaningful edges first -- the leading edge running into the wall, and
// the top -- and spread backwards. At full erosion roughly half the coating is
// gone and the word is still readable.
//
// PERFORMANCE. Mask geometry is quantised to EROSION_STEPS positions, so the
// two masked layers repaint a few dozen times across the whole transition
// rather than on every frame; a MotionValue set to an unchanged string does
// not re-render. The debris keeps moving at full frame rate, because that is
// pure transform work. Measured cost is in docs/PROGRESS.md.
//
// Only the giant decorative word erodes. Body text, project content, and every
// functional label are untouched (§16: "Functional text remains untouched").

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

/** Quantisation of the mask geometry. See the performance note above. */
const EROSION_STEPS = 44;

/**
 * Erosion zones, in percent of the word's own box.
 *
 * `start` is when a zone begins to open, so erosion SPREADS rather than fading
 * uniformly (§18). The first two sit on the leading edge and the top -- the
 * edges the wind and the wall are working on -- and later zones walk backwards
 * against the direction of travel.
 *
 * `deep` marks the zones that eventually expose the system trace. Only three
 * do, and their cores are a fraction of the zone, which is what keeps §21's
 * "extremely restrained" true: at normal viewing distance the impression is
 * that there is structure under there, not that each letter contains a HUD.
 */
const ZONES = [
  { cx: 99, cy: 52, rx: 15, ry: 46, start: 0, deep: true },
  { cx: 88, cy: 12, rx: 11, ry: 22, start: 0.06, deep: false },
  { cx: 82, cy: 78, rx: 10, ry: 24, start: 0.16, deep: true },
  { cx: 70, cy: 34, rx: 12, ry: 26, start: 0.26, deep: false },
  { cx: 58, cy: 82, rx: 9, ry: 20, start: 0.38, deep: true },
  { cx: 47, cy: 16, rx: 10, ry: 22, start: 0.5, deep: false },
  { cx: 33, cy: 64, rx: 10, ry: 24, start: 0.62, deep: true },
  { cx: 18, cy: 26, rx: 9, ry: 21, start: 0.74, deep: false },
  { cx: 5, cy: 70, rx: 8, ry: 19, start: 0.86, deep: false },
] as const;

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * Union of radial gradients -- CSS composites multiple mask layers additively
 * by default, which is exactly the "these regions are exposed" semantics
 * needed here, and needs no vendor-specific compositing keyword.
 */
function buildMask(progress: number, deepOnly: boolean): string {
  const layers: string[] = [];
  for (const zone of ZONES) {
    if (deepOnly && !zone.deep) continue;
    // Deep cores lag their own zone: the coating goes first, the material
    // under it only opens once the zone has been working for a while.
    const start = deepOnly ? zone.start + 0.12 : zone.start;
    const grown = clamp01((progress - start) / Math.max(1 - start, 0.01));
    if (grown <= 0) continue;
    const scale = (deepOnly ? 0.52 : 1) * (0.3 + 0.7 * grown);
    const rx = (zone.rx * scale).toFixed(2);
    const ry = (zone.ry * scale).toFixed(2);
    // A HARD stop with only a hairline of feather. An earlier pass faded from
    // 58% to 100% and, at 180px letterforms, that read as a smudge across the
    // word rather than as coating removed from it -- caught by screenshot, not
    // by a test. Erosion has to have an edge.
    layers.push(
      `radial-gradient(ellipse ${rx}% ${ry}% at ${zone.cx}% ${zone.cy}%, #000 0 88%, transparent 97%)`,
    );
  }
  // No zone open yet: an empty mask list would mean "no mask", i.e. fully
  // visible, which is the exact opposite of what is wanted.
  return layers.length > 0 ? layers.join(", ") : "linear-gradient(transparent, transparent)";
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
      {tension ? (
        <CompressingStack word={word} tension={tension} erosion={erosion} />
      ) : (
        <MaterialStack word={word} erosion={erosion} />
      )}

      {erosion !== null &&
        FRAGMENT_LAYERS.map((layer, layerIndex) => (
          <FragmentLayer key={layerIndex} layer={layer} layerIndex={layerIndex} erosion={erosion} />
        ))}
    </div>
  );
}

// The vertical padding is load-bearing, not spacing: a mask is clipped to its
// element's border box, and with leading of 0.82 the letterforms reach past
// the line box, so an unpadded stack sheared the erosion patches off with a
// dead-straight horizontal edge across the caps.
const WORD_CLASS = "block py-[0.07em] font-display leading-[0.82] tracking-[-0.03em] uppercase";

function CompressingStack({
  word,
  tension,
  erosion,
}: {
  word: string;
  tension: MotionValue<number>;
  erosion: MotionValue<number> | null;
}) {
  // A horizontal squeeze anchored on the trailing edge, so the word visibly
  // runs out of room in the direction the camera is travelling. No growth,
  // no spring, no rotation -- a deformation, not an effect. Applied to the
  // whole stack so all three material layers stay in exact registration.
  const scaleX = useTransform(tension, [0, 1], [1, 0.92]);
  return (
    <motion.div className="origin-right" style={{ scaleX }}>
      <MaterialStack word={word} erosion={erosion} />
    </motion.div>
  );
}

function MaterialStack({ word, erosion }: { word: string; erosion: MotionValue<number> | null }) {
  return (
    <div className="relative">
      {/* LAYER 1 -- the coating. Always fully painted; the layers above it are
          what make it look removed. */}
      <span data-erosion-layer="shell" className={`${WORD_CLASS} text-ink`}>
        {word}
      </span>
      {erosion !== null && <SubstrateLayer word={word} erosion={erosion} />}
      {erosion !== null && <TraceLayer word={word} erosion={erosion} />}
    </div>
  );
}

/** Quantised mask geometry: see the performance note in the file header. */
function useMask(erosion: MotionValue<number>, deepOnly: boolean) {
  const stepped = useTransform(
    erosion,
    (value) => Math.round(clamp01(value) * EROSION_STEPS) / EROSION_STEPS,
  );
  return useTransform(stepped, (value) => buildMask(value, deepOnly));
}

/**
 * LAYER 2 -- graphite material, exposed wherever the coating has gone.
 *
 * Tone alone was not enough: ink and ink-muted are both dark, and at display
 * scale an exposed patch read as a shadow on the coating rather than as a
 * different material under it. The substrate therefore carries a fine
 * lamination grain as well -- graphite banded with ink, both approved tokens --
 * so the two layers differ in MATERIAL, not only in value.
 */
// Diagonal, not horizontal: a 0deg grain read as television scanlines in
// review, where the same frequency on a diagonal reads as a machined surface.
const SUBSTRATE_GRAIN =
  "repeating-linear-gradient(58deg, var(--color-ink-muted) 0 3px, var(--color-ink) 3px 4px)";

function SubstrateLayer({ word, erosion }: { word: string; erosion: MotionValue<number> }) {
  const mask = useMask(erosion, false);
  return (
    <motion.span
      data-erosion-layer="substrate"
      className={`absolute inset-0 ${WORD_CLASS} text-transparent`}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        backgroundColor: "var(--color-ink-muted)",
        backgroundImage: SUBSTRATE_GRAIN,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
      }}
    >
      {word}
    </motion.span>
  );
}

/**
 * LAYER 3 -- the system trace. Not a fill and not noise: one small tiled
 * drawing in the world's own vocabulary (rail with ticks, corner bracket,
 * node and connector, index block), clipped to the letterforms and then
 * masked to the deep cores, so it is only ever glimpsed through them.
 *
 * The drawing sits on paper rather than on a darker ink, so the deepest
 * exposure reads as the page's own structure showing through the material
 * rather than as a hole punched in it -- and it introduces no colour outside
 * the approved token set.
 */
function TraceLayer({ word, erosion }: { word: string; erosion: MotionValue<number> }) {
  const mask = useMask(erosion, true);
  return (
    <motion.span
      data-erosion-layer="trace"
      className={`absolute inset-0 ${WORD_CLASS} text-transparent`}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        backgroundColor: "var(--color-paper)",
        backgroundImage: TRACE_TILE,
        backgroundSize: "104px 48px",
        backgroundRepeat: "repeat",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
      }}
    >
      {word}
    </motion.span>
  );
}

/**
 * The trace motif, as a data URI so it needs no network request and no build
 * step. Deliberately ONE tile, repeated: §19 asks for a small reused
 * vocabulary rather than a unique shape everywhere.
 */
const TRACE_TILE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="162" height="74" viewBox="0 0 236 108">
     <g fill="none" stroke="#161616" stroke-width="2.2">
       <path d="M8 30 H150" />
       <path d="M28 26 V34 M62 26 V34 M96 26 V34 M130 26 V34" />
       <path d="M176 16 H214 V54" />
       <path d="M20 74 H74 L92 92 H150" />
       <circle cx="74" cy="74" r="4.5" />
       <path d="M186 78 H228" />
     </g>
     <g fill="#161616">
       <rect x="176" y="88" width="14" height="6" />
       <rect x="196" y="88" width="6" height="6" />
     </g>
     <path d="M8 52 H58" fill="none" stroke="#ff4f1f" stroke-width="3" />
   </svg>`,
)}")`;

/* ------------------------------------------------------------------ debris */

// §19: debris must have two reading levels -- material fragments from a
// distance, system fragments close up. Six archetypes, reused and transformed
// across the three depth layers, rather than a field of meaningless polygons.
type Archetype = "bracket" | "rail" | "node" | "index" | "hatch" | "path";

const ARCHETYPES: Archetype[] = ["bracket", "rail", "node", "index", "hatch", "path"];

function FragmentShape({ kind }: { kind: Archetype }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    vectorEffect: "non-scaling-stroke" as const,
  };
  switch (kind) {
    case "bracket":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <path d="M2 8 V2 H10" {...common} />
          <path d="M22 16 V22 H14" {...common} />
        </svg>
      );
    case "rail":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <path d="M1 12 H23" {...common} />
          <path d="M7 8 V16 M17 8 V16" {...common} />
        </svg>
      );
    case "node":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <circle cx="7" cy="12" r="4" {...common} />
          <path d="M11 12 H23" {...common} />
        </svg>
      );
    case "index":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <rect x="1" y="7" width="10" height="10" fill="currentColor" />
          <path d="M15 9 H23 M15 15 H23" {...common} />
        </svg>
      );
    case "hatch":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <path d="M3 4 L9 20 M11 4 L17 20 M19 4 L23 15" {...common} />
        </svg>
      );
    case "path":
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <path d="M1 5 H12 V19 H21" {...common} />
          <circle cx="21" cy="19" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

// Three depth layers so fragments do not drift in visible lockstep -- but
// all along the single shared wind vector, which is what keeps it reading as
// one weather event instead of a generic particle spray. 12 fragments total.
//
// Sizes are in `em` so they scale with the giant word itself rather than
// staying fixed pixel specks. An earlier pass used 3-6px literals and the
// effect was invisible against ~180px letterforms at 1440px -- caught by
// direct screenshot review, not by a test.
const FRAGMENT_LAYERS = [
  { count: 5, speed: 1, size: 0.135 },
  { count: 4, speed: 1.7, size: 0.086 },
  { count: 3, speed: 2.6, size: 0.056 },
] as const;

/** Deterministic pseudo-random in [0,1). Seeded by index so server and
 *  client always agree and fragments never re-scatter between renders. */
function seeded(index: number): number {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
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
        const seed3 = seeded(layerIndex * 23 + i * 11 + 3);
        // Fragments detach from the word's trailing half and sit within its
        // cap height, so they read as pieces coming off the letterforms
        // rather than dust sprinkled over the whole block.
        const left = 46 + seed * 56;
        const top = 8 + seed2 * 56;
        // A fixed tilt per fragment, never animated: enough that the pieces do
        // not read as a row of aligned UI chips, without anything spinning.
        const rotate = Math.round((seed3 - 0.5) * 44);
        const kind = ARCHETYPES[(layerIndex * 2 + i) % ARCHETYPES.length]!;
        return (
          <span
            key={i}
            data-fragment-archetype={kind}
            className={`absolute block ${i % 4 === 0 ? "text-signal" : "text-ink"}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${layer.size}em`,
              height: `${layer.size}em`,
              transform: `rotate(${rotate}deg)`,
            }}
          >
            <FragmentShape kind={kind} />
          </span>
        );
      })}
    </motion.div>
  );
}
