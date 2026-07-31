import { SectionHeading } from "@/components/ui/SectionHeading";
import { positioningStatement } from "@/data/copy";

// IA section 3. Newsreader italic `statement` role (DESIGN_SYSTEM §3), one
// of at most two per page (§17 anti-generic criterion 5). Offset placement
// on explicit grid columns, not centered, per DESIGN_SYSTEM §15: cols 3-11
// desktop (12-col grid), cols 2-8 tablet (8-col grid).
export function PositioningStatement() {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="02" label="Positioning" />
      <div className="mt-6 md:grid md:grid-cols-8 md:gap-6 lg:grid-cols-12">
        <p className="max-w-[42rem] font-serif text-statement italic text-ink md:col-span-7 md:col-start-2 lg:col-span-8 lg:col-start-3">
          {positioningStatement}
        </p>
      </div>
    </section>
  );
}
