import Link from "next/link";
import { Figure } from "@/components/ui/Figure";
import { MonoLabel } from "@/components/ui/MonoLabel";
import type { ProjectFrontmatter, ProjectImageAssetType } from "@/lib/content/schemas";
import { representativeAsset } from "@/lib/spatial/systemPov";
import { cn } from "@/lib/utils/cn";

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
   * Four genuinely different editorial compositions, so the four project
   * scenes never read as one repeated template (DESIGN_SYSTEM §17 crit. 4):
   *
   *   `foundation`  the systemic/meta layer — one identity line, then the
   *                 widest plate on the route. Used by Software Factory: the
   *                 diagram IS the argument, so it takes the room.
   *   `split`       evidence beside the text, plate right (Kıvılcım).
   *   `counter`     the mirror of split — plate LEFT, identity right. The
   *                 route has bent past its midpoint by JointLedger, and the
   *                 composition answers by leading with evidence from the
   *                 other side.
   *   `stacked`     identity row over a dominant full-width evidence group
   *                 (DropSpot).
   */
  variant: "foundation" | "split" | "counter" | "stacked";
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

  // V7 (OWNER DECISION) RESTORED THE SECOND SHOT AND RETIRED THE CROP. Gate 1
  // had cropped the stacked plate to the benchmark ratio and removed the pair;
  // the owner's review reversed both: the evidence should carry its earlier
  // taller, longer presence — the full uncropped surface plus the second real
  // screenshot extending the group downward — and the crop's 22.5% loss was
  // not an acceptable price. Selection stays data-driven: the next registered
  // real-screenshot after the representative one, no slug special-cased.
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

  /**
   * V9 (§16) -- THE CASE-STUDY AFFORDANCE, AND WHY IT IS INSIDE THE TITLE'S OWN
   * LINK RATHER THAN BESIDE IT.
   *
   * The scene's title has always been a link to the project's route, but a
   * linked heading does not answer the question the brief actually asks -- "how
   * do I open this project?" -- because nothing on screen says the title is an
   * action. So the action is now STATED, as a register line under the title.
   *
   * It is rendered INSIDE the same anchor, `aria-hidden`, rather than as a
   * second link. That is a deliberate accessibility decision, not a shortcut:
   * a second link to the same destination would add a duplicate tab stop and a
   * second entry to every screen-reader link list for one project. One link, one
   * tab stop, one accessible name (the project's title), and a visible cue that
   * belongs to it. Keyboard and touch both get the whole composition as one
   * target, and `SceneFrame`'s focus handler already brings the camera to a
   * scene when that link is tabbed to.
   *
   * THE LABEL IS DERIVED FROM CONTENT DEPTH, so it can never overclaim. A
   * `full` or `short` entry has layers and decisions -- a real case study -- and
   * says so. A `preview` entry has a real published route but no case study yet,
   * and says "Open system" instead. Nothing links to a destination that does not
   * exist: every one of these routes is generated from published content.
   */
  const affordanceLabel =
    project.depth === "full" || project.depth === "short" ? "Open case study" : "Open system";

  const identity = (
    <div style={resolveUp}>
      {/* V9 (§5, §16): evidence type and classification now share one register
          line above the title, so the block reads identity -> classification ->
          action instead of interleaving the two. */}
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        {marker && <MonoLabel className="text-ink-muted">{marker}</MonoLabel>}
        <span className="font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
          {project.categoryLabel}
        </span>
      </div>
      {/* Deliberately NOT uppercased: CSS `text-transform: uppercase` turns
          "Kıvılcım" into "KIVILCIM", destroying the dotless-ı orthography
          that D-017 fixes as the project's primary display name. Display
          scale carries the emphasis instead of case. */}
      {/* The display scale lives on the HEADING, not on a span inside it. An
          earlier pass put it on the inner span and the `h3` itself computed to
          the inherited 16px — which the "titles are not microtext" contract
          caught immediately, because that is exactly the element it measures. */}
      <h3
        className={cn(
          "mt-4 font-display tracking-display-l text-ink",
          // V9 (§5): the flagship's title is the one place hierarchy is carried
          // by scale. Only the foundation variant gets it.
          variant === "foundation" ? "text-display-xl" : "text-display-l",
        )}
      >
        <Link href={`/work/${project.slug}`} className="group/open block max-w-fit">
          <span className="block underline decoration-1 underline-offset-[5px] transition-[color,text-decoration-thickness] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover/open:text-signal-text group-hover/open:decoration-2">
            {project.title}
          </span>
          <span
            aria-hidden="true"
            className="mt-4 inline-flex items-center gap-3 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover/open:text-signal-text"
          >
            {/* The world's own register mark, extending on hover: the route
                reaching toward the destination rather than a button. */}
            <span className="block h-px w-6 bg-ink opacity-50 transition-[width] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover/open:w-10" />
            {affordanceLabel}
          </span>
        </Link>
      </h3>
    </div>
  );

  const detail = (
    <div className={stacked || variant === "foundation" ? "" : "mt-8"}>
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
  // changes here. V7: no frame ratio anywhere — the owner reversed the Gate 1
  // crop, so every plate shows its full uncropped asset.
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
            {/* V7: 76% -> 84%. The owner reversed the crop, so height comes
                from the honest source again — width. At 84% of the px-capped
                block the uncropped 2.2:1 surface renders ~449px tall at
                1440x900 (was 403 at 76%), and the group below extends it. */}
            <div className="w-full lg:w-[84%] lg:[&_figcaption]:max-w-[56%]">{plate}</div>
            {secondary && (
              // The pair's geometry, in the scene's own fractions so it holds
              // at every viewport: the detail shot registers its right edge on
              // the scene block's right edge and overlaps the primary's
              // lower-right quarter -- nearer evidence in front of farther
              // evidence, extending the group downward. V7 sizes it up with
              // the primary (44% -> 52%) so the pair reads as two real
              // surfaces, not a stamp on a plate. Desktop only: the mobile
              // scene keeps the single plate (§30), and its vertical budget
              // is fixed.
              <div className="absolute left-[48%] top-[46%] hidden w-[52%] lg:block">
                <Figure src={secondary.src} alt={secondary.alt} caption={secondary.caption} />
              </div>
            )}
            {/* Reserves the pair's downward extension in the block's own box,
                so the scene's vertical centre accounts for the full group. */}
            {secondary && <div aria-hidden="true" className="hidden lg:block lg:pb-[13%]" />}
          </div>
        )}
      </div>
    );
  }

  if (variant === "foundation") {
    // V7 — SOFTWARE FACTORY. The systemic layer the rest of the journey stands
    // on, and the composition says so structurally rather than with any badge:
    // one full-measure identity line, then the WIDEST plate on the route — the
    // delivery-loop diagram at 92% of the block, wider than any evidence that
    // follows it. Nothing else competes in the frame; the system is the hero.
    return (
      <div className="w-full">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pt-7">
          <div className="lg:col-span-5">{identity}</div>
          <div className="lg:col-span-6 lg:col-start-7">{detail}</div>
        </div>
        {plate && (
          <div className="relative mt-7 w-full" style={resolveDown}>
            {/* V8 -- THE ONE PIECE OF EVIDENCE THAT ALSO NEEDS A HEIGHT BUDGET.
                The world-fit scale (lib/spatial/worldFit.ts) brought every scene
                in the owner's matrix inside its frame except this one: Software
                Factory is the tallest composition on the route, and at 1366x768
                its plate still overhung by 34px -- the diagram itself fit, the
                figure's caption and border did not, which is a D-019 asset-
                honesty label being cut off rather than a cosmetic overhang.

                A plate's height is its width divided by the asset's aspect
                ratio, so the only way to give height back is to take width. The
                rule is therefore stated where the cause is -- "on a frame this
                short, the widest plate on the route is not 76% of the block" --
                rather than as another scale factor on top of the world's. It
                binds below 800px of viewport height and nowhere else, so every
                frame the owner approved is untouched. */}
            <div className="w-full lg:w-[76%] lg:[&_figcaption]:max-w-[56%] lg:[@media(max-height:800px)]:w-[66%]">
              {plate}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "counter") {
    // V7 — JOINTLEDGER. The mirror of `split`: evidence leads from the LEFT,
    // identity stands to the right. By this point the route has crossed its
    // midpoint; the fourth composition answering from the other side is what
    // keeps four project scenes from reading as one template stamped four
    // times. The plate overhangs the block's LEFT edge — the same spatial
    // device as split's right overhang, clipped by the same camera frame.
    return (
      <div className="grid w-full gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        {/* V10 (§A) -- THE ONE OVERHANG THAT POINTS AT ITS NEIGHBOUR.
            Kıvılcım's `split` plate overhangs its block's RIGHT edge; this
            mirrored plate overhung the LEFT. On the route those two edges face
            each other, so the pair's bleed was cumulative and inward -- and it
            was measured as the tightest gap in the whole world: 34.5px of
            clear paper between Kıvılcım's ink and JointLedger's at 1366x768,
            against 82px for every other pair. Not a scale artefact: it is the
            same 34.5px whichever way the fit moves, because the overhang and
            the block scale together.

            Zeroing it recovers that pair to ~85px at 1366 and ~150px at 1920 —
            more clearance than a world-wide spacing change would have bought,
            for one property, with no route geometry touched. The MIRROR is
            untouched: evidence still leads from the left and identity still
            answers from the right, which is what makes this composition the
            counter to `split`. Only the bleed past the block edge goes, and it
            goes from the one scene where it collided with a neighbour. */}
        {plate && (
          <div className="order-2 lg:order-1 lg:col-span-8" style={resolveDown}>
            {plate}
          </div>
        )}
        <div className="order-1 lg:order-2 lg:col-span-4">
          {identity}
          {detail}
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
      {plate && (
        <div className="lg:col-span-8" style={{ ...resolveDown, ...overhangRight }}>
          {plate}
        </div>
      )}
    </div>
  );
}
