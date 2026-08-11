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
import { notes } from "@/data/notes";
import { getProjectLayers, getProjectsByTier } from "@/lib/content/work";
import { buildMetadata } from "@/lib/seo/metadata";

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

export default async function Home() {
  const featuredProjects = getProjectsByTier("featured");
  const realLifeProjects = getProjectsByTier("real-life");

  // TASK-007: the Built in Layers explorer previews a real, published
  // project's layers rather than staying an abstract, content-free
  // definition -- derived from the same loader-fed data as everything
  // else on this page (the first featured project deep enough to have
  // real Surface/Flow/System bodies), never a hard-coded slug.
  const previewProject = featuredProjects.find(
    (project) => project.depth === "full" || project.depth === "short",
  );
  const previewLayers = previewProject ? await getProjectLayers(previewProject.slug) : null;

  return (
    <Container className="py-16">
      <Hero />
      <PositioningStatement />
      <LayerExplorerIntro previewProject={previewProject} previewLayers={previewLayers} />
      <SelectedSystems projects={featuredProjects} />
      <BuiltForRealLife projects={realLifeProjects} />
      <HowIBuild />
      <FieldNotes notes={notes} />
      <AboutPreview />
    </Container>
  );
}
