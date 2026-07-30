import type { ReactNode } from "react";

type LayerSectionProps = {
  label: "Surface" | "Flow" | "System";
  children: ReactNode;
};

// IA sections 5-7: Surface, Flow, System — stacked, server-rendered.
// Reused as-is by TASK-007's interactive explorer (ARCHITECTURE §2).
export function LayerSection({ label, children }: LayerSectionProps) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="font-mono text-mono-label tracking-mono-label uppercase text-ink">{label}</h2>
      <div className="mt-4 max-w-[42rem] font-display text-body text-ink">{children}</div>
    </section>
  );
}
