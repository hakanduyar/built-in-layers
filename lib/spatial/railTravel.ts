import { SCENE_IDS, sceneAnchor, screenDistance, type WorldPoint } from "@/lib/spatial/scenes";
import type { RouteLeg } from "@/lib/spatial/sceneRoute";

// V14.1 -- THE OPEN TRAVEL OF A LEG.
//
// The rail is drawn only in the open: from where the previous composition
// ends (its block measure plus a margin down-route of its anchor) to the next
// station, seven screen units short of the anchor. Under a composition the
// ground carries the route (ProjectPlane); the line never runs through a
// title. This is the geometry WorldGrammar draws and the e2e guard counts
// against (tests/e2e/spatial.spec.ts, D-040): a leg with no open run -- the
// acquisition descent, the cut, the turn -- draws no rail at all, so the
// number of ahead paths in the frame is the number of legs with open travel,
// not the number of legs.

/** How far down-route of a composition's anchor its block ends, in world vw. */
export const RAIL_EXIT_X = 90;
/** How far short of the arriving anchor the rail stops, in screen units. */
export const RAIL_STATION_SETBACK = 7;

/** The part of a leg the rail actually draws: from clear of the departing
 *  composition to the arriving station. Points interpolated exactly at both
 *  ends, so the rail begins and ends on the curve. Empty when the leg has no
 *  open travel. */
export function visibleLegPoints(leg: RouteLeg): WorldPoint[] {
  const points = leg.points;
  if (points.length < 2) return [];
  const start = points[0]!;
  const departsComposition = SCENE_IDS.some((id) => {
    const a = sceneAnchor(id);
    return Math.abs(a.x - start.x) < 1e-6 && Math.abs(a.y - start.y) < 1e-6;
  });
  const exitX = departsComposition ? start.x + RAIL_EXIT_X : -Infinity;
  const out: WorldPoint[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i]!;
    if (p.x >= exitX) {
      if (out.length === 0 && i > 0) {
        const q = points[i - 1]!;
        const t = (exitX - q.x) / Math.max(p.x - q.x, 1e-6);
        out.push({ x: exitX, y: q.y + (p.y - q.y) * t });
      }
      out.push(p);
    }
  }
  if (out.length < 2) return [];
  // Stop at the station: walk back the setback from the end.
  let remaining = RAIL_STATION_SETBACK;
  while (out.length >= 2) {
    const a = out[out.length - 1]!;
    const b = out[out.length - 2]!;
    const step = screenDistance(a, b);
    if (step > remaining) {
      const t = remaining / step;
      out[out.length - 1] = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      break;
    }
    remaining -= step;
    out.pop();
  }
  return out.length >= 2 ? out : [];
}

/** Whether a leg draws a rail at all. */
export function legHasOpenTravel(leg: RouteLeg): boolean {
  return visibleLegPoints(leg).length >= 2;
}
