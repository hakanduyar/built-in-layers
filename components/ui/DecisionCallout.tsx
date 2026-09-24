import type { ReactNode } from "react";

type DecisionCalloutProps = {
  title: string;
  children: ReactNode;
};

// ARCHITECTURE §6 restricted MDX component map: an inline decision
// highlight usable within case-study prose (distinct from
// components/project/DecisionList, which renders the full frontmatter
// decisions array as a structured list).
// `max-w-measure` (V13, M2): the callout is prose in a box; it takes the
// reading measure so its body line matches the paragraphs it sits between.
export function DecisionCallout({ title, children }: DecisionCalloutProps) {
  return (
    <div className="max-w-measure rounded-1 border border-line bg-soft-paper p-4">
      <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
        Decision
      </p>
      <p className="mt-2 font-display text-heading-m text-ink">{title}</p>
      <div className="mt-2 font-display text-body text-ink-muted">{children}</div>
    </div>
  );
}
