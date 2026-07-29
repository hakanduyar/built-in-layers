import { MonoLabel } from "@/components/ui/MonoLabel";

type SectionHeadingProps = {
  label: string;
  index?: string;
};

// DESIGN_SYSTEM.md §8 vocabulary item 1: mono-meta index number + label on
// the section's top rule. aria-hidden: the following h1 already states the
// same meaning in accessible text (§8: "convey nothing not present in text").
export function SectionHeading({ label, index }: SectionHeadingProps) {
  return (
    <div aria-hidden="true" className="border-t border-line pt-2">
      <MonoLabel className="text-ink-muted">{index ? `${index} / ${label}` : label}</MonoLabel>
    </div>
  );
}
