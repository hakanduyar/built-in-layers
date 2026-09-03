import type { ProjectFrontmatter } from "@/lib/content/schemas";

type Decision = NonNullable<ProjectFrontmatter["decisions"]>[number];

type DecisionListProps = {
  decisions: Decision[];
};

// IA section 8: Decisions — sourced from frontmatter data (CONTENT_MODEL §3
// table: "Decisions (from frontmatter data)"), rendered as a semantic list.
//
// V13 (Fable gate, finding D): each decision is one row of the page's
// 12-column grid -- the title on columns 1-4, the reasoning on 6-12 at the
// prose measure -- instead of a single 42rem stack in which six decisions
// read as one long column of undifferentiated text. The index number is
// presentation order (DESIGN_SYSTEM §8 item 1), not a fact about the work,
// and is hidden from assistive technology like every other index on the site.
// The trade-off, the part a reader actually weighs, is set in ink; the rest of
// the reasoning stays muted.
export function DecisionList({ decisions }: DecisionListProps) {
  return (
    <dl>
      {decisions.map((decision, index) => (
        <div
          key={decision.id}
          className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-line py-8 lg:grid-cols-12"
        >
          <dt className="lg:col-span-4">
            <span
              aria-hidden="true"
              className="block font-mono text-mono-meta tracking-mono-meta text-ink-muted"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-2 block font-display text-heading-m text-ink">
              {decision.title}
            </span>
          </dt>
          <dd className="max-w-[42rem] font-display text-body text-ink-muted lg:col-span-7 lg:col-start-6">
            <p>{decision.context}</p>
            <p className="mt-3">
              <strong className="font-semibold text-ink">Choice:</strong> {decision.choice}
            </p>
            {decision.alternatives.length > 0 && (
              <p className="mt-3">
                <strong className="font-semibold text-ink">Alternatives considered:</strong>{" "}
                {decision.alternatives.join(", ")}
              </p>
            )}
            <p className="mt-3 text-ink">
              <strong className="font-semibold">Trade-off:</strong> {decision.tradeoff}
            </p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
