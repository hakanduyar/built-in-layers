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

      <Reveal className="mt-10">
        {/* V6.8 (§8): the spine is now BOUNDED, and the hierarchy is pushed hard
            enough that the four positions read as one machine before any body copy
            is read. Three changes from V6.7, all structural:
              - titles at heading-l, so each principle is an event rather than a
                list item;
              - each tick is aligned to its title's cap height and the index sits
                ON the spine's gutter, so index -> tick -> title is one line of
                reading;
              - the spine CLOSES at the bottom with the world's resolved corner --
                a bounded operating model, not a list that ran out. */}
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-full w-px bg-ink opacity-40 lg:block"
          />
          {/* The model's closing mark: spine ends, deliberately. */}
          <span
            aria-hidden="true"
            className="absolute -bottom-px left-0 hidden h-px w-6 bg-ink opacity-60 lg:block"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-2 left-1.5 hidden h-px w-3 bg-ink opacity-35 lg:block"
          />
          <ol className="lg:pl-12">
            {howIBuildPrinciples.map((principle, i) => (
              <li key={principle.title} className="relative py-8 first:pt-0 last:pb-10">
                {/* FINAL REMEDIATION: title and body now share the row's full
                    measure -- title against the spine, body in its own right
                    column on the same cap line -- instead of both stacking in the
                    left half with the row's right third as dead paper (measured
                    at the owner's viewport). Four full-width registered rows read
                    as one machine; nothing new was added to achieve it. */}
                <div className="lg:grid lg:grid-cols-[4rem_minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
                  {/* The tick is anchored to the NUMERAL, not to the row box, so
                      index -> tick -> title cannot drift apart whatever the row's
                      padding does -- review measured the box-anchored version
                      sitting 38px above its numeral. */}
                  <span
                    aria-hidden="true"
                    className="relative block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:pt-2"
                  >
                    <span className="absolute -left-12 top-[0.9em] hidden h-px w-7 bg-ink opacity-40 lg:block" />
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-heading-l tracking-heading-l text-ink">
                    {principle.title}
                  </h3>
                  <p className="mt-3 max-w-[36rem] font-display text-body text-ink-muted lg:mt-1.5">
                    {principle.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </SystemNode>
  );
}
