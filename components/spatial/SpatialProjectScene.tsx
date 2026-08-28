import { Figure } from "@/components/ui/Figure";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { TextLink } from "@/components/ui/TextLink";
import type { ProjectFrontmatter, ProjectImageAssetType } from "@/lib/content/schemas";
import { representativeAsset } from "@/lib/spatial/systemPov";

// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
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

export function SpatialProjectScene({ project, variant }: SpatialProjectSceneProps) {
  // Shared with the system annotation (lib/spatial/systemPov.ts) so the scene
  // and the system can never disagree about which asset is the lead one --
  // the annotation names that asset's LAYER, and two copies of the selection
  // rule could drift apart and label the wrong one.
  const asset = representativeAsset(project);
  const stacked = variant === "stacked";

  // FINAL REMEDIATION -- THE SECOND SHOT. The stacked scene's evidence is a
  // 2.2:1 surface screenshot: at any viewport it is a wide, shallow strip, and
  // the owner's review of the V6.8 build named its vertical presence as the
  // scene's remaining weakness ("width is okay; height is insufficient").
  // Every real asset this project has is equally wide, so no crop or swap can
  // buy height honestly. What CAN is a second real screenshot: the next
  // real-screenshot the frontmatter registers after the representative one,
  // overlapped onto the primary's lower-right quarter. The pair adds ~30%
  // vertical extent from genuine distinct content (the browse surface plus the
  // product's core moment), and the overlap is the same depth grammar the
  // world plane uses -- evidence stacked in space, not a gallery. Selection is
  // data-driven; no slug is special-cased.
  const secondary = stacked
    ? (project.images.find(
        (image) => image.assetType === "real-screenshot" && image.src !== asset?.src,
      ) ?? null)
    : null;

  // The evidence type, and only that. V5 moves the route index into the
  // system's acquisition frame (§9): indexing scenes is the observing
  // system's job, and stating it in both places would duplicate it (§12).
  const marker = asset ? EVIDENCE_LABEL[asset.assetType] : null;

  // Arrival depth resolution (§14). `--depth-resolve` runs 0 (distant) -> 1
  // (framed) and is set by the camera's SceneFrame; it falls back to 1 in the
  // reduced-motion and no-JS trees, where the scene is simply already
  // resolved. Only two elements use it, they move a handful of pixels in
  // opposite directions, and both settle at their real layout position -- so
  // nothing functional ever rests somewhere the static design did not put it.
  const resolveUp = {
    transform: "translate3d(0, calc((1 - var(--depth-resolve, 1)) * -16px), 0)",
  } as const;
  const resolveDown = {
    transform: "translate3d(0, calc((1 - var(--depth-resolve, 1)) * 22px), 0)",
  } as const;

  const identity = (
    <div style={resolveUp}>
      {marker && <MonoLabel className="text-ink-muted">{marker}</MonoLabel>}
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

  // The `split` layout lets the evidence plate break the text column's
  // alignment edge (§16): it overhangs the block's right edge, so the scene
  // never reads as a rectangular webpage composition dropped into a larger
  // canvas. The plate is never bordered as a card and never gains a drop
  // shadow -- the asymmetry does the work.
  // The overhang is a SPATIAL device: it works because the camera's frame
  // clips it. In the reduced-motion / no-JS tree there is no camera, so the
  // same negative margin simply overflowed the document (31px at 1024, caught
  // by the responsive check). Driving it from a custom property the camera
  // sets means the overhang exists exactly where something can clip it, and
  // collapses to zero everywhere else.
  // `stacked` no longer overhangs (see the remediation note below): its
  // edge-breaking duty moved to the scene's world plane, which is the layer
  // that can actually break an edge WITH DEPTH instead of with a margin.
  const overhangRight = { marginRight: "var(--scene-overhang, 0px)" } as const;

  if (stacked) {
    // V6.7 (JOB 2) REBUILT THIS COMPOSITION. Measured against Kivilcim at 1440x900,
    // the V6.6 stacked layout had four faults and all four were positional:
    //
    //   - the identity landed at 72% of the frame height (Kivilcim's sits at 39%),
    //     so the thing the reader is meant to read was in the bottom quarter;
    //   - the name and the description were in columns 1-5 and 7-12 of a 12-column
    //     grid with the plate finished above them, so they read as two orphans
    //     either side of a void rather than as one identity;
    //   - the plate was 74% wide, leaving a ~300px dead margin down the right of
    //     the frame that nothing ever occupied;
    //   - and the system annotation sat at the top-left of the frame with the
    //     plate's left edge somewhere else entirely, so the scene had no shared
    //     alignment edge at all.
    //
    // The order is now identity-then-evidence, which is a THIRD arrangement rather
    // than a copy of Kivilcim's: Kivilcim is a horizontal split with the giant ghost
    // word behind it and the plate beside the text; this is a vertical register --
    // one identity line across the top, then the evidence running beneath it.
    //
    // V6.8 DROPSPOT REMEDIATION recomposed the evidence's proportions. Measured at
    // 1440x900 against the approved Kivilcim focus frame, the V6.8 review build had
    // the plate at 96% + a left overhang: 1133px of media (79% of the viewport)
    // whose left edge sat 9px from the frame edge, whose mass landed in the bottom-
    // left quadrant with the title orphaned in the top-left corner, and which buried
    // the scene's world plane almost entirely on arrival. The human review's verdict
    // was exact: assembled, not architected.
    //
    // The fix is registration, not decoration:
    //   - the evidence drops to 76% and LOCKS to the identity column's left edge,
    //     so the name and its proof stand on one shared registration line with real
    //     paper margins on the other three sides (the 1400x637 screenshot is a wide,
    //     shallow surface -- contained, it reads as evidence acquired rather than a
    //     page section scrolled into view);
    //   - the freed right third of the frame belongs to the scene's world plane
    //     (SpatialCamera places it across the media's bottom-right quarter), so the
    //     edge-breaking that §16 asks for is now done by a surface at a DIFFERENT
    //     DEPTH crossing the composition, instead of by a margin on the media.
    return (
      <div className="w-full">
        {/* One identity row. `items-end` puts the name and the description on a
            shared baseline, so they are a single object rather than two blocks. */}
        {/* `lg:pt-7` clears the system annotation, which SceneFrame places above the
            block. In the split variant the identity starts far enough down that they
            never meet; here it is the first thing in the block, and at 1440 the two
            were 25px apart. */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pt-7">
          <div className="lg:col-span-5">{identity}</div>
          <div className="lg:col-span-6 lg:col-start-7">{detail}</div>
        </div>
        {plate && (
          <div className="relative mt-7 w-full" style={resolveDown}>
            <div className="w-full lg:w-[76%] lg:[&_figcaption]:max-w-[60%]">{plate}</div>
            {secondary && (
              // The pair's geometry, in the scene's own fractions so it holds at
              // every viewport: the detail shot takes the right half-measure,
              // registers its right edge on the scene block's right edge, and
              // overlaps the primary's lower-right quarter -- nearer evidence in
              // front of farther evidence, extending the group downward. Desktop
              // only: the mobile scene keeps the single plate (§30 keeps mobile
              // depth treatment reduced, and its vertical budget is fixed).
              <div className="absolute left-[48%] top-[42%] hidden w-[48%] lg:block">
                <Figure src={secondary.src} alt={secondary.alt} caption={secondary.caption} />
              </div>
            )}
            {/* Reserves the pair's downward extension in the block's own box, so
                the scene's vertical centre accounts for the full group. */}
            {secondary && <div aria-hidden="true" className="hidden lg:block lg:pb-[10%]" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid w-full gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
      <div className="lg:col-span-4">
        {identity}
        {detail}
      </div>
      {plate && (
        <div className="lg:col-span-8" style={{ ...resolveDown, ...overhangRight }}>
          {plate}
        </div>
      )}
    </div>
  );
}
