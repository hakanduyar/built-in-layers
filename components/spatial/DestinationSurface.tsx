"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { PLANE_DEEP, PLANE_DISTANT, type WorldPoint } from "@/lib/spatial/scenes";
import { EXIT_FROM, cameraPosition } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V6.4, restaged in V6.5 (feature/spatial-portfolio-v5, not
// merged to main -- see docs/DESIGN_SYSTEM.md §24 and §25).
// V6.4 §4B/§4C: DESTINATIONS, NOT DECORATION. V6.5 §4/§5: and they are what the
// journey's empty end is made of.
//
// THE PROBLEM THIS SOLVES
//
// V6.3 built a real exit traverse -- 76vw x 110vh of world after Built in Layers,
// more than a viewport diagonally -- and then had nothing to put on it. The V6.3
// report said so honestly and the owner's verdict was the same: too much empty
// travel. The V6.3 answer was two more paper-density fields and two more near-plane
// rules, which is atmosphere, and atmosphere does not answer "why am I travelling".
//
// §4 rules out the obvious wrong fix in advance: no crosses, no fake coordinates,
// no tiny POI marks, no random technical labels, no meaningless geometry. What the
// journey needs is somewhere to be going.
//
// So the traverse now passes two SURFACES THAT ALREADY EXIST further down the
// page. Every word on them is loaded from the same copy module the real sections
// render from -- the same index number, the same heading, the same lines -- so
// these are not previews written for the world, they are the actual destinations
// seen from a distance. When the reader arrives at the real section minutes later,
// it is a thing they have already seen from across the map.
//
// DEPTH DOES THE FORESHADOWING. The nearer surface sits on PLANE_DISTANT and the
// deeper one on PLANE_DEEP (0.44), so the second is genuinely further away rather
// than merely fainter: it answers the camera at less than half the world's rate,
// hangs in frame far longer, and is still resolving while the first has already
// gone. §4C's "not fully readable too early" is therefore a property of where it
// is, not a number tuned to fake it.
//
// ACCESSIBILITY (the brief's duplication rule): every one of these is
// `aria-hidden` and NONE of them uses a heading element. The real <h2> for each
// section exists once, in the section itself, further down the document. A
// screen-reader user encounters each heading exactly once; a sighted user sees the
// destination twice, which is the entire point.

/**
 * The system's three words for how well it currently knows a surface. Declared as
 * plain strings so the vocabulary is in one place and cannot drift, and kept to
 * three because the plate genuinely has three states and no more.
 */
const ACQUISITION = { detected: "Detected", acquired: "Acquired", resolved: "Resolved" } as const;

/** Which of the two staged destinations this is. */
export type DestinationSlot = "near" | "deep";

export type DestinationPreview = {
  /** The section's real index, as the section itself renders it. */
  index: string;
  /** The section's real heading. */
  title: string;
  /** One or two real lines from that section. Kept short deliberately: this is a
   *  surface seen at distance, not the section reproduced. */
  lines: readonly string[];
};

type DestinationSurfaceProps = {
  slot: DestinationSlot;
  preview: DestinationPreview;
  progress: MotionValue<number>;
};

/**
 * V6.5 RESTAGED BOTH, and the reason is a measurement rather than a preference.
 *
 * V6.4 expressed both placements as fractions of `EXIT_TURN - EXIT_FROM` -- the
 * DIAGONAL leg only -- so both destinations had finished resolving before the turn
 * leg even began. Sampling the built page at 120px intervals and measuring rendered
 * ink per frame, that left one continuous run of 1560px (1.73 viewports) in which
 * the frame averaged 2.2% ink: the last 165px of the route, the 900px over which
 * the sticky frame scrolls away carrying an empty last frame, and the gap before
 * the first real section. The world's final composed frame contained nothing.
 *
 * So the windows are now fractions of the WHOLE exit, `1 - EXIT_FROM`, and the
 * deeper surface is framed AT THE ROUTE'S TERMINUS. The last thing the world shows
 * is the destination the page is about to become, and the 900px of hand-over is a
 * full frame leaving rather than an empty one.
 *
 * WHY DEPTH MAKES THIS WORK RATHER THAN OPACITY. On PLANE_DEEP (0.44) a surface
 * answers the camera at less than half the world's rate, so across the exit's
 * 88vw x 160vh of camera travel it moves only ~39vw x 70vh on screen. One object
 * can therefore rise from the bottom edge of the frame at the start of the traverse
 * and still be settling into the upper-middle at the terminus -- present, and
 * genuinely approaching, for the entire journey. On the nearer PLANE_DISTANT (0.62)
 * the same travel is ~99vh of screen, a full viewport, which is why the near
 * surface is passed and left behind rather than arrived at.
 *
 * That difference is the whole §6 rhythm, expressed as two numbers: one destination
 * is overtaken, the other is approached.
 */
const FULL = 1 - EXIT_FROM;

const PLACEMENT: Record<
  DestinationSlot,
  {
    rate: number;
    at: number;
    offset: WorldPoint;
    resolve: [number, number];
    width: number;
    /** Display size of the title, in vw. Authored per slot rather than scaled by
     *  distance: this parallax model moves planes, it does not foreshorten them,
     *  so apparent size has to be a design decision or the far surface reads as
     *  the near one at a lower opacity. */
    titleVw: number;
    /** Opacity at the far end and the near end of its resolve window. */
    fade: [number, number];
    /** Scale at the far end of the window. The surface that is genuinely
     *  approached gets the wider range. */
    from: number;
    /**
     * Height of the plate's leading vertical edge, in vh, and the spacing between
     * its detail lines.
     *
     * THIS IS THE FIX FOR THE LAST OF THE DEAD SCROLL, and it is a compositional
     * decision rather than a trick. The world's sticky frame is one viewport tall,
     * so after the route reaches its terminus there are exactly 900px at 1440x900
     * during which that final frame scrolls away. Whatever the last composition
     * contains is what the reader spends those 900px looking at.
     *
     * A compact plate -- heading plus three tight lines, ~300px tall -- is off the
     * bottom of the screen a third of the way through that, which measured as 2.2%
     * mean ink across the run. A surface the reader has ARRIVED at should be large
     * anyway: it is the nearest thing in the world at that moment. So the arrived-at
     * slot gets a plate edge running most of the frame and its lines spread down it,
     * and the passed slot keeps the compact treatment it always had.
     */
    edgeVh: number;
    lineGap: string;
  }
> = {
  // THE SURFACE THAT IS PASSED. Framed a third of the way along the exit, then
  // carried up and out of the frame by its own faster plane while the camera is
  // still travelling -- so it is left behind rather than dismissed.
  near: {
    rate: PLANE_DISTANT,
    at: EXIT_FROM + FULL * 0.32,
    offset: { x: 38, y: 40 },
    resolve: [EXIT_FROM + FULL * 0.02, EXIT_FROM + FULL * 0.34],
    width: 44,
    titleVw: 4.6,
    // V6.6 raised both ends. The low end is what the plate's EDGE is drawn at
    // before anything identifies it, and V6.5's 0.2 made that edge a smudge; the
    // high end is full presence, which is now safe to reach early because the
    // heading and copy have their own later windows and the plate does not contain
    // a readable section until they arrive.
    fade: [0.4, 1],
    from: 0.965,
    edgeVh: 5,
    lineGap: "0.5rem",
  },
  // THE SURFACE THAT IS ARRIVED AT. Framed at progress 1.0 -- the route's own
  // terminus -- at 22vw / 54vh, which puts it across the LOWER half of the last
  // frame the world shows. Low, not centred, and that is the whole point: the
  // terminus frame is not the end of the reading, it is the start of a 900px
  // hand-over during which it scrolls upward off the screen. A plate centred at the
  // terminus is gone a third of the way through that; a plate in the lower half is
  // still on screen when "Back on the surface" arrives underneath it. Measured, this
  // one placement is worth 360px of the dead run on its own.
  //
  // Because its plane is slow it is already in frame, low and to the right, from the
  // first moments of the traverse.
  deep: {
    rate: PLANE_DEEP,
    at: 1,
    offset: { x: 14, y: 40 },
    resolve: [EXIT_FROM + FULL * 0.22, EXIT_FROM + FULL * 0.94],
    width: 46,
    titleVw: 5,
    fade: [0.32, 1],
    from: 0.9,
    edgeVh: 44,
    lineGap: "2.4rem",
  },
};

export function DestinationSurface({ slot, preview, progress }: DestinationSurfaceProps) {
  const place = PLACEMENT[slot];
  // Same derivation the travel material uses: a mark on a parallax plane does not
  // appear where its world coordinates suggest, so it is placed at
  // rate x cameraPosition(at) + offset, which frames it at the progress it is
  // meant for on whatever plane it lives on.
  const camera = cameraPosition(place.at);
  const left = camera.x * place.rate + place.offset.x;
  const top = camera.y * place.rate + place.offset.y;

  const [from, to] = place.resolve;
  const span = to - from;
  const at = (a: number, b: number) => [from + span * a, from + span * b] as [number, number];

  /**
   * V6.6 -- THE SURFACE RESOLVES BY HIERARCHY, NOT BY FADING IN AS A WHOLE.
   *
   * V6.5 ramped one opacity across the entire plate, which is why the owner read
   * these as "faded copies of sections that will appear later": at distance the
   * frame contained a complete, correctly-typeset section heading and body at 20%
   * opacity, and a ghost of a finished thing is a ghost of a finished thing however
   * it is justified. Depth was doing the placement and opacity was doing all of the
   * perceived distance.
   *
   * V6.6 reveals it in the order a real object resolves at: first the fact that
   * something is THERE -- the registration edge and the section's own number, at
   * near-full contrast almost immediately, because an edge seen at distance is a
   * crisp edge, not a faint one -- then the heading, then the supporting copy. At
   * any moment before the last stage the frame contains a legible object that is
   * simply not yet identified, which is what a destination at distance actually is.
   *
   * The three windows overlap slightly so nothing pops, and none of them is the
   * whole plate.
   */
  // The plate as an object: its marks reach full strength in the first quarter.
  const opacity = useTransform(progress, at(0, 0.26), place.fade);
  /**
   * Whether the plate is PAINTED at all -- the same measured fix the surface cut
   * needed (see SystemsWord's `active` prop).
   *
   * `useTransform` clamps, so before its window each plate sat at `fade[0]` -- a
   * 44vw-wide typeset object at 32-40% opacity, mounted and composited for the
   * entire route including the whole of route one, purely so it could be correct
   * the moment its window arrived. Bucketing frame gaps by scroll position put
   * measurable jank at y1500-2499, which is the occlusion and UNDERNEATH: nowhere
   * near either plate's own window, and exactly where two large always-on layers
   * would cost most.
   *
   * `visibility` rather than opacity, because an opacity-0 layer is still painted.
   */
  const visibility = useTransform(progress, (value) =>
    value > from - 0.02 ? "visible" : "hidden",
  );
  // The same cue a scene uses on arrival, so "coming into resolution" is one
  // language across the whole world rather than two. The arrived-at surface gets a
  // wider range than the passed one, which is the only place apparent size can
  // carry approach in a parallax model that does not foreshorten.
  const scale = useTransform(progress, [from, to], [place.from, 1]);
  // The index resolves with the marks: "05" is registration, not content.
  const index = useTransform(progress, at(0.06, 0.32), [0, 1]);
  // The heading is what identifies the destination, and it arrives second.
  const heading = useTransform(progress, at(0.3, 0.62), [0, 1]);
  // The supporting copy is legible only from close: at distance a surface reads as
  // a plate with a name on it, and the fine print resolves later. That IS the
  // foreshadowing.
  const detail = useTransform(progress, at(0.62, 1), [0, 1]);

  /**
   * V6.7 (JOB 4) -- THE ACQUISITION STATE.
   *
   * The brief asks for the Person-of-Interest influence to arrive through BEHAVIOUR
   * rather than through more technical decoration, and names the mechanic exactly:
   * "a destination is first detected, then resolved".
   *
   * This plate already has three real, distinct states -- its marks are drawn, then
   * its heading resolves, then its supporting copy becomes legible -- because that
   * is how V6.6 made it read as an object at distance instead of a faded duplicate.
   * All that was missing was for the system to SAY which one it is in. So the label
   * is not a status invented to look technical: it is a true description of the
   * plate's own resolution stage, and it changes only because the camera moved.
   *
   * Three words, one per stage, in the registration corner. Nothing counts, nothing
   * ticks, nothing flashes, and there is no second label anywhere on the plate.
   */
  const acquisition = useTransform<number, string>(progress, (value) => {
    const t = span > 0 ? (value - from) / span : 0;
    if (t >= 0.62) return ACQUISITION.resolved;
    if (t >= 0.3) return ACQUISITION.acquired;
    return ACQUISITION.detected;
  });

  return (
    <motion.div
      aria-hidden="true"
      data-destination-surface={slot}
      className="pointer-events-none absolute origin-top-left"
      style={{
        left: `${left}vw`,
        top: `${top}vh`,
        width: `${place.width}vw`,
        opacity,
        scale,
        visibility,
        contain: "paint",
      }}
    >
      {/* The plate's leading edge and registered corner -- the same surface
          language the lower page's own sections stand on (see driftPlate), so a
          destination seen from the world and the same destination arrived at are
          visibly the same kind of object. The vertical edge is the one that
          lengthens for the arrived-at surface: a plate seen close up shows more of
          its own edge, which is also what carries the composition down the frame. */}
      {/* Stage one: the object. Crisper than V6.5's 40% -- an edge seen across a
          distance is a thin edge, not a washed-out one, and this is the mark that
          has to carry the plate on its own while the heading is still absent. */}
      <span className="absolute left-0 top-0 block h-px w-full bg-ink opacity-[0.55]" />
      <span
        className="absolute left-0 top-0 block w-px bg-ink opacity-[0.55]"
        style={{ height: `${place.edgeVh}vh` }}
      />
      {/* The edge's FOOT: review flagged the long leading edge "stopping mid-air
          with no closing rule". A registered line terminates. */}
      <span
        className="absolute left-0 block h-px w-3 bg-ink opacity-40"
        style={{ top: `${place.edgeVh}vh` }}
      />
      {/* The corner register: the world's own resolved form, the same closed mark
          route two's anchors carry. It is what says "this is a coordinate in this
          world" rather than "this is a piece of the page". */}
      <span className="absolute left-1.5 top-1.5 block h-px w-3 bg-ink opacity-40" />

      <div className="pl-6 pt-5">
        <span className="flex items-baseline gap-4">
          <motion.span
            className="block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
            style={{ opacity: index }}
          >
            {preview.index}
          </motion.span>
          {/* The acquisition state rides with the registration marks, not with the
              content: it is what the SYSTEM knows about this surface, so it is
              present from the moment the surface is, and it is the one thing on the
              plate that is legible before the heading is. */}
          <motion.span
            className="block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
            // Shares the INDEX's own resolve window: review caught the state word
            // outliving its index ("a bare DETECTED with no 05"), which read as a
            // broken label rather than a state.
            style={{ opacity: index }}
          >
            {acquisition}
          </motion.span>
        </span>
        <motion.span
          className="mt-3 block font-display leading-[0.92] tracking-[-0.03em] uppercase text-ink"
          style={{ fontSize: `${place.titleVw}vw`, opacity: heading }}
        >
          {preview.title}
        </motion.span>
        <motion.div className="mt-6 flex flex-col" style={{ opacity: detail, gap: place.lineGap }}>
          {preview.lines.map((line) => (
            <span
              key={line}
              // Each line sits on its own short rule, so the spread-out set reads
              // as registered entries on a surface rather than as loosely spaced
              // text. One hairline per line, no numbering added -- the numbers are
              // already in the real content.
              className="relative block max-w-[26rem] border-t border-line pt-2 font-display text-body text-ink-muted"
            >
              {line}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
