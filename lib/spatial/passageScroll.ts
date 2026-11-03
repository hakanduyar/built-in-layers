import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { ROUTE_LENGTH_VH } from "@/lib/spatial/scenes";
import { projectTour } from "@/lib/spatial/signalPhase";

// Positions in this table use the original route span as their unit.
// Each inter-project leg earns twice its old length in additional scroll.
// The addition ramps in and out inside the exposure, leaving reading stops,
// the opening, the cut, and the handoff at their original local pacing.
function buildMap(mobile: boolean) {
  let added = 0;
  const passages = projectTour.slice(1).map((destination, i) => {
    const from = sceneFocusProgress(projectTour[i]!, mobile);
    const width = sceneFocusProgress(destination, mobile) - from;
    const start = from + width * 0.14;
    const end = from + width * 0.96;
    const extra = 2 * width;
    const block = { start, end, extra, scrollStart: start + added, scrollEnd: end + added + extra };
    added += extra;
    return block;
  });
  return { passages, span: 1 + added };
}

const desktopMap = buildMap(false);
const mobileMap = buildMap(true);
const mapFor = (mobile: boolean) => (mobile ? mobileMap : desktopMap);

export function routeSpacerVh(mobile: boolean) {
  return 100 + (ROUTE_LENGTH_VH - 100) * mapFor(mobile).span;
}

function inPassage(t: number, width: number, extra: number) {
  return t * width + extra * t * t * (3 - 2 * t);
}

/** Map a camera composition to its fractional position in the longer spacer. */
export function scrollAtComposition(progress: number, mobile = false) {
  const map = mapFor(mobile);
  let offset = 0;
  for (const leg of map.passages) {
    if (progress <= leg.start) break;
    if (progress < leg.end) {
      const width = leg.end - leg.start;
      return (
        (leg.scrollStart + inPassage((progress - leg.start) / width, width, leg.extra)) / map.span
      );
    }
    offset += leg.extra;
  }
  return (progress + offset) / map.span;
}

/** Invert the same monotone curve for wheel, touch, scrollbar and keyboard. */
export function compositionAtScroll(scroll: number, mobile = false) {
  const map = mapFor(mobile);
  const position = scroll * map.span;
  let offset = 0;
  for (const leg of map.passages) {
    if (position <= leg.scrollStart) break;
    if (position < leg.scrollEnd) {
      const width = leg.end - leg.start;
      let low = 0,
        high = 1;
      for (let i = 0; i < 22; i++) {
        const mid = (low + high) / 2;
        if (inPassage(mid, width, leg.extra) < position - leg.scrollStart) low = mid;
        else high = mid;
      }
      return leg.start + ((low + high) / 2) * width;
    }
    offset += leg.extra;
  }
  return position - offset;
}
