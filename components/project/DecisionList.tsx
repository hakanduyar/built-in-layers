import type { ProjectFrontmatter } from "@/lib/content/schemas";

type Decision = NonNullable<ProjectFrontmatter["decisions"]>[number];

type DecisionListProps = {
  decisions: Decision[];
};

// IA section 8: Decisions — sourced from frontmatter data (CONTENT_MODEL §3
// table: "Decisions (from frontmatter data)"), rendered as a semantic list.
export function DecisionList({ decisions }: DecisionListProps) {
  return (
    <dl>
      {decisions.map((decision) => (
        <div key={decision.id} className="border-t border-line py-6">
          <dt className="font-display text-heading-m text-ink">{decision.title}</dt>
          <dd className="mt-2 max-w-[42rem] font-display text-body text-ink-muted">
            <p>{decision.context}</p>
            <p className="mt-2">
              <strong className="text-ink">Choice:</strong> {decision.choice}
            </p>
            {decision.alternatives.length > 0 && (
              <p className="mt-2">
                <strong className="text-ink">Alternatives considered:</strong>{" "}
                {decision.alternatives.join(", ")}
              </p>
            )}
            <p className="mt-2">
              <strong className="text-ink">Trade-off:</strong> {decision.tradeoff}
            </p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
