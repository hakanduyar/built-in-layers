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

  // FABLE GATE 1 (Q1) RETIRED THE SECOND SHOT. The pair existed as height
  // compensation -- its own comment said so: "no crop or swap can buy height
  // honestly. What CAN is a second real screenshot." That premise was wrong on
  // one point: a crop CAN buy height honestly when the frame window is chosen
  // so the caption's claim stays fully visible, and the gate chose exactly
  // that (see STACKED_FRAME_RATIO below). With the real fix in place the
  // second shot stopped being composition and became double-counting: two
  // near-identical light product surfaces stacked to bulk the group out --
  // "assembled, not architected", and precisely the filler the gate's own
  // acceptance criteria forbid. One dominant plate now carries the scene, and
  // the depth pairing the overlap used to gesture at is done by the thing that
  // actually has depth: the scene's world plane, at a different parallax rate.

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

  // FABLE GATE 1 (Q1a): the stacked plate's frame ratio. The number is derived,
  // not felt: at the accepted 76% plate width both scenes' media are fixed
  // fractions of the same px-capped scene measure, so ONE ratio makes the
  // stacked plate render exactly as tall as the approved Kıvılcım plate at
  // every viewport -- 886.7px wide / 520.6px tall at 1440x900, benchmark
  // height to the pixel. The price, accepted deliberately: 22.5% of the
  // screenshot's width leaves the frame. The window is anchored to the LEFT
  // edge because everything the caption claims -- "browsing drops with
  // waitlist status visible" -- lives there: the heading, all four status
  // filter tabs, and both cards carrying "In Waitlist" badges sit in the kept
  // region, and the third card running off the right edge is an ordinary
  // editorial crop, not a truncated claim. Applied only to the stacked
  // variant; the split (Kıvılcım) plate is frozen and takes no frame.
  const STACKED_FRAME_RATIO = 1.703;

  // The evidence plate. `Figure` is reused deliberately -- it is a ui
  // primitive, not the rejected card: it carries the approved mat/border/
  // corner-tick vocabulary, renders the asset's honest D-019 caption, and
  // keeps TASK-008's explicit-intrinsic-dimensions CLS fix. Only its scale
  // changes here.
  const plate = asset ? (
    <Figure
      src={asset.src}
      alt={asset.alt}
      caption={asset.caption}
      frameRatio={stacked ? STACKED_FRAME_RATIO : undefined}
      framePosition={stacked ? "left center" : undefined}
    />
  ) : null;

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
