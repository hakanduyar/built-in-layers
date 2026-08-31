import type { Metadata } from "next";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { SelectedSystems } from "@/components/sections/SelectedSystems";
import { FieldNotes } from "@/components/sections/FieldNotes";
import { HowIBuild } from "@/components/sections/HowIBuild";
import { DriftBlock, EditorialDrift } from "@/components/spatial/EditorialDrift";
import { SpatialExperience } from "@/components/spatial/SpatialExperience";
import { JsonLd } from "@/components/ui/JsonLd";
import { notes } from "@/data/notes";
import { getPublishedProjects } from "@/lib/content/work";
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
  // V7: the Selected Systems index lists every published system, in the
  // owner-ordered sequence the frontmatter's own `order` field records.
  const publishedSystems = getPublishedProjects();

  return (
    <>
      <SpatialExperience />
      {/* Spatial V5 (docs/DESIGN_SYSTEM.md §19.9): the lower homepage keeps its exact semantic order
          and its exact content, but is composed along a deterministic drift
          track instead of a centred column, so the world's physics continue
          past the end of the spatial route rather than stopping dead at it.
          The shared `Container` is replaced by the drift track, which carries
          its own responsive width and padding. */}
      {/* V6.6 (JOB 3): `py-16` -> `pb-16 pt-8`. The top half of this padding sat
          inside the measured hand-over dead run, between the spatial section's
          closing surface-line and the first real section, and it was buying
          nothing that the drift track's own approach interval (driftPlate.gapVh)
          was not already buying more deliberately. The bottom is untouched. */}
      <div className="pb-16 pt-8">
        <JsonLd data={buildPersonJsonLd()} />
        <EditorialDrift>
          <DriftBlock id="selected-systems">
            <SelectedSystems projects={publishedSystems} />
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
