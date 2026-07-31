import { heroPrimaryLine, homePositioning, homeWordmark } from "@/data/copy";

// IA section 2. The only h1 on the page. Name/title/primary line sit as
// siblings, not nested in the h1, so the accessible heading stays the exact
// name ("Hakan Duyar") -- matching CLAUDE.md §4 and keeping one clear h1.
// Meta index ("01") is decorative-only vocabulary (DESIGN_SYSTEM §8 item 1),
// not fabricated content.
export function Hero() {
  return (
    <section className="grid gap-6 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-9 lg:col-start-1">
        <h1 className="font-display text-display-xl tracking-display-xl uppercase text-ink">
          {homeWordmark}
        </h1>
        <p className="mt-4 font-display text-heading-m text-ink-muted">{homePositioning}</p>
        <p className="mt-6 font-display text-heading-l tracking-heading-l uppercase text-ink">
          {heroPrimaryLine}
        </p>
      </div>

      <div aria-hidden="true" className="lg:col-span-3 lg:col-start-10 lg:self-start lg:text-right">
        <span className="font-mono text-mono-meta tracking-mono-meta text-ink-muted">01</span>
      </div>
    </section>
  );
}
