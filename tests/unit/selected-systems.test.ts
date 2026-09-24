import { describe, expect, it } from "vitest";
import { projectDepth, projectLayerCoverage } from "@/components/sections/SelectedSystems";
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

// V14.2 Gate C: the section drawing's descent ends on the deepest documented
// stratum, and a record that documents none draws no descent at all.
describe("Selected Systems section depth", () => {
  const projects = getPublishedProjects();
  const bySlug = (slug: string) => projects.find((project) => project.slug === slug)!;

  it("descends to the deepest layer the validated record reaches", () => {
    expect(projectDepth(bySlug("software-factory"))).toBe(2);
    for (const slug of ["kivilcim", "jointledger", "dropspot"]) {
      expect(projectDepth(bySlug(slug))).toBe(2);
    }
  });

  it("draws no descent for a record that documents no layer", () => {
    expect(projectDepth(bySlug("professional-systems"))).toBe(-1);
  });
});
