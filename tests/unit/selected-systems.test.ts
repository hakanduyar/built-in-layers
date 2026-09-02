import { describe, expect, it } from "vitest";
import { projectLayerCoverage } from "@/components/sections/SelectedSystems";
import { getPublishedProjects } from "@/lib/content/work";

describe("Selected Systems resolved map", () => {
  const projects = getPublishedProjects();
  const bySlug = (slug: string) => projects.find((project) => project.slug === slug)!;

  it("derives layer coverage only from validated summaries or registered assets", () => {
    expect(projectLayerCoverage(bySlug("software-factory"), "surface")).toBe(false);
    expect(projectLayerCoverage(bySlug("software-factory"), "flow")).toBe(false);
    expect(projectLayerCoverage(bySlug("software-factory"), "system")).toBe(true);

    for (const slug of ["kivilcim", "jointledger", "dropspot"]) {
      for (const layer of ["surface", "flow", "system"] as const) {
        expect(projectLayerCoverage(bySlug(slug), layer)).toBe(true);
      }
    }
  });

  it("keeps unpublished professional layer detail visibly unresolved", () => {
    const professional = bySlug("professional-systems");
    for (const layer of ["surface", "flow", "system"] as const) {
      expect(projectLayerCoverage(professional, layer)).toBe(false);
    }
  });
});
