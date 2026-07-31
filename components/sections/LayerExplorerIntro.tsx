import { SectionHeading } from "@/components/ui/SectionHeading";
import { layerDefinitions } from "@/data/copy";

// IA section 4. Static (non-interactive) stacked SURFACE/FLOW/SYSTEM blocks.
// The interactive ARIA-tabs version is TASK-007 (revised D-006); until then
// this stacked rendering IS the shipped UI, and remains the no-JS fallback
// afterward -- all three blocks stay visible, ordered, labelled, readable.
export function LayerExplorerIntro() {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="03" label="Built in Layers" />
      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <h2 className="font-display text-heading-l text-ink lg:col-span-9 lg:col-start-1">
          Built in Layers
        </h2>

        <ol className="mt-8 max-w-[42rem] lg:col-span-9 lg:col-start-1">
          {layerDefinitions.map((layer) => (
            <li key={layer.label} className="border-t border-line py-6 first:border-t-0">
              <h3 className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
                {layer.label}
              </h3>
              <p className="mt-2 font-display text-body text-ink-muted">{layer.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-6 max-w-[42rem] font-mono text-mono-meta tracking-mono-meta text-ink-muted lg:col-span-9 lg:col-start-1">
          Full project layers plug in once case studies are published.
        </p>
      </div>
    </section>
  );
}
