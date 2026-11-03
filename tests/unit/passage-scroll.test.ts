import { describe, expect, it } from "vitest";
import {
  compositionAtScroll,
  routeSpacerVh,
  scrollAtComposition,
} from "@/lib/spatial/passageScroll";
import { projectTour } from "@/lib/spatial/signalPhase";
import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { ROUTE_LENGTH_VH } from "@/lib/spatial/scenes";

describe.each([false, true])("passage scroll distance (mobile=%s)", (mobile) => {
  const vh = (p: number) => scrollAtComposition(p, mobile) * (routeSpacerVh(mobile) - 100);
  it("triples the physical distance of each project leg", () => {
    const stops = projectTour.map((slug) => sceneFocusProgress(slug, mobile));
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1]!,
        b = stops[i]!;
      expect(vh(b) - vh(a)).toBeCloseTo((b - a) * (ROUTE_LENGTH_VH - 100) * 3, 8);
    }
    for (const [a, b] of [[0, stops[0]!] as const, [stops.at(-1)!, 1] as const]) {
      expect(vh(b) - vh(a)).toBeCloseTo((b - a) * (ROUTE_LENGTH_VH - 100), 8);
    }
  });
  it("preserves the camera positions reached from either direction", () => {
    for (let i = 0; i <= 1000; i++) {
      const progress = i / 1000;
      expect(compositionAtScroll(scrollAtComposition(progress, mobile), mobile)).toBeCloseTo(
        progress,
        7,
      );
    }
  });
});
