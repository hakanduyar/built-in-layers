import { SystemNode } from "@/components/spatial/SystemNode";
import { Reveal } from "@/components/ui/motion/Reveal";
import { aboutIntro, howIBuildHeading, howIBuildPrinciples, sectionIndex } from "@/data/copy";

// IA section 7.
//
// V6.7 COMPLETION PASS -- ONE OPERATING MODEL, NOT FOUR ITEMS.
//
// Through V6.7-partial this was a two-column `<ol>` of bordered rows: four
// independent objects that happened to be adjacent, which is exactly the "four
// generic cards/text columns" reading the brief rules out.
//
// DELIBERATELY NOT SEQUENCED. An input -> decision -> implementation -> validation
// arc was considered and rejected: the existing copy does not support it (the four
// principles are concurrent commitments, not stages), and imposing an arrow on them
// would be inventing a relationship for the sake of a diagram. They share a spine
// because they belong to one model, not because one leads to the next.
//
// Readability is unchanged: the body copy keeps its measure, its size and its
// contrast, and the list is still a real ordered list in the accessibility tree.
//
// V14.2 GATE C (owner) -- THE METHOD, INSIDE THE SAME SYSTEM.
//
// V14.1's four ruled rows were clean and read as an editorial list: a method
// stated as four items with nothing that moved. The owner asked for the
// movement -- from ambiguity to clarity -- through existing, truthful content,
// and without stages. The site already states that movement in the
// operator's own words, on /about (`aboutIntro.method`): the work starts as a
// system problem wearing an interface -- four open questions -- and is worked
// through the three layers, the last of which is the one usually
// underestimated. At `lg` that statement now opens the section, in the
// editorial serif the world reserves for the site's own voice, and beneath
// it the three strata are drawn once more as floors with the descent to
// SYSTEM ending on the world's resolved corner: the same section the index
// above surveyed the systems against, now read as the way the operator works
// through it. The four principles stand beside that movement as the
// commitments that hold on every floor -- an ordered list on rules, not
// cards, not stages. The mobile composition below `lg` is the V13 gate's.
export function HowIBuild() {
  return (
    <SystemNode index={sectionIndex.howIBuild} label={howIBuildHeading} major>
      <h2 className="mt-5 font-display text-display-l uppercase text-ink">{howIBuildHeading}</h2>

      <div className="lg:mt-10 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* THE MOVEMENT. Desktop only: on a phone the V13 composition carries
            the four principles alone, and the statement lives on /about. */}
        <div className="hidden lg:col-span-6 lg:block" data-method-movement="true">
          {/* The operator's voice, at the lower world's own statement scale:
              below the finale's single line, above the body. */}
          <p className="max-w-[30rem] font-serif text-[1.375rem] italic leading-[1.45] text-ink 2xl:max-w-[34rem] 2xl:text-[clamp(1.375rem,calc(1.375rem_+_(100vw_-_1536px)_*_0.007),1.75rem)]">
            {aboutIntro.method}
          </p>
          {/* V14.4 (owner: simplify where overloaded): the floors that stood
              under the statement are gone -- the index above already draws
              the strata, and the statement names them. */}
        </div>

        <Reveal early className="mt-8 lg:col-span-6 lg:mt-0">
          {/* V14 (owner findings D, F) -- FOUR POSITIONS, ONE FRAME.
              The V6.8-V13 form hung the four principles off one vertical spine
              as four full-width rows: measured on the baseline at 1440x900 the
              section was ~1,200px tall, the longest thing on the lower page, for
              four sentences -- which is the owner's "How I Build feels like
              filler". The copy is unchanged and still only the owner's; what
              changes is the travel it costs. */}
          {/* V14.1 (owner §15): FOUR ROWS OF ONE METHOD, NOT FOUR CARDS. Each
              principle is one row of the same register the rest of the lower
              page uses: the index in the gutter, the title, and what follows
              from it. The copy is unchanged; the relation is carried by the
              row, not by an arrow. V14.2 Gate C: the rows stand beside the
              movement, on the line's weight rather than ink, at the column's
              measure. */}
          <ol className="lg:border-b lg:border-line">
            {howIBuildPrinciples.map((principle, i) => (
              <li
                key={principle.title}
                className="border-t border-ink py-6 lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)] lg:items-baseline lg:border-line lg:py-4"
              >
                {/* Below lg this is the V13 mobile composition unchanged: index and
                    title on one baseline, the consequence in its own ruled block.
                    At lg the wrapper dissolves (contents) and the pieces take
                    the grid. */}
                <div className="flex items-baseline gap-4 lg:contents">
                  <span
                    aria-hidden="true"
                    className="block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-heading-l tracking-heading-l text-ink lg:text-heading-m lg:tracking-normal">
                    {principle.title}
                  </h3>
                </div>
                <div className="relative mt-3 max-w-[32rem] border-l border-line pl-5 lg:col-start-2 lg:mt-2 lg:border-l-0 lg:pl-0">
                  <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:hidden">
                    Consequence
                  </p>
                  <p className="mt-2 font-display text-body-l text-ink lg:mt-0 lg:text-body">
                    {principle.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </SystemNode>
  );
}
