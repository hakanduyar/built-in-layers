import type { Metadata } from "next";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { BuiltForRealLife } from "@/components/sections/BuiltForRealLife";
import { FieldNotes } from "@/components/sections/FieldNotes";
import { HowIBuild } from "@/components/sections/HowIBuild";
import { SpatialExperience } from "@/components/spatial/SpatialExperience";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { notes } from "@/data/notes";
import { getProjectsByTier } from "@/lib/content/work";
import { buildMetadata, buildPersonJsonLd } from "@/lib/seo/metadata";

// TASK-003: the complete static homepage, all 10 PROJECT_SPEC §7 IA
// sections (header/nav and the contact CTA/footer are global, from
// TASK-002). Project data is read here, from the real TASK-004 content
// loaders, and passed down as props -- no project data is hard-coded in any
// section component, and no disposable/temporary data module exists (D-011
// rejected).
//
// Spatial Portfolio prototype (feature/spatial-portfolio, not merged to
// main -- docs/DESIGN_SYSTEM.md §18): on this branch only, `<SpatialExperience>`
// replaces Hero, PositioningStatement, LayerExplorerIntro, and
// SelectedSystems as the homepage's top section. `Hero.tsx`,
// `PositioningStatement.tsx`, `LayerExplorerIntro.tsx`, and
// `SelectedSystems.tsx` are all intentionally left unmodified and still
// present in the repository, simply unused from this file -- reverting this
// branch's homepage change is a one-line swap back to those four
// components. BuiltForRealLife, HowIBuild, FieldNotes, and AboutPreview are
// untouched below, exactly as the brief requires.
export const metadata: Metadata = buildMetadata({
  description: "Hakan Duyar — Frontend & Product Engineer.",
  path: "/",
});

export default function Home() {
  const realLifeProjects = getProjectsByTier("real-life");

  return (
    <Container className="py-16">
      <JsonLd data={buildPersonJsonLd()} />
      <SpatialExperience />
      <BuiltForRealLife projects={realLifeProjects} />
      <HowIBuild />
      <FieldNotes notes={notes} />
      <AboutPreview />
    </Container>
  );
}
