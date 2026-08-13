import { LayerExplorer } from "@/components/project/LayerExplorer";
import { ExposedGridLines } from "@/components/ui/ExposedGridLines";
import { LayerRegistrationMark } from "@/components/ui/LayerRegistrationMark";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import { layerDefinitions } from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type LayerExplorerIntroProps = {
  previewProject?: ProjectFrontmatter;
};

// IA section 4. The one-line Surface/Flow/System definitions stay as a
// quick, scannable explanation of the concept; below them, TASK-007 wires
// in a real, published project's real layer content through the same
// interactive explorer used on case-study pages -- previously this section
// could only say "layers plug in once case studies are published"; now
// that at least one is, it does. Falls back to the original static/pending
// framing if no project with real layers exists (kept honest, never
// fabricated). Server-rendered; LayerExplorer itself is the client
// boundary and remains the stacked, no-JS-safe rendering until hydration.
//
// PROTOTYPE V3 -- TASK-007 content decision (re-read for this prototype,
// verbatim from docs/tasks/TASK-007-motion-layer-explorer.md): the task
// says the explorer must "preview a featured project's real layers... via
// the explorer," and its acceptance criteria govern interaction/
// accessibility/motion correctness -- nothing in the task, its acceptance
// criteria, or its completion report requires the *complete* compiled MDX
// case-study prose specifically. V1/V2 fed it the same `getProjectLayers()`
// MDX compile the case-study page uses, which is real and truthful but not
// actually a "preview" -- it's the entire case study, duplicated onto the
// homepage. CONTENT_MODEL's schema already has an unused, purpose-built
// field for exactly this: `layers.<layer>.summary`, a real, already-
// approved one-line summary per layer that ships in every full/short-depth
// project's frontmatter today (confirmed: zero existing references to it
// anywhere in the codebase before this change -- real content, sitting
// unused). This component now builds the live preview from those three
// summary strings directly off `previewProject` -- no invented copy, no
// hard-coded per-project array, no second content source, and `app/page.tsx`
// no longer needs `getProjectLayers`'s async MDX compile at all for the
// homepage. The full prose remains exactly where it was: the linked case
// study. This also directly fixes the V2 review finding that Built in
// Layers "becomes a long prose wall" on mobile -- a one-line summary can't.
//
// PROTOTYPE V3 -- recomposition: the owner's review named this V2's
// weakest section: definitions read too small, the desktop canvas sat
// mostly empty, and the live panel still felt like a documentation box.
// Bumped labels to heading-m mono, body copy to body-l, widened columns and
// the preview panel, and marked the layout's real anchors with
// `ExposedGridLines` fragments instead of a continuous field.
//
// PROTOTYPE V4 (final convergence pass): the owner's review of V3 called
// this "too skeletal" -- correct direction, insufficient scale. Two more
// steps on top of V3, not a new layout:
//
// - Labels bumped again, heading-m -> heading-l mono (one more clear visual
//   step, per the brief's explicit instruction) -- "SYSTEM" specifically
//   can now read as a real heading, not metadata, without changing its
//   family (still IBM Plex Mono; the size carries the weight, not a family
//   change).
// - Staircase offsets widened from steps of 2 columns (1/3/5) to steps of 3
//   (1/4/7) -- matching the Hero's own "Hakan"(1)->"Duyar"(4) offset
//   exactly, so "one step of depth" reads as the same visual unit
//   everywhere on the page, not a different amount per section. The live
//   preview panel's column-start moves from 6 to 7 to match System's new
//   column exactly -- it now sits directly under System's own left edge,
//   reading as "the continuation of the selected depth," the brief's own
//   framing, instead of an independently-positioned block one column over.
// - `ExposedGridLines` fragments follow the two real remaining anchors: 4
//   (Flow) and 7 (System and the preview panel, now the same column).
//
// LayerExplorer's own interaction contract, ARIA structure, keyboard
// behavior, no-JS output, and reduced-motion behavior are completely
// unchanged -- this component still only ever changes the plane it visually
// sits inside and the real content it's handed.
const LAYER_LAYOUT: Record<string, { rail: string; indent: string; position: string }> = {
  Surface: {
    rail: "border-line",
    indent: "pl-0",
    position: "lg:col-start-1 lg:row-start-1 lg:col-span-9 lg:pl-6",
  },
  Flow: {
    rail: "border-ink-muted",
    indent: "pl-8",
    position: "lg:col-start-4 lg:row-start-2 lg:col-span-9 lg:pl-6",
  },
  System: {
    rail: "border-ink",
    indent: "pl-16",
    position: "lg:col-start-7 lg:row-start-3 lg:col-span-6 lg:pl-6",
  },
};

export function LayerExplorerIntro({ previewProject }: LayerExplorerIntroProps) {
  const summary = previewProject?.layers;

  return (
    <section className="relative mt-16 lg:mt-24">
      <ExposedGridLines lines={[4, 7]} />
      <SectionHeading index="03" label="Built in Layers" />
      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-x-6">
        <div className="flex items-end justify-between lg:col-span-9 lg:col-start-1">
          <h2 className="font-display text-display-l uppercase text-ink">Built in Layers</h2>
          <LayerRegistrationMark className="hidden shrink-0 lg:flex" />
        </div>

        <Reveal className="mt-10 lg:col-span-12 lg:col-start-1 lg:row-start-2 lg:mt-16">
          <ol className="lg:grid lg:grid-cols-12 lg:gap-x-6">
            {layerDefinitions.map((layer) => {
              const layout = LAYER_LAYOUT[layer.label];
              return (
                <li
                  key={layer.label}
                  className={`max-w-[36rem] border-l-2 border-t border-line py-8 first:border-t-0 lg:border-t-0 lg:py-0 ${layout?.rail ?? "border-line"} ${layout?.indent ?? "pl-0"} ${layout?.position ?? ""}`}
                >
                  <h3 className="font-mono text-heading-l tracking-mono-label uppercase text-ink">
                    {layer.label}
                  </h3>
                  {layer.label === "Flow" ? (
                    <p className="mt-3 font-serif text-body-l italic text-ink">{layer.body}</p>
                  ) : layer.label === "System" ? (
                    <p className="mt-3 font-mono text-body-l text-ink-muted">{layer.body}</p>
                  ) : (
                    <p className="mt-3 font-display text-body-l text-ink-muted">{layer.body}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </Reveal>

        {previewProject && summary ? (
          <Reveal className="mt-16 border-t-2 border-ink pt-4 lg:col-span-6 lg:col-start-7 lg:row-start-3 lg:mt-8">
            <p className="font-mono text-mono-meta tracking-mono-meta text-ink-muted">
              Previewing real layers from{" "}
              <TextLink href={`/work/${previewProject.slug}`}>{previewProject.title}</TextLink>.
            </p>
            <div className="mt-6">
              <LayerExplorer
                layers={{
                  surface: (
                    <p className="font-display text-body-l text-ink">{summary.surface.summary}</p>
                  ),
                  flow: (
                    <p className="font-serif text-body-l italic text-ink">{summary.flow.summary}</p>
                  ),
                  system: (
                    <p className="font-mono text-body-l text-ink">{summary.system.summary}</p>
                  ),
                }}
              />
            </div>
          </Reveal>
        ) : (
          <p className="mt-10 max-w-[36rem] font-mono text-mono-meta tracking-mono-meta text-ink-muted lg:col-span-6 lg:col-start-7 lg:row-start-3 lg:mt-8">
            Full project layers plug in once case studies are published.
          </p>
        )}
      </div>
    </section>
  );
}
