import {
  CUT_WORLD,
  ROUTE_ONE_IDS,
  ROUTE_TWO_IDS,
  VW_PER_VH,
  sceneAnchor,
  type SceneId,
  type WorldPoint,
} from "@/lib/spatial/scenes";
import { decompressionAnchor, routeLegs, workBranch } from "@/lib/spatial/sceneRoute";

// V14 (owner findings A, C, D, E) -- THE TOPOLOGY, drawn once, in four states.
//
// The brief's diagnosis of the lower half is that it "becomes a conventional
// editorial website", and of the zoom-out that it shows "no convincing topology
// connecting destinations". Both are the same absence: the world has a real
// structure -- two routes, nine stations, one cut, one branch -- and nothing
// ever DREW it as a whole. WorldGrammar draws it in world coordinates under the
// reader's feet, where it can only ever be seen a leg at a time. This component
// draws the SAME geometry as a map, so the journey's shape can be stated at the
// three moments that need it:
//
//   revealed   under the opened surface at SYSTEMS: the structure beneath the
//              page is the route the reader is on -- where they have been (the
//              four stations, solid) and where it goes next (route two, dashed).
//   mapped     at the handoff, beside the sentence that says it: "These are
//              four stops on a larger map." The map is the map, with the branch
//              to the Work index as the fifth node.
//   resolved   at the finale: the whole journey complete, every station
//              visited, still. Complexity mapped, in the owner's words; the
//              operator addressable beneath it.
//
// Nothing here is authored geometry. Every coordinate is the route's own
// (routeLegs, sceneAnchor, decompressionAnchor, workBranch), normalised into
// one frame, so if the route moves the map moves with it. It is a server
// component with no hooks: pure SVG from pure math, aria-hidden everywhere it
// is placed, and every label it can carry is a duplicate of real text passed
// in by the caller.
//
// Two polylines for the routes and, where the branch is shown, a third for it.
// The SYSTEMS cut may draw at most two (tests/e2e/spatial.spec.ts), which is
// why `revealed` omits the branch: the structure under the surface is the
// route the camera takes.

export type RouteMapState = "revealed" | "mapped" | "resolved";

export type RouteMapStation = {
  id: SceneId;
  /** A real index for the mark, e.g. "01". Rendered only where the caller asks. */
  index?: string;
};

type RouteMapProps = {
  state: RouteMapState;
  /** Index labels for the project stations, from the tour itself. */
  stations?: readonly RouteMapStation[];
  /** Real names the branch terminus carries. Empty hides the branch. */
  branch?: readonly string[];
  /** Whether to draw station indices. Off inside the reveal, where the word is
   *  the only type that should be read. */
  labels?: boolean;
  className?: string;
};

/* --------------------------------------------------------------- geometry */

const PAD = 36;
const WIDTH = 1000;

const GEOMETRY = (() => {
  const legs = routeLegs(false, 12);
  const branch = workBranch();
  const everything: WorldPoint[] = [
    ...legs.flatMap((leg) => leg.points),
    ...branch,
    CUT_WORLD,
    decompressionAnchor(),
  ];
  const minX = Math.min(...everything.map((p) => p.x));
  const maxX = Math.max(...everything.map((p) => p.x));
  const minY = Math.min(...everything.map((p) => p.y));
  const maxY = Math.max(...everything.map((p) => p.y));
  // Screen measure: x is weighted by VW_PER_VH so the map keeps the world's
  // real aspect, the same one the camera's own arc lengths are measured in.
  const spanX = (maxX - minX) * VW_PER_VH;
  const spanY = maxY - minY;
  const scale = (WIDTH - PAD * 2) / spanX;
  const height = spanY * scale + PAD * 2;
  const place = (p: WorldPoint): [number, number] => [
    PAD + (p.x - minX) * VW_PER_VH * scale,
    PAD + (p.y - minY) * scale,
  ];
  const polyline = (points: WorldPoint[]) =>
    points
      .map((p) =>
        place(p)
          .map((v) => v.toFixed(1))
          .join(","),
      )
      .join(" ");
  const route = (which: 1 | 2) =>
    legs
      .filter((leg) => leg.route === which)
      .flatMap((leg, index) => (index === 0 ? leg.points : leg.points.slice(1)));
  return {
    height,
    place,
    routeOne: polyline(route(1)),
    routeTwo: polyline(route(2)),
    branch: polyline(branch),
    branchTerminus: place(branch[branch.length - 1]!),
    branchJunction: place(branch[0]!),
    cut: place(CUT_WORLD),
    landing: place(decompressionAnchor()),
    terminus: place(route(2)[route(2).length - 1]!),
  };
})();

/** Which stations count as visited / current in each state. */
function stationState(id: SceneId, state: RouteMapState): "ahead" | "visited" | "current" {
  const one = ROUTE_ONE_IDS.indexOf(id as (typeof ROUTE_ONE_IDS)[number]);
  const two = ROUTE_TWO_IDS.indexOf(id as (typeof ROUTE_TWO_IDS)[number]);
  if (state === "resolved") return "visited";
  if (state === "revealed") {
    if (id === "tail") return "current";
    return one >= 0 ? "visited" : "ahead";
  }
  // mapped: the reader stands at the handoff.
  if (id === "handoff") return "current";
  if (one >= 0 || two >= 0) return "visited";
  return "ahead";
}

/* -------------------------------------------------------------- component */

export function RouteMap({
  state,
  stations = [],
  branch = [],
  labels = true,
  className,
}: RouteMapProps) {
  const g = GEOMETRY;
  const showBranch = state !== "revealed" && branch.length > 0;
  const indexOf = new Map(stations.map((station) => [station.id, station.index]));
  const complete = state === "resolved";

  return (
    // The SVG clips to its own box (the UA default). It was `overflow:
    // visible` in the first V14 build, and at exactly 1024px -- the narrowest
    // `lg` frame, where the finale gives the map a ~400px column -- the branch
    // labels ran past the box and widened the document by 21px in both the
    // default and reduced-motion trees (caught by five e2e overflow checks).
    // Every mark and label is placed inside the viewBox, so nothing is lost.
    <svg
      viewBox={`0 0 ${WIDTH} ${g.height.toFixed(1)}`}
      className={className}
      aria-hidden="true"
      data-route-map={state}
    >
      {/* Route one: the evidence descent. Solid ink -- it has been travelled
          in every state this map is shown in. */}
      <polyline
        points={g.routeOne}
        fill="none"
        stroke="var(--color-ink)"
        strokeOpacity={complete ? 0.8 : 0.66}
        style={{ strokeWidth: 1.5 }}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
      {/* Route two: the climb back. Dashed signal while it is still ahead;
          solid once the journey is complete. */}
      <polyline
        points={g.routeTwo}
        fill="none"
        stroke="var(--color-signal)"
        strokeOpacity={state === "revealed" ? 0.62 : 0.82}
        style={{ strokeWidth: 1.5 }}
        strokeDasharray={complete ? undefined : "6 7"}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
      {showBranch && (
        <polyline
          points={g.branch}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity={0.5}
          style={{ strokeWidth: 1.25 }}
          strokeDasharray="2.5 6"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {/* The cut: route one ends here, behind two closing surfaces. */}
      <g
        stroke="var(--color-ink)"
        strokeOpacity={0.7}
        style={{ strokeWidth: 1.25 }}
        vectorEffect="non-scaling-stroke"
      >
        <line x1={g.cut[0] - 1.5} y1={g.cut[1] - 9} x2={g.cut[0] - 1.5} y2={g.cut[1] + 9} />
        <line x1={g.cut[0] + 3} y1={g.cut[1] - 9} x2={g.cut[0] + 3} y2={g.cut[1] + 9} />
      </g>
      {/* Where the route is picked up again: the world's resolved corner. */}
      <g
        stroke="var(--color-signal)"
        strokeOpacity={0.8}
        style={{ strokeWidth: 1.25 }}
        vectorEffect="non-scaling-stroke"
      >
        <line x1={g.landing[0]} y1={g.landing[1]} x2={g.landing[0] + 14} y2={g.landing[1]} />
        <line x1={g.landing[0]} y1={g.landing[1]} x2={g.landing[0]} y2={g.landing[1] + 14} />
      </g>

      {/* Stations. */}
      {[...ROUTE_ONE_IDS, ...ROUTE_TWO_IDS].map((id) => {
        const [x, y] = g.place(sceneAnchor(id));
        const status = stationState(id, state);
        const routeTwo = ROUTE_TWO_IDS.some((two) => two === id);
        const tone = routeTwo ? "var(--color-signal)" : "var(--color-ink)";
        const index = indexOf.get(id);
        if (id === "hero") {
          return <rect key={id} x={x - 4} y={y - 4} width={8} height={8} fill={tone} />;
        }
        if (id === "tail") {
          // SYSTEMS: the surface opens here. A larger open ring, current or visited.
          return (
            <g key={id}>
              <circle
                cx={x}
                cy={y}
                r={9}
                fill="none"
                stroke={tone}
                strokeOpacity={0.85}
                style={{ strokeWidth: 1.5 }}
                vectorEffect="non-scaling-stroke"
              />
              {status !== "ahead" && <circle cx={x} cy={y} r={3.5} fill={tone} />}
            </g>
          );
        }
        return (
          <g key={id}>
            <circle
              cx={x}
              cy={y}
              r={routeTwo ? 6 : 7}
              fill={status === "visited" || status === "current" ? tone : "var(--color-paper)"}
              fillOpacity={status === "current" ? 1 : status === "visited" ? 0.9 : 1}
              stroke={tone}
              strokeOpacity={status === "ahead" ? 0.55 : 0.95}
              style={{ strokeWidth: 1.5 }}
              vectorEffect="non-scaling-stroke"
            />
            {status === "current" && (
              <circle
                cx={x}
                cy={y}
                r={13}
                fill="none"
                stroke={tone}
                strokeOpacity={0.5}
                style={{ strokeWidth: 1 }}
                vectorEffect="non-scaling-stroke"
              />
            )}
            {labels && index && (
              <text
                x={x + 14}
                y={y - 10}
                fill="var(--color-ink)"
                fillOpacity={0.85}
                fontSize={24}
                fontFamily="var(--font-mono)"
                letterSpacing="0.08em"
              >
                {index}
              </text>
            )}
          </g>
        );
      })}

      {/* The route's end: the handover turn, a closed node. */}
      <rect
        x={g.terminus[0] - 4}
        y={g.terminus[1] - 4}
        width={8}
        height={8}
        fill="var(--color-ink)"
        fillOpacity={complete ? 1 : 0.7}
      />

      {/* The branch not taken, and the real names at its end. */}
      {showBranch && (
        <g>
          <circle
            cx={g.branchJunction[0]}
            cy={g.branchJunction[1]}
            r={4}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity={0.7}
            style={{ strokeWidth: 1.25 }}
            vectorEffect="non-scaling-stroke"
          />
          <g
            stroke="var(--color-ink)"
            strokeOpacity={0.7}
            style={{ strokeWidth: 1.25 }}
            vectorEffect="non-scaling-stroke"
          >
            <line
              x1={g.branchTerminus[0]}
              y1={g.branchTerminus[1]}
              x2={g.branchTerminus[0] + 16}
              y2={g.branchTerminus[1]}
            />
            <line
              x1={g.branchTerminus[0]}
              y1={g.branchTerminus[1]}
              x2={g.branchTerminus[0]}
              y2={g.branchTerminus[1] + 16}
            />
          </g>
          {labels &&
            branch.map((name, index) => (
              <text
                key={name}
                x={g.branchTerminus[0] + 8}
                y={g.branchTerminus[1] + 34 + index * 26}
                fill="var(--color-ink)"
                fillOpacity={0.8}
                fontSize={21}
                fontFamily="var(--font-mono)"
                letterSpacing="0.08em"
                style={{ textTransform: "uppercase" }}
              >
                {name}
              </text>
            ))}
        </g>
      )}
    </svg>
  );
}

/** The map's aspect, for callers that size its box. */
export const ROUTE_MAP_ASPECT = WIDTH / GEOMETRY.height;
