"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import {
  ROUTE_TWO_IDS,
  SCENE_IDS,
  sceneAnchor,
  type SceneId,
  type WorldPoint,
} from "@/lib/spatial/scenes";
import {
  EXIT_FROM,
  EXIT_TURN,
  WORK_BRANCH_FROM,
  routeLegs,
  sceneProximity,
  workBranch,
} from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19).
//
// V2's honest remaining weakness was that the space between scenes was
// empty: pacing was right, but there was nothing out there to tell you where
// you had come from or where you were going. This layer answers that WITHOUT
// filling the world with particles or drawing a grid (§10). It is a sparse
// orientation system built from four kinds of mark only:
//
//   1. leg rails       -- the actual camera path, drawn from routeLegs() so
//                         the marks can never describe a route the camera
//                         does not take. Route two is dashed and signal-
//                         coloured, so "you are on a different route now" is
//                         legible without a label.
//   2. residue         -- a rail brightens once the camera has travelled it,
//                         so the path behind you is more present than the
//                         path ahead (§11).
//   3. registration    -- one corner tick per scene anchor, sitting outside
//                         the scene block so it reads as a world coordinate
//                         rather than scene content.
//   4. work branch     -- V6.4. A second route leaving the main one after the
//                         handoff, terminating at the projects that live on the
//                         Work index rather than on this tour (§4A).
//
// V5 also gives marks on route two their RESOLVED form (§25): the same two
// strokes, longer and closed by a second inset mark. One design system in two
// states, never two themes.
//
// V6.4 REMOVED THE WALL GRAMMAR: the boundary rule, its five converging rules,
// the contact registration and the two deregistering brackets -- roughly a third
// of this file. All four existed to make the camera's arrival at the end of route
// one read as running into something, and the collision is retired. They are
// deleted rather than quietened, because a boundary drawn faintly is still a
// boundary, and the occlusion cut is not supposed to have anything to hit.
//
// Every mark here is decorative and aria-hidden (§24). Nothing in this file
// carries information that is not already stated in real semantic text.

type WorldGrammarProps = {
  progress: MotionValue<number>;
  mobile: boolean;
  /**
   * Real project titles the work branch points at. Empty disables the branch
   * entirely -- which is how mobile gets it: the branch is the one piece of world
   * grammar with genuine horizontal extent, and mobile's route has none yet.
   * A staging decision, not a geometric one; `workBranch()` already takes a
   * `mobile` argument and derives correctly for a route with x travel.
   */
  branchDestinations?: readonly string[];
};

export function WorldGrammar({ progress, mobile, branchDestinations = [] }: WorldGrammarProps) {
  const legs = routeLegs(mobile);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
      {legs.map((leg, index) => (
        <RouteRail key={index} leg={leg} progress={progress} />
      ))}

      {branchDestinations.length > 0 && (
        <WorkBranch progress={progress} destinations={branchDestinations} />
      )}

      {SCENE_IDS.map((id) => (
        <RegistrationTick
          key={id}
          at={sceneAnchor(id, mobile)}
          // §25: after the reposition the same grammar is held more strictly.
          // A route-two anchor is only ever seen after the break, so its mark
          // is the resolved form -- a closed corner rather than an open tick.
          strict={ROUTE_TWO_IDS.some((routeTwoId) => routeTwoId === id)}
          // V6.1 (§16): "a nearby registration mark may stabilise" as a project
          // is approached. The mark reads its OWN scene's proximity, so a
          // coordinate resolves as the system acquires the thing standing at it
          // and relaxes again once the camera has moved on.
          id={id}
          progress={progress}
          mobile={mobile}
        />
      ))}
    </div>
  );
}

/**
 * One travel leg, drawn as a POLYLINE sampled from the camera curve itself
 * rather than as a straight chord between anchors. V4's route is a spline, so
 * a straight rail would diverge from the path it claims to describe; sampling
 * keeps the world's orientation system literally true.
 *
 * `preserveAspectRatio="none"` lets the box stretch to the leg's exact
 * (non-uniform: vw by vh) geometry, and `non-scaling-stroke` keeps the line a
 * hairline regardless of that stretch.
 */
function RouteRail({
  leg,
  progress,
}: {
  leg: ReturnType<typeof routeLegs>[number];
  progress: MotionValue<number>;
}) {
  // Route residue: faint ahead of the camera, brighter once travelled.
  const opacity = useTransform(
    progress,
    [leg.fromProgress, leg.toProgress],
    leg.route === 1 ? [0.08, 0.2] : [0.18, 0.4],
  );

  const xs = leg.points.map((point) => point.x);
  const ys = leg.points.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const width = Math.max(...xs) - left;
  const height = Math.max(...ys) - top;
  const tone = leg.route === 1 ? "text-ink" : "text-signal";

  // Mobile legs are purely vertical, so there is no diagonal to draw and the
  // zero-width SVG box would collapse. The same rail becomes a plain
  // vertical hairline -- same grammar, different choreography.
  if (width < 1) {
    return (
      <motion.div
        className={`absolute w-px ${leg.route === 1 ? "bg-ink" : "bg-signal"}`}
        style={{ left: `${left}vw`, top: `${top}vh`, height: `${height}vh`, opacity }}
      />
    );
  }

  const points = leg.points
    .map((point) => `${((point.x - left) / width) * 100},${((point.y - top) / height) * 100}`)
    .join(" ");

  return (
    <motion.svg
      className={`absolute ${tone}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        left: `${left}vw`,
        top: `${top}vh`,
        width: `${width}vw`,
        height: `${height}vh`,
        opacity,
      }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        strokeDasharray={leg.route === 2 ? "7 9" : undefined}
      />
    </motion.svg>
  );
}

/**
 * A corner tick registering a scene's anchor in the world. Offset up and left
 * of the scene block so it never sits on top of scene content.
 *
 * `strict` is the post-collision form (§25): the same two strokes, drawn
 * longer, at higher contrast, and closed by a short second mark inset from the
 * corner. The world has not changed theme -- it is being measured more
 * carefully.
 */
function RegistrationTick({
  at,
  id,
  progress,
  mobile,
  strict = false,
}: {
  at: WorldPoint;
  id: SceneId;
  progress: MotionValue<number>;
  mobile: boolean;
  strict?: boolean;
}) {
  const arm = strict ? "w-10" : "w-7";
  const drop = strict ? "h-10" : "h-7";

  // V6.1: dormant -> resolved, on this scene's own proximity. Dormant is well
  // below V6's flat value, so the difference between "a coordinate exists here"
  // and "the system has this coordinate" is visible; resolved lands slightly
  // above it, so acquisition reads as the mark firming up rather than lighting
  // up.
  const settled = strict ? 0.6 : 0.46;
  const opacity = useTransform(progress, (value) => {
    const near = sceneProximity(id, value, mobile);
    // V6.8: dormant floor lowered 0.13 -> 0.07. At 0.13 a tick whose scene is
    // entirely out of frame still read as an orphaned mark floating in travel
    // space (review flagged it in three consecutive frames); at 0.07 it is
    // present on inspection and silent otherwise, and the acquisition swell is
    // correspondingly larger.
    return 0.07 + (settled - 0.07) * Math.max(0, near);
  });

  return (
    <motion.div
      className="absolute"
      style={{ left: `${at.x - 1.6}vw`, top: `${at.y - 4.5}vh`, opacity }}
    >
      <span className={`absolute left-0 top-0 block h-px ${arm} bg-ink`} />
      <span className={`absolute left-0 top-0 block w-px ${drop} bg-ink`} />
      {strict && <span className="absolute left-1.5 top-1.5 block h-px w-3 bg-ink" />}
    </motion.div>
  );
}

/* ---------------------------------------------------- the work-route junction */

/**
 * V6.4 (§4A) -- THE WORK-ROUTE JUNCTION.
 *
 * The `handoff` scene already states, in real copy, that Kıvılcım and DropSpot are
 * "two stops on a larger map" and that the other projects "continue on the full
 * Work index". Through V6.3 that was the only genuinely spatial claim on the page
 * that the space itself did not make: the world drew every other relationship it
 * had -- routes, depth, arrival, residue -- as geometry, and drew this one as a
 * paragraph.
 *
 * So a second route leaves the main one just past the handoff and goes somewhere
 * the camera does not. Its geometry comes from `workBranch()`, which measures the
 * divergence off the MAIN ROUTE'S OWN BEARING, so it cannot describe an angle the
 * world does not have.
 *
 * IT IS DRAWN AS A ROUTE THAT IS NOT TAKEN, and every difference from the rails
 * says so rather than being decoration: a finer dash than either main route, ink
 * rather than the signal tone route two owns, lower opacity, and it stops at a
 * terminus mark instead of continuing off-frame. The reading is "this exists, and
 * it is not where we are going", which is exactly what the copy says.
 *
 * WHAT IT IS NOT (§4A, verbatim): a subway map, a HUD, a status panel, invented
 * coordinates, or a fake status. Two legs, one junction dot, one terminus mark,
 * and three real names loaded from real content.
 *
 * ACCESSIBILITY: aria-hidden, and NOT a link. The handoff scene a few hundred
 * pixels away already names all of these projects in real prose and carries the
 * only "See every system" link to /work. A second focusable route to the same
 * place would be duplicate navigation for keyboard and screen-reader users, which
 * is the one thing the brief's accessibility rule forbids outright.
 */
function WorkBranch({
  progress,
  destinations,
}: {
  progress: MotionValue<number>;
  destinations: readonly string[];
}) {
  const points = workBranch();
  const junction = points[0]!;
  const terminus = points[points.length - 1]!;

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const width = Math.max(...xs) - left;
  const height = Math.max(...ys) - top;

  // Arrives with the scene that states it, is fully present at the junction, and
  // stays behind as residue -- the same "the path behind you is more present"
  // logic the rails use, so the branch belongs to the same world.
  const opacity = useTransform(
    progress,
    [EXIT_FROM - 0.05, WORK_BRANCH_FROM, EXIT_TURN, 1],
    [0, 1, 0.9, 0.55],
  );

  const polyline = points
    .map((point) => `${((point.x - left) / width) * 100},${((point.y - top) / height) * 100}`)
    .join(" ");

  return (
    <motion.div className="absolute left-0 top-0" style={{ opacity }}>
      <svg
        aria-hidden="true"
        className="absolute text-ink"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          left: `${left}vw`,
          top: `${top}vh`,
          width: `${width}vw`,
          height: `${height}vh`,
          // V6.6 (§2/JOB 2): 0.42 -> 0.52. The branch was reading as an annotation
          // rather than as a route the journey declines to take. Everything in this
          // component moves in the same direction by roughly the same amount --
          // the brief asks for 10-20% more perceptual authority, not a redesign --
          // and the dash pattern, the ink tone and the terminus stop are all
          // unchanged, so it still reads as "not the route we are on".
          opacity: 0.52,
        }}
      >
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          strokeDasharray="3 7"
        />
      </svg>

      {/* The junction itself: an open node on the main route, at the exact
          coordinate the branch leaves it. */}
      <span
        aria-hidden="true"
        className="absolute block h-2 w-2 rounded-full border border-ink opacity-[0.62]"
        style={{ left: `${junction.x}vw`, top: `${junction.y}vh`, marginLeft: -4, marginTop: -4 }}
      />

      {/* The terminus: a closed corner -- the world's resolved registration form,
          the same mark route two's anchors carry -- and the real names.
          V6.6 lengthens the arms 8 -> 10 and closes the corner with the same inset
          second mark the strict registration ticks use, so the terminus is a
          finished coordinate rather than an open bracket. */}
      <span
        aria-hidden="true"
        className="absolute block"
        style={{ left: `${terminus.x}vw`, top: `${terminus.y}vh` }}
      >
        <span className="absolute left-0 top-0 block h-px w-10 bg-ink opacity-[0.66]" />
        <span className="absolute left-0 top-0 block h-10 w-px bg-ink opacity-[0.66]" />
        <span className="absolute left-1.5 top-1.5 block h-px w-3 bg-ink opacity-40" />
        <span className="absolute left-2 top-5 flex flex-col gap-1.5 whitespace-nowrap">
          {destinations.map((destination) => (
            <span
              key={destination}
              aria-hidden="true"
              // Ink at 0.78 rather than the muted token: the names are the only
              // reason the branch exists, and at `text-ink-muted` under a 0.42
              // container they were the faintest text in the world.
              className="block font-mono text-mono-label tracking-mono-label uppercase text-ink opacity-[0.78]"
            >
              {destination}
            </span>
          ))}
        </span>
      </span>
    </motion.div>
  );
}
