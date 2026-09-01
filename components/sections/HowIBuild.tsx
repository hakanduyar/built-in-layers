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
                    {/* V9 (§12): the CONSEQUENCE ARROW. V8 drew the relation with
                        a short rule and the word "So", and the owner's reading
                        was that the causality stayed too quiet — at 12px, in
                        muted ink, beside a 40px title, the relation was the
                        faintest thing in a row about relations. The mark now
                        leaves the title itself and points into the consequence,
                        so the eye reads "principle -> therefore" before it reads
                        either half. Decorative: the relation is already carried
                        by the reading order for assistive technology. */}
                    <span aria-hidden="true" className="mt-4 hidden items-center gap-2 lg:flex">
                      <span className="block h-px w-10 bg-ink opacity-45" />
                      <span className="block h-1.5 w-1.5 rotate-45 border-r border-t border-ink opacity-60" />
                    </span>
                  </h3>
                  {/* V8 (§5) -- THE CONSEQUENCE IS NOW DRAWN, NOT IMPLIED.
                      The owner's reading of V7 was that this was four isolated
                      text rows, and the requested direction is
                      principle -> engineering consequence. Both halves of that
                      already existed in the approved copy: the title is the
                      commitment, the body is what it forces on the build. What
                      was missing was any mark saying the second follows from the
                      first, so the eye read them as a heading and a caption.
                      A short rule leaving the title's own column and a single
                      relation label now carry that, and NOTHING is written here:
                      no third column of invented consequences, no evidence
                      claims, no restated project copy. The structure states the
                      relationship; the words are still only the owner's. */}
                  {/* The consequence, given the weight of a consequence. V8 set
                      it in muted ink at body size, so the row's second half read
                      as a caption on the first. It now carries the row: a
                      registered label naming the relation, then the sentence in
                      ink at body-l. Still the owner's approved copy, verbatim
                      and unextended — the structure states the causality, the
                      words are unchanged. */}
                  <div className="relative mt-3 max-w-[36rem] border-l border-line pl-5 lg:mt-1.5 lg:border-l-0 lg:pl-0">
                    <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
                      Consequence
                    </p>
                    <p className="mt-2 font-display text-body-l text-ink">{principle.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </SystemNode>
  );
}
