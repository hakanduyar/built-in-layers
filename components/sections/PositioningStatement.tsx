import { Reveal } from "@/components/ui/motion/Reveal";
import { positioningStatement } from "@/data/copy";

// IA section 3. Offset placement on explicit grid columns, not centered.
// TASK-007: `onLoad`, not scroll-triggered -- adversarial review empirically
// confirmed this section sits inside the initial viewport at typical
// desktop sizes (right below the Hero), where the plain async `useInView`
// path had the same hydration-timing race the Hero itself needed `onLoad`
// to avoid (Reveal's own doc comment has the full reasoning): a real,
// observed opacity-0 sample was caught here in a non-scrolling browser
// trace before this fix.
//
// PROTOTYPE V2 (Layered Editorial Systems, visual-only): deliberately the
// quiet beat right after the Hero's impact -- no mono eyebrow, no top rule,
// no index number. No longer set in Newsreader italic (V1 had a third,
// disclosed serif-statement use here; V2 moved this to the same Archivo
// voice as the Hero's quiet supporting line, so the Hero's primary line and
// the Layer Explorer's Flow definition stay the page's only two, within
// DESIGN_SYSTEM §17 criterion 5's "at most twice per page").
//
// PROTOTYPE V3: the owner's review of V2 still read this section as
// isolated in empty space. Two changes: (1) top margin reduced from
// mt-24/lg:mt-40 (96/160px) to mt-16/lg:mt-24 (64/96px) -- both values stay
// inside DESIGN_SYSTEM §5's documented range for their own breakpoint
// (64-96 mobile, 96-160 desktop), just at that range's tighter end, so
// there's no governance deviation to disclose. (2) the standalone vertical
// tick is replaced with the exact `border-l-2 border-line pl-6` treatment
// the Hero's primary line already uses -- the same rail, literally
// continuing, rather than a second, unrelated device -- so this section
// reads as the next step in one descent instead of a new isolated block.
export function PositioningStatement() {
  return (
    <section className="mt-16 lg:mt-24">
      <div className="md:grid md:grid-cols-8 md:gap-6 lg:grid-cols-12">
        <Reveal
          onLoad
          className="max-w-[30rem] border-l-2 border-line pl-6 md:col-span-6 md:col-start-2 lg:col-span-6 lg:col-start-4"
        >
          <p className="font-display text-heading-m text-ink">{positioningStatement}</p>
        </Reveal>
      </div>
    </section>
  );
}
