import { describe, expect, it } from "vitest";
import { worldFit, worldFitBootScript } from "@/lib/spatial/worldFit";

function boot(width: number, height: number, reduced = false) {
  const properties: Record<string, string> = {};
  const attributes: Record<string, string> = {};
  const document = {
    documentElement: {
      style: {
        setProperty: (key: string, value: string) => {
          properties[key] = value;
        },
      },
      setAttribute: (key: string, value: string) => {
        attributes[key] = value;
      },
    },
  };
  const matchMedia = (query: string) => ({
    matches: query.includes("min-width") ? width >= 1024 : reduced,
  });
  new Function("document", "matchMedia", "innerWidth", "innerHeight", worldFitBootScript())(
    document,
    matchMedia,
    width,
    height,
  );
  return { properties, attributes };
}

describe("first-paint desktop preview", () => {
  it("publishes the camera's fit and opts into its layout before hydration", () => {
    for (const [width, height] of [
      [1440, 900],
      [1920, 1080],
      [1366, 768],
    ] as const) {
      const result = boot(width, height);
      expect(Number(result.properties["--world-fit"])).toBe(worldFit(width, height));
      expect(result.attributes["data-world-preview"]).toBe("desktop");
    }
  });

  it("leaves mobile and reduced-motion layout untouched", () => {
    expect(boot(390, 844)).toEqual({ properties: {}, attributes: {} });
    expect(boot(1920, 1080, true)).toEqual({ properties: {}, attributes: {} });
  });
});
