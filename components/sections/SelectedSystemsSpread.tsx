import type { ReactNode } from "react";
import { displayTitle } from "@/components/project/ProjectCard";
import { Figure } from "@/components/ui/Figure";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import type { ProjectFrontmatter, ProjectImageAssetType } from "@/lib/content/schemas";

type SelectedSystemsSpreadProps = {
  projects: ProjectFrontmatter[];
};

// Layered Editorial Systems homepage prototype: reads the exact same real,
// loader-fed ProjectFrontmatter objects ProjectCard/`/work` already use --
// no second data source, no slug->copy map, no invented text anywhere in
// this file. What changes is presentation only: instead of four instances
// of one card template, each project gets a bespoke composition sized to
// how much real evidence actually exists for it (audit finding: "evidence
// earns space"). /work and ProjectCard itself are untouched -- this
// component is homepage-only, exactly as the prototype brief allows.
//
// Publication order (D-016) is preserved exactly -- this maps over the
// incoming `projects` array in the order the loader already returns it
// (Kıvılcım, DropSpot, JointLedger, Professional Systems), picking a
// bespoke layout per slug. Visual *weight* is unequal by design; DOM/reading
// *order* is not touched.
//
// PROTOTYPE V2: every renderer below still emits exactly one <img> per
// project (tests/e2e/home.spec.ts asserts this literally) -- V2's "make
// each composition more distinct" instruction is met entirely through
// layout, type, and real-data-driven labels around that one image, never a
// second image.
const RENDERERS: Record<string, (project: ProjectFrontmatter, delayMs: number) => ReactNode> = {
  kivilcim: renderKivilcim,
  dropspot: renderDropspot,
  jointledger: renderJointledger,
  "professional-systems": renderProfessional,
};

// D-019's existing assetType enum, made visible as a real mono tag instead
// of staying implicit in alt text -- a formatting transform of already-typed
// data, not a new claim.
const ASSET_TYPE_LABEL: Record<ProjectImageAssetType, string> = {
  "real-screenshot": "Real screenshot",
  "verified-diagram": "Verified diagram",
  "provisional-illustration": "Provisional illustration",
};

export function SelectedSystemsSpread({ projects }: SelectedSystemsSpreadProps) {
  return (
    <ul className="mt-12">
      {projects.map((project, index) => {
        const render = RENDERERS[project.slug];
        return (
          <li key={project.slug} className="border-t border-line pt-12 first:border-t-0">
            {render ? render(project, index * 60) : renderFallback(project, index * 60)}
          </li>
        );
      })}
    </ul>
  );
}

// DropSpot: the strongest evidence treatment on the page -- the one project
// with real, audited product screenshots. Image renders at its natural full
// column width (no max-w cap, unlike ProjectCard's thumbnail), well beyond
// a card thumbnail's size but never past the container (DESIGN_SYSTEM §6:
// "images never bleed beyond the container in MVP" -- the one deliberate,
// disclosed exception is the mobile-only bleed directly below).
//
// PROTOTYPE V2: the evidence tag now pairs with a §8-vocabulary-item-4
// signal dot ("dots that indicate state... use --signal-ui") instead of
// standing alone -- it's reporting a real classification (D-019
// assetType), not decoration, so it earns the state-indicator token, not
// the purely-decorative one. Below md, the screenshot bleeds to the
// viewport edge (`-mx-4`, exactly cancelling Container's mobile `px-4`) so
// width alone isn't the only thing carrying DropSpot's mobile dominance --
// verified to introduce no horizontal overflow at 320/375px.
function renderDropspot(project: ProjectFrontmatter, delayMs: number) {
  const image = project.images[0];
  return (
    <Reveal delayMs={delayMs}>
      <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-6">
        <div className="lg:col-span-7 lg:col-start-1">
          <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
          <h3 className="mt-2 font-display text-display-l uppercase text-ink">
            <TextLink href={`/work/${project.slug}`}>{displayTitle(project)}</TextLink>
          </h3>
          <p className="mt-3 max-w-[36rem] font-display text-body-l text-ink-muted">
            {project.description}
          </p>
        </div>
        <div className="mt-6 lg:col-span-5 lg:col-start-8 lg:mt-0 lg:text-right">
          {image && (
            <span className="inline-flex items-center gap-2 font-mono text-mono-meta tracking-mono-meta text-signal-text">
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal-ui" />
              {ASSET_TYPE_LABEL[image.assetType]}
            </span>
          )}
          {project.tech.length > 0 && (
            <p className="mt-2 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
              {project.tech.join(" · ")}
            </p>
          )}
        </div>
      </div>
      {image && (
        <div className="-mx-4 mt-10 md:mx-0 lg:mt-8">
          <Figure src={image.src} alt={image.alt} caption={image.caption} />
        </div>
      )}
    </Reveal>
  );
}

// Kıvılcım: a system-map moment, not a text-left/image-right row. Its image
// is an honestly-labelled illustration, not evidence, so it never carries
// an assetType tag the way DropSpot does -- size here comes from
// conceptual relevance (the product model), not evidence status, exactly as
// the prototype brief distinguishes them.
//
// PROTOTYPE V2: title and description swap proportions versus DropSpot's
// row (5/7 instead of 7/5) and the image drops out of the row entirely to
// become a full-width plate below -- two visibly different compositional
// grammars, not the same row scaled differently. An earlier draft added an
// aria-hidden "SYSTEM MAP" label above the plate; the V2 adversarial review
// ("could 30% of the mono annotations disappear with no loss of meaning?")
// concluded it added no fact the Figure's own caption didn't already state,
// so it was cut rather than kept for decoration.
function renderKivilcim(project: ProjectFrontmatter, delayMs: number) {
  const image = project.images[0];
  return (
    <Reveal delayMs={delayMs}>
      <div className="lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-6">
        <div className="lg:col-span-5 lg:col-start-1">
          <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
          <h3 className="mt-2 font-display text-heading-l uppercase text-ink">
            <TextLink href={`/work/${project.slug}`}>{displayTitle(project)}</TextLink>
          </h3>
        </div>
        <p className="mt-3 font-display text-body text-ink-muted lg:col-span-6 lg:col-start-7 lg:mt-0">
          {project.description}
        </p>
      </div>
      {project.tech.length > 0 && (
        <p className="mt-4 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          {project.tech.join(" · ")}
        </p>
      )}
      {image && (
        <div className="mt-8 lg:mt-10">
          <Figure src={image.src} alt={image.alt} caption={image.caption} />
        </div>
      )}
    </Reveal>
  );
}

// JointLedger: the weakest of the three substantive project presentations
// through V3, which still read as "label + rule + small diagram" beside a
// mostly-flat identity column, and (per the owner's V3 screenshot) visually
// lighter/weaker than Kıvılcım and DropSpot -- not because of opacity (none
// was ever used here) but because so much of the column was small muted
// mono text with no real geometry.
//
// PROTOTYPE V4: the upstream/extension relationship now drives the layout
// directly, as three real depth tiers *inside* the identity column, reusing
// the exact offset-as-depth idiom (indent + escalating rail color) Built in
// Layers already established -- so this card visibly demonstrates the
// site's own "layer" concept applied to itself, not just describes it:
//   1. UPSTREAM (quietest, `border-line`, no indent, desktop-only -- see
//      the mobile annotation audit below) -- deliberately the *relation*,
//      not the specific name a second time: naming it twice
//      ("EZBOOKKEEPING" here, "Fork of ezBookkeeping" two lines down) broke
//      tests/e2e/home.spec.ts's `getByText("ezBookkeeping")` with a real
//      strict-mode duplicate match in V3, caught by the Playwright run.
//   2. Identity (`border-ink-muted`, one indent step) -- title stays full
//      `text-ink` contrast (never faded -- hierarchy here comes from scale/
//      indent/rail, never opacity, per the V4 brief's explicit instruction),
//      description, the CONTENT_MODEL §9-mandatory "Fork of..." disclosure,
//      tech.
//   3. System (`border-signal-ui`, deepest indent) -- the
//      "BOOK / MEMBER / PERMISSIONS" tag, still the same formatting
//      transform of the approved `upstream.relationship` text as V3, not
//      new wording.
// The diagram column also widens (col-start-6/col-span-7, was col-start-7/
// col-span-6) -- not "just enlarging the diagram" on its own terms, but
// closing a real one-column gap V3 left unused between the two columns,
// a direct consequence of the identity column's new internal geometry
// rather than an arbitrary size bump.
//
// Mobile annotation audit (V4 brief §17-19): of this card's ~5 mono/meta
// lines, the `UPSTREAM` tier marker was the one genuinely decorative/
// redundant item -- aria-hidden already, and on mobile (no room to express
// three spatial depths anyway) it added density without adding legibility
// the "Fork of ezBookkeeping" line one row below doesn't already state
// accessibly. Hidden below `lg`. Every other mono line here states a fact
// stated nowhere else on the card (category, disclosure, tech, the new
// data model) and was kept.
function renderJointledger(project: ProjectFrontmatter, delayMs: number) {
  const image = project.images[0];
  return (
    <Reveal delayMs={delayMs}>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5 lg:col-start-1">
          {project.upstream && (
            <p
              aria-hidden="true"
              className="hidden border-l-2 border-line pl-4 font-mono text-mono-meta tracking-mono-meta text-ink-muted lg:block"
            >
              UPSTREAM
            </p>
          )}
          <div className="border-l-2 border-ink-muted pl-4 lg:mt-3 lg:pl-8">
            <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
            <h3 className="mt-2 font-display text-heading-l uppercase text-ink">
              <TextLink href={`/work/${project.slug}`}>{displayTitle(project)}</TextLink>
            </h3>
            <p className="mt-3 font-display text-body text-ink-muted">{project.description}</p>
            {project.upstream && (
              <p className="mt-2 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
                Fork of {project.upstream.name}
              </p>
            )}
            {project.tech.length > 0 && (
              <p className="mt-3 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
                {project.tech.join(" · ")}
              </p>
            )}
          </div>
          <div className="mt-4 border-l-2 border-signal-ui pl-4 lg:pl-16">
            <span
              aria-hidden="true"
              className="flex items-center gap-2 font-mono text-mono-meta tracking-mono-meta text-signal-text"
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal-ui" />
              BOOK / MEMBER / PERMISSIONS
            </span>
          </div>
        </div>
        {image && (
          <div className="mt-8 border-t-2 border-ink pt-4 lg:col-span-7 lg:col-start-6 lg:mt-0">
            <Figure src={image.src} alt={image.alt} caption={image.caption} />
          </div>
        )}
      </div>
    </Reveal>
  );
}

// Professional Systems: deliberately restrained -- one flat plane, no grid
// split, a small image, matching its genuinely limited public evidence.
//
// PROTOTYPE V2: rather than invent confidentiality copy ("PUBLIC EVIDENCE
// LIMITED" or similar), this surfaces the project's own real, already-
// approved `contribution` field -- itself an honest statement about
// withheld detail ("I will share my specific role and contributions here
// once the professional details are approved for publication.") -- as a
// small mono annotation. Real typed data, not a new phrase; the restraint
// the brief asked for comes from using less layout, not from writing new
// words.
function renderProfessional(project: ProjectFrontmatter, delayMs: number) {
  const image = project.images[0];
  return (
    <Reveal delayMs={delayMs}>
      <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
      <h3 className="mt-2 font-display text-heading-m text-ink">
        <TextLink href={`/work/${project.slug}`}>{displayTitle(project)}</TextLink>
      </h3>
      <p className="mt-2 max-w-[36rem] font-display text-body text-ink-muted">
        {project.description}
      </p>
      {project.contribution && (
        <p className="mt-3 max-w-[32rem] font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          {project.contribution}
        </p>
      )}
      {image && (
        <div className="mt-4 max-w-xs">
          <Figure src={image.src} alt={image.alt} caption={image.caption} />
        </div>
      )}
    </Reveal>
  );
}

// Any future featured project without a bespoke treatment yet falls back to
// the same layout ProjectCard already uses, so the section never silently
// drops a published project while a real composition is designed for it.
function renderFallback(project: ProjectFrontmatter, delayMs: number) {
  const image = project.images[0];
  return (
    <Reveal delayMs={delayMs}>
      <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
      <h3 className="mt-2 font-display text-heading-m text-ink">
        <TextLink href={`/work/${project.slug}`}>{displayTitle(project)}</TextLink>
      </h3>
      <p className="mt-2 max-w-[42rem] font-display text-body text-ink-muted">
        {project.description}
      </p>
      {image && (
        <div className="mt-4 max-w-xs">
          <Figure src={image.src} alt={image.alt} caption={image.caption} />
        </div>
      )}
    </Reveal>
  );
}
