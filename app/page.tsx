import type { Metadata } from "next";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { BuiltForRealLife } from "@/components/sections/BuiltForRealLife";
import { FieldNotes } from "@/components/sections/FieldNotes";
import { HowIBuild } from "@/components/sections/HowIBuild";
import { DriftBlock, EditorialDrift } from "@/components/spatial/EditorialDrift";
import { SpatialExperience } from "@/components/spatial/SpatialExperience";
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
// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// docs/DESIGN_SYSTEM.md §18): on this branch only, `<SpatialExperience>`
// replaces Hero, PositioningStatement, LayerExplorerIntro, and
// SelectedSystems as the homepage's top section. `Hero.tsx`,
// `PositioningStatement.tsx`, `LayerExplorerIntro.tsx`, and
// `SelectedSystems.tsx` are all intentionally left unmodified and still
// present in the repository, simply unused from this file -- reverting this
// branch's homepage change is a one-line swap back to those four
// components. BuiltForRealLife, HowIBuild, FieldNotes, and AboutPreview are
// untouched below, exactly as the brief requires.
//
// The spatial section sits OUTSIDE the shared `Container` (since V2): a camera
// that travels between scenes which "temporarily own the viewport" has to
// be measured against the viewport, not against a 1320px padded column.
// V1 kept it inside the container while positioning the world in vw/vh,
// so the world's units and its actual frame disagreed -- part of why
// content read as tiny. The scenes carry their own inset, and every
// ordinary section below still uses the normal container exactly as before.
export const metadata: Metadata = buildMetadata({
  description: "Hakan Duyar — Frontend & Product Engineer.",
  path: "/",
});

export default function Home() {
  const realLifeProjects = getProjectsByTier("real-life");

  return (
    <>
      <SpatialExperience />
      {/* Spatial V5 §26-31: the lower homepage keeps its exact semantic order
          and its exact content, but is composed along a deterministic drift
          track instead of a centred column, so the world's physics continue
          past the end of the spatial route rather than stopping dead at it.
          The shared `Container` is replaced by the drift track, which carries
          its own responsive width and padding. */}
      <div className="py-16">
        <JsonLd data={buildPersonJsonLd()} />
        <EditorialDrift>
          <DriftBlock id="real-life">
            <BuiltForRealLife projects={realLifeProjects} />
          </DriftBlock>
          <DriftBlock id="how-i-build">
            <HowIBuild />
          </DriftBlock>
          <DriftBlock id="field-notes">
            <FieldNotes notes={notes} />
          </DriftBlock>
          <DriftBlock id="about">
            <AboutPreview />
          </DriftBlock>
        </EditorialDrift>
      </div>
    </>
  );
}
