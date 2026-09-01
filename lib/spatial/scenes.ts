// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Scene DATA only: where each scene lives in
// the world. No JSX, no camera math, and -- new in V4 -- no authored
// progress values either.
//
// V3 authored `focus` and `holdUntil` per scene, which made scene focus a
// literal zero-velocity camera plateau. Measured under natural wheel input,
// V3's camera resolved to 29 distinct positions across 900 frames, its median
// response was 0.00 camera px per scroll px, and 1276px of scrolling could
// pass with the camera moving under 8px -- then burst at 24x the local rate.
// That is the stop/go the owner reported.
//
// In V4 progress is DERIVED from route geometry (see sceneRoute.ts): each
// segment is allocated scroll in proportion to how far it travels plus a
// fixed reading allowance, and focus is expressed as a velocity minimum
// rather than a stop. Anchors below stay authoritative -- the camera curve
// still passes exactly through every one of them.

export type SceneId =
  | "hero"
  | "software-factory"
  | "kivilcim"
  | "jointledger"
  | "dropspot"
  | "tail"
  | "reorient"
  | "approach"
  | "handoff";

export type WorldPoint = { x: number; y: number };

export type SceneConfig = {
  id: SceneId;
  /** Desktop world anchor, in vw/vh. The camera curve passes through this. */
  world: WorldPoint;
  /**
   * Mobile world anchor. x is always 0 -- "same world, different camera
   * choreography": a large diagonal at 375px costs readability and buys
   * nothing, and aggressive parallax there risks motion sickness.
   */
  mobileWorld: WorldPoint;
};

// Scene block geometry, shared by the camera (for framing) and the scene
// components themselves (for sizing) so the two can never drift apart.
export const SCENE_WIDTH = "min(84vw, 1180px)";
export const SCENE_WIDTH_MOBILE = "92vw";
export const SCENE_MIN_HEIGHT = "72vh";

/** Inset of the world layer inside the sticky viewport, so a focal scene
 *  lands comfortably framed rather than flush against the edges. */
const INSET_LEFT_VW = 8;
const INSET_TOP_VH = 14;
const INSET_LEFT_VW_MOBILE = 4;
const INSET_TOP_VH_MOBILE = 10;

/**
 * FINAL REMEDIATION -- wide-viewport anchoring. The inset was a plain 8vw: at
 * the owner's real ~2552px CSS display that parked the px-capped scenes against
 * the viewport's left edge while the lower page's sections centred in their
 * 1320px container -- two different grids on one page, and a ~1100px dead right
 * field on every scene (the review's recurring complaint). The inset now clamps
 * to the container's own left margin, `calc(50vw - 660px)` (660 = half the
 * 1320px --container-max): identical to 8vw at every viewport up to ~1571px --
 * the approved 1440 frames are pixel-untouched -- and at wider viewports the
 * whole world (scenes, rails, planes, material all derive from this) shares the
 * lower page's grid instead of hugging the frame edge.
 */
export const CAMERA_INSET = {
  left: `max(${INSET_LEFT_VW}vw, calc(50vw - 660px))`,
  top: `${INSET_TOP_VH}vh`,
};
export const CAMERA_INSET_MOBILE = {
  left: `${INSET_LEFT_VW_MOBILE}vw`,
  top: `${INSET_TOP_VH_MOBILE}vh`,
};

/**
 * Nominal viewport aspect used to convert world units (vw for x, vh for y)
 * into one screen-space measure. Route geometry is deliberately expressed in
 * mixed units so scenes stay proportional to the viewport, but anything that
 * measures DISTANCE along the route -- which is now what allocates scroll --
 * needs a single ratio. 1.6 is 1440x900 exactly.
 */
export const VW_PER_VH = 1.6;

/**
 * ROUTE ONE -- the evidence region, descending left-to-right.
 * ROUTE TWO -- the thinking region, reached only through the break, starting
 * at the world's deepest and left-most point and climbing back up and right.
 *
 * Unchanged from V3: the route was reviewed as correct, and §6 of the V4
 * brief requires the curve to still travel through these scenes.
 */
/**
 * V7 (OWNER REORDER) — route one carries FOUR project scenes in the
 * owner-required sequence: Software Factory → Kıvılcım → JointLedger →
 * DropSpot. Three rules governed the new anchors:
 *
 *   1. CONSECUTIVE SCENES DO NOT SHARE FRAME REAL ESTATE AT FOCUS. A first
 *      pass divided the old hero→tail diagonal among four scenes; at that
 *      spacing the 84vw scene blocks physically overlapped, and Kıvılcım's
 *      departing plate sat across JointLedger's acquisition frame. The legs
 *      are now ~176 screen units — enough that a focused scene owns its
 *      frame while its neighbours read as world, not as intrusion.
 *   2. Route one therefore EXTENDS (tail moves from 322,244 to 468,330) and
 *      the cut keeps its exact tail-relative offset (+30,+24) — while ROUTE
 *      TWO DOES NOT MOVE AT ALL: every reorient/approach/handoff/traverse/
 *      descent coordinate, bearing and leg length is byte-identical to the
 *      long-tuned V6.x choreography. The reposition crosses a longer gap,
 *      and that gap is crossed inside the occlusion, where distance is
 *      invisible by design. Depth narrative holds: reorient (y 452) is still
 *      the world's lowest point, below the deepened tail (y 330).
 *   3. The bearing stays the approved diagonal (~34° screen) the whole way.
 *
 * Mobile keeps the vertical route with the same two extra stops: 130vh per
 * scene, cut at tail+78 exactly as before, route two below it untouched.
 */
/**
 * V11 (§4, §5, §6, §10) -- THE STEP IS DERIVED FROM FOCUS ISOLATION.
 *
 * THE MEASURED FAILURE. At every one of 1366/1440/1536/1920/2560, at every one
 * of the five primary destinations, a NEIGHBOURING primary scene was inside the
 * viewport at the active scene's own focus -- overlapping by 2,079px^2 at best
 * and 334,219px^2 at worst, with DropSpot and SYSTEMS measuring a clear gap of
 * exactly 0 at every viewport. The sequence was glued together, and no amount of
 * opacity or visibility work could fix it because the WORLD was too small.
 *
 * THE POLICY, and why 155 is not a magic number. At focus the active scene's ink
 * starts at the camera inset L and the next scene's ink starts one step later,
 * so isolation requires
 *
 *     stepPx  >=  viewportWidth - L + safetyMargin
 *
 * and stepPx = STEP_VW x worldUnitPx x fit. Solving that at each tested viewport
 * with a 10%-of-viewport safety margin, using the L and fit measured on the
 * built page:
 *
 *     1366x768   L=259  fit 0.740   ->  STEP_VW >= 123.1
 *     1440x900   L=197  fit 0.865   ->  STEP_VW >= 111.3
 *     1536x864   L=233  fit 0.831   ->  STEP_VW >= 121.8
 *     1920x1080  L=301  fit 1.000   ->  STEP_VW >= 125.8
 *     2560x1440  L=620  fit 1.000   ->  STEP_VW >= 152.5
 *
 * 2560 is the binding case, because CAMERA_INSET centres the world in the
 * 1320px container there (L = 50vw - 660 = 620) while the world unit is capped
 * at 14.4px. 155 satisfies every row with margin in hand, and it is ONE policy
 * rather than five offsets: narrow viewports are not compressed, because the
 * requirement is solved at each of them rather than at a design width.
 *
 * The bearing is preserved exactly: 106/155 = 0.684 against the previous
 * 66/96 = 0.6875, so the approved ~34-degree diagonal is unchanged.
 *
 * SYSTEMS GETS A FULL STEP. It used to sit 84vw after DropSpot -- a short hop --
 * which is why it measured a zero gap and 66k-224k px^2 of intrusion at its own
 * focus. It is a primary destination (§10) and is now spaced like one.
 *
 * ROUTE TWO IS TRANSLATED, NOT RESHAPED. Every reorient/approach/handoff bearing
 * and leg length is byte-identical to the long-tuned V6.x choreography; the
 * whole run simply moves down by 200vh so that `reorient` stays 122vh below the
 * deepened `tail` and remains the world's lowest point, exactly as before.
 *
 * Mobile anchors are untouched: mobile is a vertical route where no two scenes
 * share a frame, so it never had this failure (§29).
 */
export const SCENES: readonly SceneConfig[] = [
  { id: "hero", world: { x: 0, y: 0 }, mobileWorld: { x: 0, y: 0 } },
  { id: "software-factory", world: { x: 155, y: 106 }, mobileWorld: { x: 0, y: 130 } },
  { id: "kivilcim", world: { x: 310, y: 212 }, mobileWorld: { x: 0, y: 260 } },
  { id: "jointledger", world: { x: 465, y: 318 }, mobileWorld: { x: 0, y: 390 } },
  { id: "dropspot", world: { x: 620, y: 424 }, mobileWorld: { x: 0, y: 520 } },
  { id: "tail", world: { x: 775, y: 530 }, mobileWorld: { x: 0, y: 650 } },
  { id: "reorient", world: { x: -14, y: 652 }, mobileWorld: { x: 0, y: 748 } },
  { id: "approach", world: { x: 132, y: 586 }, mobileWorld: { x: 0, y: 876 } },
  { id: "handoff", world: { x: 264, y: 548 }, mobileWorld: { x: 0, y: 1000 } },
] as const;

export const SCENE_IDS: readonly SceneId[] = SCENES.map((scene) => scene.id);

export const ROUTE_ONE_IDS = [
  "hero",
  "software-factory",
  "kivilcim",
  "jointledger",
  "dropspot",
  "tail",
] as const;
export const ROUTE_TWO_IDS = ["reorient", "approach", "handoff"] as const;

/**
 * V6.7 (JOB 1) -- THE ACQUISITION DESCENT.
 *
 * A camera-only coordinate directly below the hero, in exactly the sense CUT_WORLD
 * and TURN_WORLD are camera-only: the route passes through it, no scene stands
 * at it.
 *
 * THE PROBLEM. Through V6.6 the route left the hero on the hero->Kivilcim bearing
 * immediately -- 24.1 degrees, diagonal from the very first pixel of scroll. There
 * was no moment in which the world moved before it committed to a direction, so the
 * opening read as "a diagonal page" rather than as a system that looks, then departs.
 *
 * The fix is one point, and the curve does the rest. Because the spline reflects its
 * start tangent, the camera leaves the hero travelling STRAIGHT DOWN; because the
 * tangent at this point is derived from its neighbours (the hero and Kivilcim), the
 * leg then bends into the diagonal on its own. The choreography the brief asks for --
 * acquisition, short vertical descent, commitment to the diagonal -- is therefore the
 * literal shape of the curve rather than three effects sequenced to imply it.
 *
 * Kept deliberately short, and weighted as TRAVEL rather than as reading time (see
 * ENTRY_SEGMENTS in sceneRoute.ts), so the opening is a beat and not a scroll.
 *
 * Mobile takes the same beat; its route is vertical throughout, so this simply makes
 * the first move a measured one there too.
 */
// V11: scaled with the route step (42 x 155/96), so the acquisition descent
// keeps its proportion of the first leg.
export const ENTRY_WORLD: WorldPoint = { x: 0, y: 68 };
export const ENTRY_MOBILE_WORLD: WorldPoint = { x: 0, y: 52 };

/**
 * THE EXIT TRAVERSE (V6.3, §4-5; kept unchanged by V6.4, §3). Two camera-only
 * coordinates after `handoff`, in exactly the sense CUT_WORLD is camera-only:
 * the route passes through them, no scene stands at them.
 *
 * V6.4 KEEPS THIS GEOMETRY EXACTLY. The owner's reading is that the leg is
 * directionally correct and that the problem was never its length -- it was that
 * the journey along it carried almost no information. So the answer is what
 * TRAVELS the leg (§4: a work-route junction and two foreshadowed destinations),
 * not a shorter leg.
 *
 * WHY THE ROUTE HAD TO GROW
 *
 * Through V6.2 the world simply ENDED at `handoff` and the page dropped into
 * ordinary downward scrolling one section later. The owner's reading of that was
 * exact: after Built in Layers the site "begins descending too directly", and the
 * lower half then reads as a normal editorial page with a zigzag drawn beside it.
 * No amount of work on the lower sections could fix it, because the problem was
 * that there was no travel between the world and them -- the transition from
 * "inside a space" to "reading a page" happened in the gap between two DOM nodes.
 *
 * So the camera now leaves `handoff` on a real leg. `traverse` is placed
 * down-and-right at a screen bearing of almost exactly 45 degrees, and `descent`
 * turns that travel toward vertical, so the world hands over to the lower page
 * already moving in the lower page's own direction rather than stopping and being
 * replaced.
 *
 * MEASURED (tests/unit/spatial-route.test.ts asserts all three): the traverse leg
 * covers 76vw x 110vh of world -- more than one viewport diagonally at 1440x900 --
 * at a mean screen bearing of ~44 degrees, and the leg that follows it turns to
 * ~70 degrees. It is not a bend in an existing leg; it is a third of route two.
 *
 * Mobile keeps x at 0 like every other mobile anchor: the same route, taken by a
 * camera that only ever descends (§30).
 */
// V8 (§3) DELETED `TRAVERSE_WORLD`, the 76vw x 110vh diagonal that stood here.
// Everything above is the reason it existed and the reason it no longer can:
// the leg was long, and the ONLY things on it were the two destination surfaces
// previewing Selected Systems and How I Build. With those previews removed as
// the owner's rejected early duplicates, the leg carried 167.2 screen units of
// world and 46vh of the reader's scroll containing nothing at all -- which is
// precisely the dead scroll §3 forbids leaving behind. Deleting the previews and
// keeping their diagonal would have been the worst of both.
//
// What survives is the leg that was doing a job independent of them: the TURN.

/**
 * V6.5 SHORTENED THE TURN, AND ONLY THE TURN: {358, 550} -> {352, 508}.
 *
 * §3 of the V6.5 brief keeps the diagonal journey at full length and §7 lists the
 * diagonal route concept among the decisions to preserve, so the diagonal leg is
 * untouched -- 76vw x 110vh, 167.6 screen units, exactly as V6.3 authored it and
 * V6.4 kept it. What is cut is the leg AFTER it.
 *
 * That leg's job is to change direction: it takes the camera from a 42-degree
 * descent to a ~70-degree one so the world hands over to the lower page already
 * moving in the lower page's own direction. Measured, V6.4 spent 96.4 screen units
 * and 26.7vh of the reader's scroll doing that, through world containing nothing
 * whatsoever -- the destination surfaces had both resolved before it started.
 *
 * A direction change does not need 96 units. At 12vw x 50vh the leg is 53.5 units
 * long and turns to 69.0 degrees: the same handover, 44% less empty travel. The
 * bearing is what the leg is for, and the bearing is preserved to within 1.5
 * degrees; the distance was only ever the cost of it.
 */
/**
 * THE HANDOVER TURN -- the whole of the exit, since V8.
 *
 * One camera-only coordinate after `handoff`, in the same sense CUT_WORLD is
 * camera-only: the route passes through it, no scene stands at it.
 *
 * ITS JOB, which is the one thing the old two-leg exit did that had nothing to
 * do with the deleted previews: the world must not stop and be replaced by the
 * lower page, it must hand over ALREADY MOVING IN THE LOWER PAGE'S OWN
 * DIRECTION. Route two climbs (its handoff leg runs at ~16 degrees); the lower
 * page descends. Something has to turn the camera through that, and a bend in an
 * existing leg cannot -- route two's last leg is the one that frames `handoff`,
 * and re-aiming it would drag the scene's own framing with it.
 *
 * SIZED AS A BEARING CHANGE, NOT AS A JOURNEY. V6.5 already established that a
 * direction change costs about 55 screen units, when it cut the old turn leg
 * from 96.4 to 55.0 for exactly that reason and lost 1.5 degrees of bearing
 * doing it. That measurement is what this leg is built on: at +14vw / +52vh it
 * runs 57.4 units at a mean screen bearing of ~66.7 degrees -- the same handover
 * the two-leg exit performed, with the 167 empty units in front of it gone.
 *
 * Net: the exit falls from 222.1 screen units to 57.4, and the reader's scroll
 * through it falls from 61.4vh to ~16vh. The journey is tighter by exactly the
 * amount that had nothing in it.
 */
// V11: translated with route two (+200vh); its bearing and length are unchanged.
export const TURN_WORLD: WorldPoint = { x: 292, y: 624 };
/** Mobile has no bearing to turn -- its route is vertical throughout (§30) --
 *  so this is purely the handover run, cut in the same proportion as the desktop
 *  exit: 176vh of travel behind two deleted previews becomes 58vh. */
export const TURN_MOBILE_WORLD: WorldPoint = { x: 0, y: 1058 };

/**
 * Where route one ends and the occlusion cut happens. A camera-only
 * coordinate, not a scene.
 *
 * V6.4 RETIRED THE COLLISION. Through V6.3 this was `COLLISION_WORLD`: a wall the
 * camera ran into, stopped dead at, and rebounded off. The owner's verdict on
 * that whole concept is that the experiment is finished -- so the wall, the
 * rebound, the impact window, the shock and the recoil are all gone, and what
 * survives is the part that was always wanted: the black geometric surfaces.
 *
 * They are now what they always looked like they were: an OCCLUSION CUT. The
 * camera travels to this coordinate at full travelling speed, the surfaces close
 * over it, the route is changed while the frame is genuinely opaque, and the
 * surfaces open again on route two. Nothing is hit and nothing bounces; the view
 * is briefly interrupted and resumes somewhere else.
 *
 * The coordinate itself is unchanged, because route one's geometry was never the
 * problem.
 */
// V11: keeps its exact tail-relative offset, scaled with the step (+48,+33).
export const CUT_WORLD: WorldPoint = { x: 823, y: 563 };
export const CUT_MOBILE_WORLD: WorldPoint = { x: 0, y: 728 };

/**
 * Break panel timing, relative to the cut.
 *
 * V6.4 widened both, and could afford to. Through V6.3 the cut sat at the far end
 * of a 0.062-wide impact window in which the camera did not advance along the
 * route at all, so the whole event -- approach, hold, rebound, close, dwell,
 * open -- had to be squeezed either side of it. With the impact window gone that
 * progress is returned to the occlusion itself, which is the only thing left in
 * this region and therefore the thing worth giving room to.
 *
 * The sequence these three numbers describe, in order, is exactly the one the
 * V6.4 brief asks for:
 *
 *   world visible        p < BREAK_CUT - BREAK_COVER_LEAD
 *   surfaces close       BREAK_COVER_LEAD before the cut
 *   full black           BREAK_DWELL either side of it
 *   surfaces open        BREAK_REVEAL_TAIL after it
 *   redirected world     p > BREAK_CUT + BREAK_REVEAL_TAIL
 *
 * The opening is deliberately longer than the closing. Closing is an
 * interruption and should be decisive; opening is a reveal of somewhere new and
 * is the half the reader is actually reading.
 */
export const BREAK_COVER_LEAD = 0.03;
export const BREAK_REVEAL_TAIL = 0.034;

/**
 * Progress before the cover begins at which the protected window opens.
 *
 * Small, and smaller than V6.3's, because there is no longer an approach
 * choreography to protect -- only the occlusion. It exists so that the guarded
 * window starts on VISIBLE WORLD rather than on the first frame of ink: a
 * protected event that begins already black cannot show the reader what is being
 * occluded.
 */
export const BREAK_GUARD_LEAD = 0.014;

/**
 * V6.1: full, opaque cover is held for this much progress either side of the
 * cut, and ONLY there.
 *
 * The V6 rails ran `(1 - t) ** speed`, whose derivative at t=0 is -speed: they
 * moved fastest at the very start of the cover window, so measured 6% into that
 * window there was already ~121px of solid ink on both frame edges. Black was
 * therefore at near-full mass for the whole window, which is exactly the
 * reported percept -- "large black rectangles entering the viewport" rather than
 * an impact.
 *
 * V6.1 inverts the curve (see breakBandOffset) so the rails hang off-frame and
 * snap shut late. That alone would leave the fully-covered state
 * instantaneous, which is both worse to look at and untestable, so the closed
 * state is given this explicit dwell.
 *
 * V6.4 raised it 0.007 -> 0.011. The brief asks for a "controlled full-black
 * moment" as a named beat of the sequence rather than as the instant between
 * closing and opening, and 0.007 was sized when this window was competing with an
 * impact for the same progress. It is not competing with anything now. At the
 * guard's fixed playback that is ~185ms of genuine full cover -- long enough to
 * register as a held state, short enough that it never becomes a pause.
 */
export const BREAK_DWELL = 0.011;

/**
 * Horizontal rails the break is built from.
 *
 * V6.1 raised this from 7 to 11. Total ink area at full cover is identical --
 * it is a full frame either way -- but at 7 bands each rail is ~128px tall at
 * 900px, and a partly-closed set of 128px full-width blocks reads as exactly
 * what the owner reported: rectangles. At 11 the same closing motion is made of
 * ~82px structural bands, which reads as a coordinate system shuttering rather
 * than as blocks sliding over the page.
 *
 * V6.4 keeps the geometry exactly. It is the one part of this region the owner
 * asked to preserve, and with the collision gone it is no longer the secondary
 * event standing next to a hit -- it is the whole event.
 */
export const SCENE_BREAK_BANDS = 11;

/**
 * Reading allowance added to every segment's scroll weight, in vh-equivalent
 * screen units. This is what buys time at a scene now that no scene parks the
 * camera: a segment gets scroll proportional to (distance travelled +
 * allowance), and the velocity profile spends that allowance at the two ends,
 * where a scene is framed.
 */
export const FOCUS_ALLOWANCE = 74;

/**
 * V9 (§4) -- READING ALLOWANCE PER SCENE, BECAUSE SCENES ARE NOT EQUALLY DENSE.
 *
 * THE MEASURED COMPLAINT. The owner's reading of the V8 build was that the four
 * projects "pass relatively quickly, while the lower-page sections occupy much
 * more perceived time". Measured against the real progress allocation, that is
 * exactly what the route was doing:
 *
 *   software-factory  74.7vh      reorient   76.6vh
 *   kivilcim          64.7vh      approach   81.2vh
 *   jointledger       64.6vh      handoff    69.4vh
 *   dropspot          62.3vh
 *
 * Route two's THREE statement scenes owned 227.2vh against the four projects'
 * 266.3vh. A project scene carries a title, a category, a description, a
 * metadata row and a plate of real evidence; `reorient` carries one word and one
 * sentence. Paying them the same reading allowance is what made the evidence
 * feel like scenery on the way to the page.
 *
 * THE FIX IS THE ALLOWANCE, NOT THE GOVERNOR. §14 of the brief is explicit that
 * the scroll-speed ceiling stays exactly as it is, and it does: `ROUTE_MAX_RATE`
 * and `useRouteGovernor` are untouched. What changes is how the route's fixed
 * scroll budget is DIVIDED -- reading allowance is time to read, so a scene with
 * more to read gets more of it. Nothing is snapped, nothing is held, and the
 * reader can still move slower or faster within the ceiling exactly as before.
 *
 * A segment takes the LARGER of the allowances of the two anchors it joins, not
 * their average: the segment between DropSpot and the SYSTEMS beat is where
 * DropSpot's evidence is still being read on the way out, so it is paid at
 * DropSpot's rate rather than diluted to the midpoint.
 *
 * MEASURED RESULT, and the ceiling that stopped it going further:
 *
 *   four projects      266.3vh -> 285.9vh
 *   route two's three  227.2vh -> 207.6vh
 *   ratio              1.17    -> 1.38
 *
 * The values below are the largest that keep EVERY standing route contract. They
 * were found by raising them until the contracts failed, and the failures are
 * worth recording because they are the honest bound on this lever rather than a
 * matter of taste: at project allowances near 140 the world broke its 8%
 * frame-to-frame speed ceiling at the exit join, route two exceeded its
 * "comparable speed to route one" bound at 1.42x against 1.35, and the exit leg
 * became more expensive to scroll than the cheapest scene leg. Reading allowance
 * is a redistribution of a fixed budget, so past a point taking more for the
 * projects does not slow them down — it speeds everything else up until the
 * world stops being one continuous camera.
 *
 * The rest of the §4 complaint is answered by shortening what comes after the
 * projects rather than by stretching the projects: see the dead-run removal in
 * SpatialExperience's SurfaceReturn and the Field Notes footprint fix.
 */
export const SCENE_ALLOWANCE: Partial<Record<SceneId, number>> = {
  // Four project scenes: title + category + description + metadata + evidence.
  "software-factory": 124,
  kivilcim: 116,
  jointledger: 116,
  dropspot: 116,
  // The opening. Keeps the standard rate: it is a composition to take in, but
  // the acquisition descent that follows already carries its own allowance.
  hero: 74,
  // A single expressive word opening on a surface. A beat, not a read.
  tail: 64,
  // UNDERNEATH plus the one approved supporting statement.
  reorient: 72,
  // Built in Layers: a heading and three real definitions -- genuinely more to
  // read than anything else on route two, and the only scene there paid above
  // the standard rate.
  approach: 78,
  // Two short lines and one button.
  handoff: 70,
};

/**
 * V6.3: the same allowance for a segment with NO SCENE ON IT -- the exit
 * traverse. Reading allowance buys time to look at something; a travel leg has
 * nothing to look at, so paying it the full 74 would spend the page's scroll
 * budget on empty world.
 *
 * The two numbers below are what make the new leg affordable. Route length is
 * capped at 420vh by a design contract the owner set when V3's 420vh was rejected
 * (tests/unit/spatial-route.test.ts), and the traverse adds ~262 units of world to
 * a route that was 1137. Paid at the scene rate that is +484vh of page. Paid at
 * the travel rate it is +418vh -- inside the cap, at the cost of route one giving
 * up about 10% of its progress share.
 *
 * That trade is also the right art direction rather than only the affordable one:
 * a travel leg SHOULD move faster than a scene. The one thing it may not do is
 * break the world's C1 speed contract, and it does not -- every join still meets
 * at the single shared boundary speed, which is asserted directly.
 *
 * V6.5 LOWERED IT 34 -> 24. The allowance is reading time, and the V6.4 exit legs
 * were measured carrying 1560px of scroll across which the rendered frame was 2.2%
 * ink -- there was nothing to read, so the allowance was buying nothing. It is not
 * taken to zero: the traverse now passes two real destinations (§4), and a
 * destination seen at distance is something to look at even though no scene stands
 * on the leg.
 */
export const TRAVEL_ALLOWANCE = 24;

/**
 * How much of a travel leg's true arc length is charged to the scroll budget.
 * Below 1 the camera crosses it faster than it crosses a scene leg.
 *
 * A first pass used 0.66 with a 24 allowance, which is measurably too aggressive
 * and the tests said so rather than the eye: the traverse peaked at 2.29x the
 * route average (the world's band is capped at 2.2) and its speed rose so steeply
 * out of the `handoff` join that consecutive samples 0.0005 apart differed by 10%
 * -- not a C1 break (the one-sided join test still passed at 3%) but a curvature
 * spike sharp enough to read as a lurch. Peak speed on a symmetric segment is
 * ~1.5·L/width, so it is set by this ratio directly.
 */
export const TRAVEL_WEIGHT_RATIO = 0.8;

/**
 * V6.7 (JOB 1): the reading allowance for the ACQUISITION DESCENT specifically --
 * between the travel rate (24) and the scene rate (74).
 *
 * The beat is not a scene: nothing stands on it and there is nothing to read, so
 * paying it FOCUS_ALLOWANCE would give the page's opening more scroll than Kivilcim
 * gets. But it is not mid-route transit either -- it is the first thing the reader
 * does, it carries the tail of the hero's own reading time, and at the bare travel
 * rate its progress width is narrow enough that the camera has to ramp from reading
 * speed to travel speed across very little scroll. Measured, that produced an 8.9%
 * frame-to-frame speed step at p=0.001 against the world's standing 8% ceiling --
 * i.e. a visible lurch on the very first wheel notch, caught by
 * tests/unit/spatial-route.test.ts rather than by eye.
 *
 * 46 widens the segment enough for the ramp to be smooth while still costing route
 * one about a third less than a scene leg would.
 */
export const ENTRY_ALLOWANCE = 46;

/**
 * V8 (§3): the same treatment for the EXIT, and for exactly the reason V6.7
 * introduced ENTRY_ALLOWANCE -- a short travel segment paid at the bare travel
 * rate has to ramp between speeds across too little scroll.
 *
 * Collapsing the two-leg exit into the handover turn alone took it from 222.1
 * screen units to 95.3. At TRAVEL_ALLOWANCE the remaining leg's progress width
 * fell to 0.045, and the camera then had to change speed steeply enough across
 * the `handoff` join to produce a 9.0% frame-to-frame step against the world's
 * standing 8% ceiling -- caught by tests/unit/spatial-route.test.ts, not by eye,
 * and the same failure signature the entry beat produced at p=0.001.
 *
 * V9 (§4) raised it 38 -> 40. Per-scene reading allowance narrowed route two's
 * segments, which sharpened this same join again; 40 is the largest value that
 * keeps the exit cheaper to scroll than the cheapest leg carrying a scene, which
 * is the contract that stops it quietly becoming a journey again.
 *
 * The value is deliberately BELOW the entry's 46. Reading allowance buys time to
 * look at something; the entry beat carries the tail of the hero's own reading
 * time, and this leg carries nothing at all now that the destination previews
 * are gone. It is sized as the smallest allowance that keeps the join inside the
 * world's continuity contract, and no larger -- which is the whole point of
 * removing the previews rather than restyling them.
 */
export const EXIT_ALLOWANCE = 48;

/**
 * Boundary speed, as a fraction of the route average, at joins that have NO SCENE
 * on them: between the two exit legs, and at the route's terminus.
 *
 * Every join in the world through V6.2 ran at FOCUS_SPEED_RATIO, because every
 * join was a scene -- slowest where there is something to look at. The exit
 * traverse introduced the first joins where that is not true, and decelerating to
 * reading speed at a coordinate with nothing on it is exactly the "stop/go" V4
 * was built to remove.
 *
 * Above 1, so the route ENDS at speed and hands over to the lower page still
 * travelling, which is also what §5 asks the traverse to establish. It flattens
 * the traverse's velocity profile as a side effect: an asymmetric Hermite with a
 * fast far end has a lower peak than a symmetric one covering the same distance.
 */
export const TRAVEL_SPEED_RATIO = 1.15;

/**
 * THE DECOMPRESSION INTERVAL (V6.1).
 *
 * V6's route two began exactly at the cut, so `reorient` -- the UNDERNEATH
 * composition -- was *fully framed* at BREAK_CUT while the break panel was still
 * covering it, and the panel only finished leaving 0.026 of progress later. The
 * scene and the collision residue therefore occupied the same frames BY
 * CONSTRUCTION. No amount of restaging the composition could fix that; the
 * camera had to stop arriving at the scene during the transition.
 *
 * So route two now starts at a LEAD-IN coordinate short of `reorient`, placed
 * back along the reorient->approach direction. The camera is thrown to that
 * coordinate by the collision, the cover leaves while it sits in open world, and
 * only then does it travel forward into UNDERNEATH. "Impact -> spatial release ->
 * negative space -> route settles -> UNDERNEATH enters" becomes the literal
 * camera path rather than a description of one.
 *
 * REACH is how far back along that direction the lead-in sits, as a fraction of
 * the reorient->approach leg.
 *
 * The decompression leg is weighted with the ordinary FOCUS_ALLOWANCE like every
 * other segment. An earlier V6.1 pass gave it a reduced allowance to keep the
 * page shorter, and that broke the world's C1 continuity: with a different
 * allowance the segment's progress width no longer satisfies the shared boundary
 * speed, the solver clamps, and camera speed mismatched by 4.7% across the
 * `reorient` join (caught by tests/unit/spatial-route.test.ts, not by eye).
 * A continuous camera is worth more than 10vh of page length, and treating this
 * segment like any other is also simply less machinery.
 */
export const DECOMPRESSION_REACH = 0.22;

/**
 * Camera speed at a scene, as a fraction of the route's average speed.
 *
 * V6 RAISED THIS FROM 0.26 TO 0.42, which is the single largest change in the
 * V6 motion pass. The owner's remaining complaint after V5 was that the journey
 * still felt like "not much is happening, then suddenly too much" -- and that is
 * this number. Under arc-length parameterisation the mid-segment peak is
 * `1.5 - 0.5·r` of average, so the whole dynamic range of the journey is
 * `(1.5 - 0.5r) / r`:
 *
 *   r = 0.26  ->  peak 1.37x, band 5.3x   (V5: legible focus, uneven travel)
 *   r = 0.42  ->  peak 1.29x, band 3.1x   (V6)
 *
 * A scene is still clearly the slowest point in the world -- 0.42 against a
 * 1.29 peak is a 3x contrast, which reads as arrival -- but the stretches
 * between scenes no longer have to sprint to make up the distance the focus
 * zones gave away.
 */
export const FOCUS_SPEED_RATIO = 0.42;

/**
 * Total scroll driving the route, in viewport heights.
 *
 * V6.5 LOWERED IT 445 -> 430, again at zero cost to route one's pacing, and again
 * by arithmetic rather than by taste. Shortening the turn leg and lowering the
 * travel allowance cut route two's scroll weight, which RAISES route one's share
 * of progress (SPLIT went 0.4728 -> 0.4898). At 445 that would have handed route
 * one 218.0vh where V6.4 gave it 210.4 -- i.e. the fix for the empty region would
 * have quietly slowed down the region that was already right. 430 x 0.4898 =
 * 210.6vh puts route one back within a fifth of a viewport of V6.4, and the 15vh
 * saved comes entirely out of the exit.
 *
 * V6.4 LOWERED IT 474 -> 445, at exactly zero cost to pacing, because retiring
 * the impact window handed back the progress it was consuming.
 *
 * THE ARITHMETIC. Every segment's progress width is proportional to AVAILABLE
 * (see sceneRoute.ts), which through V6.3 was `1 - IMPACT_WINDOW` = 0.938: the
 * impact was 6.2% of the page's scroll during which the camera advanced along the
 * route not at all. With the collision gone AVAILABLE is 1, so every segment's
 * width grows by 1/0.938 and the camera's world-units-per-progress falls by the
 * same factor. Multiplying the route length by 0.938 -- 474 x 0.938 = 444.6 --
 * therefore leaves world-units-per-SCROLL-PIXEL identical everywhere. Route one
 * keeps its 218vh, the exit traverse keeps its full length, and the page is 29vh
 * shorter.
 *
 * It also halves the standing override. 420vh was rejected in V3 and V6.3 went
 * 12.9% past it to pay for the exit traverse; V6.4 is 6.0% past it for the same
 * traverse. The ceiling asserted in tests/unit/spatial-route.test.ts comes down
 * from 500 to 460 to match, so the guard is tighter after this pass than before
 * it. If the owner wants a hard 420 the alternative is still one constant, and
 * the cost is now 5.6% of route one's reading time rather than 13%.
 *
 * V6.3 RAISED IT 410 -> 474, AND THAT BROKE THE STANDING GUARD.
 *
 * THE ARITHMETIC, because the choice is entirely arithmetic. §4 of the V6.3 brief
 * requires a real exit traverse. That adds 266 units of world to a route that was
 * 1137, and route one's share of progress is
 *
 *   SPLIT = AVAILABLE x W1 / (W1 + W2)
 *
 * so ANY addition to route two dilutes route one, whose scroll share falls from
 * 0.532 to 0.460 the moment the traverse exists. At 418vh -- inside the old cap --
 * route one gets 192vh where V6.2 gave it 218vh: a 13% faster camera across HERO,
 * Kıvılcım, DropSpot and the run at the wall, which is below even V5's 196vh and
 * would undo most of V6's pacing work. Those are the four scenes the V6.3 brief
 * opens by listing as areas to preserve.
 *
 * 474vh restores route one to 218.1vh -- V6.2's figure to within a tenth of a
 * viewport -- and the exit traverse is paid for by page length instead of by the
 * portfolio's own content.
 *
 * WHY THE OLD CAP IS NOT SIMPLY BEING IGNORED. 420vh was rejected in V3, and the
 * V3 measurements say what was actually wrong with it: 29 distinct camera
 * positions across 900 frames, a median response of 0.00 camera px per scroll px,
 * and 1276px of scrolling that moved the camera under 8px. The objection was DEAD
 * SCROLL, not length. V4 removed dead scroll structurally (there is no zero-
 * velocity plateau anywhere in the route now, and a unit test asserts it), so the
 * condition the cap was protecting against no longer exists. If the owner still
 * wants a hard 420, the alternative is one constant -- set this to 418 -- and the
 * cost is the 13% above.
 *
 * V6.1 raised this again, 380vh -> 410vh, purely to pay for the decompression
 * segment: adding a leg to route two lowers SPLIT (route one's share of
 * progress) from 0.576 to ~0.542, and without the extra length route one would
 * have silently lost about 20vh of the reading time V6 had just bought it. Still
 * under V3's rejected 420vh.
 *
 * V6 raised this from V5's 340vh to 380vh (still under V3's 420vh). Raising
 * FOCUS_SPEED_RATIO means the camera crosses a scene's neighbourhood faster in
 * *progress* terms, which on its own would cost reading time at exactly the
 * moments that need it most. Lengthening the route restores that time by
 * lowering the absolute camera speed per scroll pixel everywhere, while leaving
 * the flattened VARIANCE -- the thing that was actually wrong -- intact.
 */
/**
 * V8 (§3) LOWERED IT 640 -> 600, and the arithmetic is the same one V6.4 and
 * V6.5 used: route one's pacing is the quantity being held constant, and the
 * total is whatever holds it.
 *
 * Deleting the exit's empty diagonal removed 167.2 screen units from route two,
 * which RAISES route one's share of progress (SPLIT 0.5916 -> 0.6317) exactly as
 * V6.5 predicted the mechanism would. Left at 640 that would have handed route
 * one 404.3vh where V7 gave it 378.6 -- i.e. removing dead scroll from the exit
 * would have quietly slowed the four project scenes by 7%, which is the opposite
 * of a tighter journey. 600 x 0.6317 = 379.0vh puts route one back within half a
 * viewport-height of V7, and the whole 40vh saved comes out of the exit.
 */
export const ROUTE_LENGTH_VH = 600;

/**
 * Depth planes (§12). The middle plane is the world itself and is pinned at
 * exactly 1.0 on purpose: the route rails and registration ticks are DERIVED
 * from the camera path, so parallaxing them would make the world's own
 * orientation system point at the wrong place. Depth is therefore built around
 * that plane -- material behind it, material in front of it -- rather than by
 * sliding it.
 */
export const PLANE_DISTANT = 0.62;
export const PLANE_WORLD = 1;
export const PLANE_NEAR = 1.13;

// V8 (§3) DELETED `PLANE_DEEP` (0.44). It was added in V6.4 for exactly one
// object -- the deeper of the two destination surfaces -- and with that surface
// removed as a rejected early duplicate, the plane had nothing at any depth to
// hold. A fourth transformed layer costing a paint on every frame to carry
// nothing is not depth, it is overhead.

/** Scale a scene resolves through as the camera arrives (§15). A few percent. */
export const SCENE_SCALE_FAR = 0.972;
export const SCENE_SCALE_FOCUS = 1;

export function sceneById(id: SceneId): SceneConfig {
  const scene = SCENES.find((entry) => entry.id === id);
  if (!scene) throw new Error(`unknown scene: ${id}`);
  return scene;
}

export function sceneAnchor(id: SceneId, mobile = false): WorldPoint {
  const scene = sceneById(id);
  return mobile ? scene.mobileWorld : scene.world;
}

/** Distance between two world points in one screen measure (vh-equivalents). */
export function screenDistance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot((b.x - a.x) * VW_PER_VH, b.y - a.y);
}
