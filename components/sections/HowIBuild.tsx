import { SystemNode } from "@/components/spatial/SystemNode";
import { Reveal } from "@/components/ui/motion/Reveal";
import { howIBuildHeading, howIBuildPrinciples, sectionIndex } from "@/data/copy";

// IA section 7.
//
// V6.7 COMPLETION PASS -- ONE OPERATING MODEL, NOT FOUR ITEMS.
//
// Through V6.7-partial this was a two-column `<ol>` of bordered rows: four
// independent objects that happened to be adjacent, which is exactly the "four
// generic cards/text columns" reading the brief rules out.
//
// The four principles are now hung off ONE CONTINUOUS SPINE. That is the whole
// device, and it is structural rather than decorative: a single rule runs the full
// height of the list, every principle registers against it with a short tick at its
// own index, and the indices run 01-04 down that one line. The eye reads a single
// system with four positions in it before it reads any of the words -- which is the
// actual claim the section makes.
//
// DELIBERATELY NOT SEQUENCED. An input -> decision -> implementation -> validation
// arc was considered and rejected: the existing copy does not support it (the four
// principles are concurrent commitments, not stages), and imposing an arrow on them
// would be inventing a relationship for the sake of a diagram. They share a spine
// because they belong to one model, not because one leads to the next.
//
// Readability is unchanged: the body copy keeps its measure, its size and its
// contrast, and the list is still a real ordered list in the accessibility tree.
export function HowIBuild() {
  return (
    <SystemNode index={sectionIndex.howIBuild} label={howIBuildHeading}>
      <h2 className="mt-5 font-display text-display-l uppercase text-ink">{howIBuildHeading}</h2>

      <Reveal className="mt-8">
        {/* V14 (owner findings D, F) -- FOUR POSITIONS, ONE FRAME.
            The V6.8-V13 form hung the four principles off one vertical spine
            as four full-width rows: measured on the baseline at 1440x900 the
            section was ~1,200px tall, the longest thing on the lower page, for
            four sentences -- which is the owner's "How I Build feels like
            filler". The copy is unchanged and still only the owner's; what
            changes is the travel it costs. Two columns of two, each position
            registered to the same top rule with its index, its title and the
            arrow into its consequence, so the whole operating model is read in
            ONE viewport instead of scrolled through. The V8/V9 relation --
            principle -> consequence, drawn not implied -- is kept in each cell. */}
        <ol className="lg:grid lg:grid-cols-2 lg:gap-x-12">
          {howIBuildPrinciples.map((principle, i) => (
            <li key={principle.title} className="relative border-t border-ink py-6 lg:py-7">
              <div className="flex items-baseline gap-4">
                <span
                  aria-hidden="true"
                  className="block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-heading-l tracking-heading-l text-ink">
                  {principle.title}
                </h3>
              </div>
              {/* The consequence arrow: leaves the title's measure and points
                  into what follows from it. Decorative; the relation is carried
                  by the reading order for assistive technology. */}
              <span aria-hidden="true" className="mt-4 hidden items-center gap-2 lg:flex">
                <span className="block h-px w-16 bg-ink opacity-45" />
                <span className="block h-1.5 w-1.5 rotate-45 border-r border-t border-ink opacity-60" />
              </span>
              <div className="relative mt-3 max-w-[32rem] border-l border-line pl-5 lg:mt-3 lg:border-l-0 lg:pl-0">
                <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
                  Consequence
                </p>
                <p className="mt-2 font-display text-body-l text-ink">{principle.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </SystemNode>
  );
}
