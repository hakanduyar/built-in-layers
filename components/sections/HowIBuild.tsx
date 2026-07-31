import { SectionHeading } from "@/components/ui/SectionHeading";
import { howIBuildPrinciples } from "@/data/copy";

// IA section 7. Numbered principle list in 2 offset columns (desktop),
// single column below (DESIGN_SYSTEM §15).
export function HowIBuild() {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="06" label="How I build" />
      <h2 className="mt-4 font-display text-display-l uppercase text-ink">How I build</h2>

      <ol className="mt-8 lg:grid lg:grid-cols-2 lg:gap-x-12">
        {howIBuildPrinciples.map((principle, i) => (
          <li key={principle.title} className="border-t border-line py-6">
            <span
              aria-hidden="true"
              className="font-mono text-mono-meta tracking-mono-meta text-ink-muted"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-heading-m text-ink">{principle.title}</h3>
            <p className="mt-2 max-w-[42rem] font-display text-body text-ink-muted">
              {principle.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
