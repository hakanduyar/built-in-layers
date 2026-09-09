"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionStyle } from "motion/react";
import { LowerRoute } from "@/components/spatial/LowerRoute";
import {
  FIELD_MIN_BODY_PX,
  SEAM_CLEARANCE_PX,
  driftField,
  driftFieldOpacity,
  driftMeasure,
  driftPlate,
  driftSection,
  type DriftSectionId,
} from "@/lib/spatial/editorialDrift";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). §26-31.
//
// The lower homepage keeps its exact semantic order and its exact content.
// What changes is that each section is a BLOCK ON A TRACK rather than a
// centred column, and where it sits on that track depends on how far it has
// travelled through the viewport.
//
// WHY THE POSITION IS A FRACTION, NOT A DISTANCE
//
// Everything is expressed as a fraction of the free space between the track's
// padding and the block's own width:
//
//   x = pad + f x (100vw - 2·pad - blockWidth)
//
// so for any f in [0,1] the block is inside the track BY CONSTRUCTION, at
// every viewport width. There is no width at which drift can push content off
// the page, which matters because the alternative -- translating a
// container-width section by a fixed vw amount -- overflows on exactly the
// viewports nobody screenshots. It also makes §36 fall out for free: the free
// space at 375px is a few dozen pixels, so mobile drift is inherently minimal
// without a single media query in the motion code.
//
// WHY NO SCROLL FILTER HERE
//
// The spatial camera filters raw scroll because its wheel-step edges are
// visible at that amplitude. Drift moves a block by single-digit vw across a
// whole viewport of scrolling, so the per-notch increment is well under a
// pixel and there is nothing to dissolve. Adding a second rAF filter per
// section would cost more than it could possibly smooth.

type EditorialDriftProps = { children: ReactNode };

/**
 * The track. Holds the two custom properties every block's position is derived
 * from, so the width used for layout and the width used in the transform can
 * never disagree.
 */
export function EditorialDrift({ children }: EditorialDriftProps) {
  return (
    <div
      data-editorial-drift="true"
      // V6 narrowed the desktop block from 78vw/1080px to 72vw/1020px. That is
      // not a typographic change for its own sake -- it is what creates the free
      // space the widened drift fractions spend. At 1440px it takes the track's
      // free width from 245px to 305px, and combined with the wider fractions
      // roughly doubles real lateral travel.
      className="relative w-full overflow-x-clip [--drift-pad:3vw] [--drift-w:min(92vw,1020px)] lg:[--drift-pad:4vw] lg:[--drift-w:min(72vw,1020px)] 2xl:[--drift-w:min(72vw,calc(1020px+(100vw-1536px)*0.4),1440px)]"
    >
      {/* V6.1: the spine now runs at two depths. The background runs sit behind
          the content planes; the foreground run comes in front of them, so the
          route reads as travelling through the space rather than as a rail drawn
          beside a list of sections (§20). */}
      {/* V14 (owner finding D) REMOVED THE DRIFT ROUTE: the oblique zigzag
          drawn at 10-15% behind and in front of the lower sections, with a
          registration mark at every stop. It was generated from the blocks'
          own entry/exit table and so described something true, but on the
          owner's frames it read as what the brief names -- "technical lines
          that decorate rather than explain": hairlines crossing the How I
          Build spine at two angles, a mark floating beside Field Notes. The
          lower page's relationship to the world is now stated once, by the
          world: the route ends on the terminus map, and each section carries
          its own register (SystemNode). The blocks still drift; the drift is
          the behaviour, and it needs no diagram of itself beside it. */}
      {/* V14.1 (owner §5, §13, §19): the route, continued down the page as one
          rail with a station at each section -- the lower world's spine, and
          the datum the blocks drift from. See LowerRoute. */}
      <LowerRoute />
      <div className="relative">{children}</div>
      {/* V14 (owner findings D, §14) REMOVED THE DRIFT SETTLE that closed the
          track here: a rule, a closed square and a 64px vertical hand-off,
          costing ~216px of travel to say "the route ends" one section before
          the finale said it again with four converging lines. The finale now
          carries the route's end as the resolved map (SiteFooter, RouteMap),
          which is the terminus stated once, as the thing it is. */}
    </div>
  );
}

function trackX(fraction: number): string {
  return `calc(var(--drift-pad) + ${fraction} * (100vw - 2 * var(--drift-pad) - var(--drift-w)))`;
}

/** How far the block's left edge stands from the rail at --drift-pad. */
function trackArm(fraction: number): string {
  return `calc(${fraction} * (100vw - 2 * var(--drift-pad) - var(--drift-w)))`;
}

/**
 * The seam measurement must land BEFORE paint, not after it.
 *
 * As a plain effect it produced a second render once hydration had already
 * painted. The field is absolutely positioned and cannot move its block, but the
 * extra render re-measures `useScroll` — enough to perturb a drift position read
 * taken at the same instant, which is exactly what the determinism contract in
 * tests/e2e/spatial-v5.spec.ts samples. A layout effect closes the window: the
 * seam is resolved before anything is painted, so there is never a frame in
 * which it is about to change.
 *
 * `useEffect` on the server, because React warns for `useLayoutEffect` during
 * SSR and there is nothing to measure there anyway.
 */
const useSeamEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** V14: the section fields are measured but not drawn. See DriftBlock. */
const DRAW_FIELDS = false;

export function DriftBlock({ id, children }: { id: DriftSectionId; children: ReactNode }) {
  const section = driftSection(id);
  const plate = driftPlate(id);
  const ref = useRef<HTMLDivElement>(null);
  // Entry -> exit across the block's own passage through the viewport, so the
  // block reaches its mid position exactly when it is centred and being read.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // The travelling position. There is NO reduced-motion branch here: the block
  // always binds this value, so server and client always agree, and the parked
  // state is applied by a `prefers-reduced-motion` rule in styles/globals.css
  // against the `--drift-parked` constant published below.
  //
  // It used to be `x: reduceMotion ? parked : x`, which is only correct while
  // `useReducedMotion()` is already true on the FIRST render -- and that is exactly
  // what produced a hydration failure, since the server cannot know the preference.
  // Settling the preference after hydration fixed the mismatch but opened a timing
  // window in which the block was still bound to the scroll; under parallel test
  // load tests/e2e/spatial-v5.spec.ts measured 91.44px of travel through it. CSS
  // has neither problem.
  const x = useTransform(scrollYProgress, [0, 1], [trackX(section.entry), trackX(section.exit)]);
  // V14.1: the block's distance from the lower rail (which stands at
  // --drift-pad), as a custom property. SystemNode's arm reads it, so the
  // section's register is drawn back to the rail at every drift position --
  // the drift becomes displacement FROM the rail, stated by a line.
  const arm = useTransform(
    scrollYProgress,
    [0, 1],
    [trackArm(section.entry), trackArm(section.exit)],
  );

  // V6.8 (JOB 3) DELETED TWO MARKS THAT STOOD HERE, and the test was the brief's
  // own: can a viewer perceive what the element represents without reading the
  // source?
  //
  //   - THE LEAD RULE: a tilted hairline whose angle encoded the block's direction
  //     of lateral travel. Nobody can read "tilt = drift direction" off a lone
  //     diagonal; in every review capture it read as a stray line wandering near
  //     the section. Represented something, communicated nothing. Deleted, along
  //     with driftLeadRule() and its unit tests.
  //   - THE PLATE: a long top rule with a corner tick above each block. Since the
  //     V6.7 completion pass every lower section carries a SystemNode register --
  //     the same corner vocabulary, attached to the section itself -- so the plate
  //     had become a second, unanchored copy of the same statement floating above
  //     the first. Deleted; the register stays, and driftPlate() now carries only
  //     the approach interval.
  //
  // The drift MOTION, the spine, its stops and the terminus all remain: they are
  // the route the blocks actually take.

  // FABLE GATE 1 (Q3): the section's ground — see driftField() for the full
  // rationale, including the two rejected geometries. Horizontally the sweep
  // envelope: the strip of track the block's own entry/exit table makes it
  // travel, plus its measure; the block slides visibly along its ground as it
  // passes — the ProjectPlane behaviour carried into the lower page.
  // Vertically the typographic seam: `16rem` is 128px of measured internal
  // block offset (identical in all four sections) plus 128px to the
  // whitespace just below the display heading's baseline (each section's
  // heading bottom sits at +118px, measured), so the register and heading
  // overhang the ground, the body stands on it, and the edge never crosses a
  // line of text. The field runs on below the content's bottom edge as ground
  // does. Desktop only, like the spine: on a phone the blocks barely drift,
  // so a field would describe territory that is not really there.
  const field = driftField(id);
  const measure = driftMeasure(id);
  /**
   * V10 (§D/L) -- THE SEAM IS MEASURED, AND A GROUND THAT IS ALL EDGE IS NOT
   * DRAWN.
   *
   * The comment above states the design rule exactly: "the edge never crosses a
   * line of text". It was not true. `seamRem` is a per-section CONSTANT that
   * assumed every section's display heading bottom sits at the same +118px, and
   * two of the four sections do not:
   *
   *   about        21.5rem is registered to a heading that is `sr-only` -- a
   *                1.0px box -- so the seam was placed against nothing and cut
   *                straight through the introduction.
   *   field-notes  16rem lands 128px into a block that is only 141.6px tall
   *                since V9 compressed the empty state, so the seam sat below
   *                almost all of the content and the "ground" was a 1135x62px
   *                pale bar floating in the gap before About, 48px of which had
   *                nothing above it at all.
   *
   * The seam is now MEASURED from the block's own first display-scale line --
   * whatever element actually renders large -- with the same ~10px clearance the
   * two working sections were already demonstrating. And a field whose remaining
   * height is smaller than its own bottom overhang is not drawn: a surface that
   * is entirely overhang is not a ground, and no seam rule can rescue it.
   *
   * `seamRem` stays as the pre-hydration and no-JS value, so the server render is
   * unchanged and the measured value only ever refines it.
   */
  const blockRef = useRef<HTMLDivElement>(null);
  const [seam, setSeam] = useState<{ top: number; draw: boolean } | null>(null);
  useSeamEffect(() => {
    const wrapper = ref.current;
    const block = blockRef.current;
    if (!wrapper || !block) return;
    const measureSeam = () => {
      const wrapperTop = wrapper.getBoundingClientRect().top;
      const blockBottom = block.getBoundingClientRect().bottom - wrapperTop;
      // Start from the AUTHORED seam. Two of the four sections were already
      // landing it correctly (measured: ~9.8px of clearance under the display
      // line at both 1536x864 and 1920x1080), and replacing the constant wholesale
      // moved one of those two INTO its own subheading — a fix that broke a
      // working case. The constant stays; it is only overridden where it is
      // demonstrably wrong.
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // V14: the approach interval differs by breakpoint (gapVhDesktop), so the
      // seam starts from the interval the block is actually padded by.
      const gapVh = window.matchMedia("(min-width: 1024px)").matches
        ? plate.gapVhDesktop
        : plate.gapVh;
      let top = (gapVh / 100) * window.innerHeight + plate.seamRem * rem;
      // OVERRIDE 1 — the seam may not cross a line of text. `about`'s constant is
      // registered to a heading that is `sr-only` (a 1.0px box), so it was placed
      // against nothing and cut straight through the introduction; Selected
      // Systems' lands inside the first register row's title.
      //
      // TEXT LEAVES ONLY. Matching containers instead would count a seam sitting
      // in the padding BETWEEN two register rows as cutting the row, and push the
      // ground down the page for nothing.
      //
      // Iterated to a fixed point rather than a single pass: clearing one element
      // can move the seam into another that sits earlier in document order, which
      // one pass would then miss.
      const leaves: { top: number; bottom: number }[] = [];
      for (const el of block.querySelectorAll<HTMLElement>("*")) {
        if (el.children.length > 0) continue;
        if (!(el.textContent ?? "").trim()) continue;
        const rect = el.getBoundingClientRect();
        if (rect.height < 4) continue;
        leaves.push({ top: rect.top - wrapperTop, bottom: rect.bottom - wrapperTop });
      }
      for (let pass = 0; pass < 6; pass += 1) {
        const hit = leaves.find((l) => top > l.top + 1 && top < l.bottom - 1);
        if (!hit) break;
        top = hit.bottom + SEAM_CLEARANCE_PX;
      }
      // OVERRIDE 2 — a ground with no body left under it is not a ground.
      setSeam({ top, draw: blockBottom - top >= FIELD_MIN_BODY_PX });
    };
    measureSeam();
    const observer = new ResizeObserver(measureSeam);
    observer.observe(block);
    window.addEventListener("resize", measureSeam);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureSeam);
    };
  }, [ref, plate.gapVh, plate.gapVhDesktop, plate.seamRem]);

  return (
    <div
      ref={ref}
      className="relative w-full pt-[var(--drift-gap)] lg:pt-[var(--drift-gap-lg)]"
      style={
        {
          "--drift-gap": `${plate.gapVh}vh`,
          "--drift-gap-lg": `${plate.gapVhDesktop}vh`,
        } as React.CSSProperties
      }
    >
      {/* V11 (§24) -- THE LOWER WORLD STOPS BORROWING THE PROJECT GROUND.
          This was a filled `bg-soft-paper` rectangle: the exact material
          `ProjectPlane` uses, in a region where ProjectPlane's mechanism does not
          exist. A project ground is a surface a composition physically stands on,
          which is why it leads, registers and trails with the scene above it.
          Down here nothing does that, so the same fill could only ever read as
          the motif copied into unrelated editorial sections -- and it was
          measured at 76-86% empty paper.

          What replaces it is not another rectangle and not decoration: it is the
          section's REGISTERED TERRITORY, drawn in the world's own linework.
              - a seam rule at the measured typographic seam, so the register and
                heading overhang it and the body stands on it, exactly as the
                filled version intended but without the fill;
              - a terminating tick at each end of that rule, the same closed-corner
                mark route two's anchors carry, so the territory is bounded rather
                than fading out;
              - one hairline running the field's full height at its leading edge --
                the route continuing down the page THROUGH the section, which is
                the one relationship the lower page actually has to the world above.
          Three marks, all of which state something. No fill, no HUD, no
          coordinates, no telemetry. */}
      {/* V14 (owner finding D): the section field -- seam rule, two
          terminating ticks and a leading hairline -- is no longer drawn. With
          the drift route gone it was the last set of lines in the lower page
          that described the layout rather than the content, and it doubled the
          spine SystemNode already gives every section. The measurement stays
          (`seam`) so the geometry is still known; the drawing is gated off. */}
      {DRAW_FIELDS && (seam === null || seam.draw) && (
        <span
          aria-hidden="true"
          data-drift-field={id}
          className="pointer-events-none absolute hidden lg:block"
          style={{
            left: trackX(field.left),
            width: `calc(${field.span.toFixed(4)} * (100vw - 2 * var(--drift-pad) - var(--drift-w)) + ${measure.toFixed(4)} * var(--drift-w))`,
            top:
              seam === null
                ? `calc(var(--drift-gap-lg, ${plate.gapVh}vh) + ${plate.seamRem}rem)`
                : `${seam.top}px`,
            bottom: "-3rem",
            opacity: driftFieldOpacity(id),
          }}
        >
          {/* the seam */}
          <span className="absolute left-0 right-0 top-0 block h-px bg-ink opacity-[0.34]" />
          {/* its two terminations */}
          <span className="absolute left-0 top-0 block h-2 w-px bg-ink opacity-[0.42]" />
          <span className="absolute right-0 top-0 block h-2 w-px bg-ink opacity-[0.42]" />
          {/* the route, continuing through the section */}
          <span className="absolute bottom-0 left-0 top-0 block w-px bg-ink opacity-[0.12]" />
        </span>
      )}
      <motion.div
        ref={blockRef}
        data-drift-block={id}
        data-drift-plane={section.plane}
        style={
          {
            // V6.1 (§21): each section holds its own measure, derived from its
            // depth. The four blocks are no longer one width with four offsets.
            //
            // The `min()` is load-bearing, not defensive styling: a multiplier above
            // 1 (the `near` plane) applied to a block already at 92vw would push
            // past the viewport on a phone, where the track's free space is only a
            // few pixels. Bounding it against the padded viewport makes overflow
            // impossible at every width by construction -- the same discipline the
            // free-space fraction uses for x.
            width: `min(calc(var(--drift-w) * ${driftMeasure(id)}), calc(100vw - 2 * var(--drift-pad)))`,
            // Reduced motion keeps the composition and drops the movement (§37):
            // the block rests at its mid position -- still an asymmetric, designed
            // placement rather than a centred column. Read only by the media query in
            // styles/globals.css; identical on server and client, so it can never
            // cause a mismatch.
            "--drift-parked": trackX((section.entry + section.exit) / 2),
            "--drift-arm": arm,
            x,
          } as MotionStyle
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
