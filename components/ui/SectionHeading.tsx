import { MonoLabel } from "@/components/ui/MonoLabel";

type SectionHeadingProps = {
  label: string;
  /** Numbered homepage-section index (DESIGN_SYSTEM §8.1). Omit on
   * standalone route stubs, which are not numbered homepage sections. */
  index?: string;
};

/**
 * Decorative eyebrow only (DESIGN_SYSTEM §8: "All are aria-hidden and
 * convey nothing not present in text"). Every page using this must have
 * its own accessible `h1` carrying the real heading text.
 */
export function SectionHeading({ label, index }: SectionHeadingProps) {
  return (
    <div aria-hidden="true" className="border-t border-line pt-2">
      <MonoLabel className="text-ink-muted">{index ? `${index} / ${label}` : label}</MonoLabel>
    </div>
  );
}
