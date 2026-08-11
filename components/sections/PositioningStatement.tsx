import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/motion/Reveal";
import { positioningStatement } from "@/data/copy";

// IA section 3. Newsreader italic `statement` role (DESIGN_SYSTEM §3), one
// of at most two per page (§17 anti-generic criterion 5). Offset placement
// on explicit grid columns, not centered, per DESIGN_SYSTEM §15: cols 3-11
// desktop (12-col grid), cols 2-8 tablet (8-col grid). TASK-007: `onLoad`,
// not scroll-triggered -- adversarial review empirically confirmed this
// section sits inside the initial viewport at typical desktop sizes (right
// below the Hero), where the plain async `useInView` path had the same
// hydration-timing race the Hero itself needed `onLoad` to avoid (Reveal's
// own doc comment has the full reasoning): a real, observed opacity-0
// sample was caught here in a non-scrolling browser trace before this fix.
export function PositioningStatement() {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="02" label="Positioning" />
      <div className="mt-6 md:grid md:grid-cols-8 md:gap-6 lg:grid-cols-12">
        <Reveal
          onLoad
          className="max-w-[42rem] md:col-span-7 md:col-start-2 lg:col-span-8 lg:col-start-3"
        >
          <p className="font-serif text-statement italic text-ink">{positioningStatement}</p>
        </Reveal>
      </div>
    </section>
  );
}
