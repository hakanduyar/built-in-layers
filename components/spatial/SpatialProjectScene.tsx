import { Figure } from "@/components/ui/Figure";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { TextLink } from "@/components/ui/TextLink";
import type { ProjectFrontmatter, ProjectImageAssetType } from "@/lib/content/schemas";

// Spatial Portfolio V2 (feature/spatial-portfolio-v2, not merged to main --
// see docs/DESIGN_SYSTEM.md §18).
//
// This component exists because V1's spatial "nodes" reused the ordinary
// homepage `ProjectCard`, which produced tiny floating webpage cards adrift
// in a huge world -- the single most-rejected thing in the V1 review. A card
// is designed to sit in a list among siblings; a scene has to hold a whole
// viewport on its own. Those are different jobs, so this is a different
// component.
//
// What it does NOT do: duplicate content. Every fact rendered here comes
// from the real loader-fed `ProjectFrontmatter` -- title, description,
// tech, links, and the registered image with its D-019 caption. There is no
// slug->copy map and no per-project special-casing anywhere in this file;
// the two scenes differ only by a `variant` layout prop and by what their
// own real data contains.

type SpatialProjectSceneProps = {
  project: ProjectFrontmatter;
  /** Route index shown as the scene's single mono marker, e.g. "01". */
  index: string;
  /**
   * `split` puts the evidence plate beside the text; `stacked` leads with a
   * dominant full-width plate. Two genuinely different editorial
   * compositions, so the two project scenes never read as one repeated
   * template -- which is also what DESIGN_SYSTEM §17 criterion 4 asks for.
   */
  variant: "split" | "stacked";
};

const EVIDENCE_LABEL: Record<ProjectImageAssetType, string> = {
  "real-screenshot": "Real screenshot",
  "verified-diagram": "Verified diagram",
  "provisional-illustration": "Illustrative diagram",
};

/**
 * Picks the one asset a scene leads with, entirely from the asset's own
 * registered metadata -- never a hard-coded filename or slug lookup.
 * Real photographic evidence outranks a diagram; failing that, the
 * system-layer diagram is the most load-bearing thing a project can show at
 * this scale; failing that, whatever is registered first.
 *
 * On the two current scenes this resolves to DropSpot's real signed-in home
 * screenshot and Kıvılcım's verified local-first architecture diagram --
 * the right lead asset for each, derived rather than dictated.
 */
function representativeAsset(project: ProjectFrontmatter) {
  return (
    project.images.find((image) => image.assetType === "real-screenshot") ??
    project.images.find((image) => image.layer === "system") ??
    project.images[0]
  );
}

export function SpatialProjectScene({ project, index, variant }: SpatialProjectSceneProps) {
  const asset = representativeAsset(project);
  const stacked = variant === "stacked";

  // One mono line carries both the route index and the evidence type. V1
  // scattered several competing micro-labels per node; V2 spends that
  // attention budget once (§22: fewer elements, larger meaning).
  const marker = asset ? `${index} / ${EVIDENCE_LABEL[asset.assetType]}` : index;

  const identity = (
    <div>
      <MonoLabel className="text-ink-muted">{marker}</MonoLabel>
      {/* Deliberately NOT uppercased: CSS `text-transform: uppercase` turns
          "Kıvılcım" into "KIVILCIM", destroying the dotless-ı orthography
          that D-017 fixes as the project's primary display name. Display
          scale carries the emphasis instead of case. */}
      <h3 className="mt-3 font-display text-display-l tracking-display-l text-ink">
        <TextLink href={`/work/${project.slug}`}>{project.title}</TextLink>
      </h3>
      <p className="mt-3 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
        {project.categoryLabel}
      </p>
    </div>
  );

  const detail = (
    <div className={stacked ? "" : "mt-8"}>
      <p className="max-w-[34rem] font-display text-heading-m text-ink">{project.description}</p>
      {project.upstream && (
        // CONTENT_MODEL §9: upstream disclosure is mandatory in any rendering
        // of a fork-provenance project. Neither current scene is a fork, but
        // this component must not silently drop the rule if one ever is.
        <p className="mt-3 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          Fork of {project.upstream.name}
        </p>
      )}
      {project.tech.length > 0 && (
        <p className="mt-4 max-w-[34rem] font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          {project.tech.join(" · ")}
        </p>
      )}
    </div>
  );

  // The evidence plate. `Figure` is reused deliberately -- it is a ui
  // primitive, not the rejected card: it carries the approved mat/border/
  // corner-tick vocabulary, renders the asset's honest D-019 caption, and
  // keeps TASK-008's explicit-intrinsic-dimensions CLS fix. Only its scale
  // changes here.
  const plate = asset ? <Figure src={asset.src} alt={asset.alt} caption={asset.caption} /> : null;

  if (stacked) {
    return (
      <div className="w-full">
        {plate && <div className="w-full lg:w-[72%]">{plate}</div>}
        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">{identity}</div>
          <div className="lg:col-span-7">{detail}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
      <div className="lg:col-span-4">
        {identity}
        {detail}
      </div>
      {plate && <div className="lg:col-span-8">{plate}</div>}
    </div>
  );
}
