import type { Metadata } from "next";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { BuiltForRealLife } from "@/components/sections/BuiltForRealLife";
import { FieldNotes } from "@/components/sections/FieldNotes";
import { Hero } from "@/components/sections/Hero";
import { HowIBuild } from "@/components/sections/HowIBuild";
import { LayerExplorerIntro } from "@/components/sections/LayerExplorerIntro";
import { PositioningStatement } from "@/components/sections/PositioningStatement";
import { SelectedSystems } from "@/components/sections/SelectedSystems";
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
export const metadata: Metadata = buildMetadata({
  description: "Hakan Duyar — Frontend & Product Engineer.",
  path: "/",
});

export default function Home() {
  const featuredProjects = getProjectsByTier("featured");
  const realLifeProjects = getProjectsByTier("real-life");

  // TASK-007 says the explorer must "preview a featured project's real
  // layers" -- it does not require the homepage to reproduce a case
  // study's complete compiled MDX prose verbatim (re-read for the V3
  // prototype; see LayerExplorerIntro's own comment for the full
  // reasoning). `previewProject` stays the same real, loader-fed selection
  // (first featured project deep enough to have real Surface/Flow/System
  // content) -- no hard-coded slug, no second content source. Unlike V1/V2,
  // this no longer needs `getProjectLayers`'s async MDX compile: the real,
  // already-approved one-line `layers.<layer>.summary` fields already live
  // on this same `ProjectFrontmatter` object, so `Home` no longer needs to
  // be an async component at all.
  const previewProject = featuredProjects.find(
    (project) => project.depth === "full" || project.depth === "short",
  );

  return (
    <Container className="py-16">
      <JsonLd data={buildPersonJsonLd()} />
      <Hero />
      <PositioningStatement />
      <LayerExplorerIntro previewProject={previewProject} />
      <SelectedSystems projects={featuredProjects} />
      <BuiltForRealLife projects={realLifeProjects} />
      <HowIBuild />
      <FieldNotes notes={notes} />
      <AboutPreview />
    </Container>
  );
}
