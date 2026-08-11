import { LayerExplorer } from "@/components/project/LayerExplorer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import { layerDefinitions } from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";
import type { ProjectLayers } from "@/lib/content/work";

type LayerExplorerIntroProps = {
  previewProject?: ProjectFrontmatter;
  previewLayers?: ProjectLayers | null;
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
export function LayerExplorerIntro({ previewProject, previewLayers }: LayerExplorerIntroProps) {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="03" label="Built in Layers" />
      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <h2 className="font-display text-heading-l text-ink lg:col-span-9 lg:col-start-1">
          Built in Layers
        </h2>

        <Reveal className="mt-8 max-w-[42rem] lg:col-span-9 lg:col-start-1">
          <ol>
            {layerDefinitions.map((layer) => (
              <li key={layer.label} className="border-t border-line py-6 first:border-t-0">
                <h3 className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
                  {layer.label}
                </h3>
                <p className="mt-2 font-display text-body text-ink-muted">{layer.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {previewProject && previewLayers ? (
          <Reveal className="mt-12 lg:col-span-9 lg:col-start-1">
            <p className="font-mono text-mono-meta tracking-mono-meta text-ink-muted">
              Previewing real layers from{" "}
              <TextLink href={`/work/${previewProject.slug}`}>{previewProject.title}</TextLink>.
            </p>
            <div className="mt-6">
              <LayerExplorer layers={previewLayers} />
            </div>
          </Reveal>
        ) : (
          <p className="mt-6 max-w-[42rem] font-mono text-mono-meta tracking-mono-meta text-ink-muted lg:col-span-9 lg:col-start-1">
            Full project layers plug in once case studies are published.
          </p>
        )}
      </div>
    </section>
  );
}
