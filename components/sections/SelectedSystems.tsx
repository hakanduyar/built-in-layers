import Link from "next/link";
import { SystemNode } from "@/components/spatial/SystemNode";
import { Reveal } from "@/components/ui/motion/Reveal";
import { sectionIndex, selectedSystemsHeading, selectedSystemsSubheading } from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

/** "active-development" -> "Active development". Display only; same rule the
 *  system annotations use. The stored enum is never rewritten. */
function humanise(value: string): string {
  const spaced = value.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * How each system is classified, in the site's own vocabulary.
 *
 * Every value below is a validated frontmatter enum -- `provenance` is a
 * REQUIRED field on every project (lib/content/schemas.ts) -- so this is a
 * lookup from the stored enum to the word the page shows, not a judgement this
 * component makes about a project.
 */
/**
 * How far the site's own claims about a system have been checked, in words a
 * reader can act on. The stored enum values are `verified` / `partial` /
 * `requires-user`; the last of those is an internal state name ("this needs the
 * owner to confirm it"), and printing it raw told the reader nothing. Each label
 * is a plain-English restatement of the same stored fact, never a softening of
 * it — an unverified system still says so.
 */
const VERIFICATION_LABEL: Record<ProjectFrontmatter["verificationStatus"], string> = {
  verified: "Verified against source",
  partial: "Partly verified",
  "requires-user": "Not yet verified",
  // Unreachable from this section — `getPublishedProjects()` cannot return a
  // do-not-publish entry — but the map is exhaustive so the enum cannot gain a
  // value that silently renders as blank.
  "do-not-publish": "Not published",
};

const PROVENANCE_LABEL: Record<ProjectFrontmatter["provenance"], string> = {
  personal: "Personal",
  professional: "Professional",
  internship: "Internship",
  fork: "Fork",
  learning: "Learning",
};

/**
 * What the site can actually SHOW of a system, derived from its own links.
 *
 * CLAUDE.md §11 requires personal, professional and adapted work to be
 * distinguishable, and the honest version of that on an index is: say what a
 * reader can go and look at. A public repository is stated because one is
 * declared with `visibility: "public"`; everything else is stated as closed
 * rather than left blank, because a blank row reads as an omission and a system
 * with nothing public is a fact about the work, not a gap in the data.
 */
function access(project: ProjectFrontmatter): string {
  const open = project.links.filter((link) => link.visibility === "public");
  if (open.length === 0) return "No public artefact";
  const repo = open.find((link) => link.kind === "repo");
  if (repo) return open.length > 1 ? "Public repository, live" : "Public repository";
  return "Public link";
}

// V8 (§4) — THE SYSTEM REGISTER.
//
// This is the AUTHORITATIVE Selected Systems, and as of V8 the only one. Two
// sparse "destination surface" plates used to preview this section and How I
// Build from across the spatial world's exit traverse -- index, heading, one
// line -- so the page stated each of them twice, the first time almost empty.
// The owner rejected those previews; they are deleted, along with the depth
// plane and the 167-unit empty diagonal built to carry them (see
// components/spatial/SpatialExperience.tsx and lib/spatial/scenes.ts).
//
// WHAT V8 CHANGED HERE, and why it is density rather than decoration. V7 showed
// three facts per system: phase, fork disclosure, and the first three
// technologies. The frontmatter every project is already validated against
// carries more than that, and the missing fields were exactly the ones an index
// exists to answer -- what KIND of work is this, how far can I actually look
// into it, and how well is what the site says about it verified. So the register
// now carries five, for every entry:
//
//   PROVENANCE     personal / professional / internship / fork / learning.
//                  A required field, shown for every system rather than only
//                  when it is a fork -- CLAUDE.md §11's distinction is not a
//                  footnote about forks, it is the classification itself.
//   PHASE          only where a real value exists (D-018 keeps it optional).
//   ACCESS         what the reader can go and open, from the project's own
//                  declared links and their visibility.
//   RECORD         verificationStatus, the site's own statement about how far
//                  its claims for this system have been checked.
//   STACK          the declared technologies.
//
// Every one of those is loader-fed. There is no slug->copy table in this file,
// nothing is written per project, and the section is exactly as long as the real
// published work list. A system with no phase simply has no phase row.
//
// The composition is the page's own register grammar -- rows hung off one
// bounded spine, indices down one line, the same machine-reading How I Build
// establishes -- and it is deliberately NOT a second project gallery: no
// imagery, no cards, one link per row, into the case study that already exists.
export function SelectedSystems({ projects }: SelectedSystemsProps) {
  return (
    <SystemNode index={sectionIndex.selectedSystems} label={selectedSystemsHeading}>
      <h2 className="mt-5 font-display text-display-l uppercase text-ink">
        {selectedSystemsHeading}
      </h2>
      <p className="mt-4 max-w-[42rem] font-display text-body-l text-ink-muted">
        {selectedSystemsSubheading}
      </p>

      <Reveal className="mt-10">
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-full w-px bg-ink opacity-40 lg:block"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px left-0 hidden h-px w-6 bg-ink opacity-60 lg:block"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-2 left-1.5 hidden h-px w-3 bg-ink opacity-35 lg:block"
          />
          <ol className="lg:pl-12">
            {projects.map((project, i) => (
              <li
                key={project.slug}
                className="relative border-b border-line py-7 first:pt-0 last:border-b-0 last:pb-10 lg:border-b-0"
              >
                <div className="lg:grid lg:grid-cols-[4rem_minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
                  <span
                    aria-hidden="true"
                    className="relative block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:pt-2"
                  >
                    <span className="absolute -left-12 top-[0.9em] hidden h-px w-7 bg-ink opacity-40 lg:block" />
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    {/* IDENTITY, dominant. The phase rides with the name rather
                        than sitting in the record below it: of everything the
                        register knows, "what state is this system in" is the one
                        fact that changes how the name itself should be read. */}
                    {/* ONE LINK PER ROW, carrying its own affordance — the same
                        decision the spatial scenes make, for the same reason. A
                        separate "Open case study" link would give every row two
                        links to one destination, two tab stops, and two entries
                        in a screen-reader link list; worse, its accessible name
                        had to contain the system's title to stay unambiguous,
                        which made the row's links indistinguishable by name. The
                        action is therefore stated visually inside the title's own
                        anchor and hidden from assistive technology, which already
                        has the title. */}
                    <h3 className="font-display text-heading-l tracking-heading-l text-ink">
                      <Link href={`/work/${project.slug}`} className="group/open block max-w-fit">
                        <span className="underline decoration-1 underline-offset-[3px] transition-[color,text-decoration-thickness] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover/open:text-signal-text group-hover/open:decoration-2">
                          {project.title}
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-3 flex items-center gap-2.5 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover/open:text-signal-text"
                        >
                          <span className="block h-px w-5 bg-ink opacity-50 transition-[width] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover/open:w-8" />
                          {project.depth === "full" || project.depth === "short"
                            ? "Open case study"
                            : "Open system"}
                        </span>
                      </Link>
                    </h3>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                      <span>{project.categoryLabel}</span>
                      {project.phase && (
                        <>
                          <span aria-hidden="true" className="text-line">
                            /
                          </span>
                          <span className="text-ink">{humanise(project.phase)}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="mt-3 lg:mt-1.5">
                    <p className="max-w-[36rem] font-display text-body text-ink">
                      {project.description}
                    </p>
                    {/* V9 (§11) — THREE WEIGHTS, NOT FIVE EQUAL ROWS.
                        The V8 register was a five-row `<dl>` in which every term
                        and every value rendered at the same 12px, muted, one per
                        line. Measured at 1366, 1536 and 1918 it was identical:
                        term 12px, value 12px. That is the "database table"
                        reading the owner reported, and it also buried the two
                        facts a reader actually navigates by.

                        The record is now one line of SECONDARY facts — how the
                        work came about, how far its claims are checked, and what
                        can actually be opened — at label scale rather than meta
                        scale, and the stack drops to TERTIARY beneath it. Same
                        data, same loader, no invented fields; only the weights
                        changed. The `<dl>` is kept for the pairs that are still
                        pairs, and the separators are decorative. */}
                    <dl className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-3 font-mono text-mono-label tracking-mono-label">
                      <RegisterFact term="Provenance">
                        {PROVENANCE_LABEL[project.provenance]}
                        {project.upstream ? ` of ${project.upstream.name}` : ""}
                      </RegisterFact>
                      <Divider />
                      <RegisterFact term="Record">
                        {VERIFICATION_LABEL[project.verificationStatus]}
                      </RegisterFact>
                      <Divider />
                      <RegisterFact term="Access">{access(project)}</RegisterFact>
                    </dl>
                    {project.tech.length > 0 && (
                      <p className="mt-2.5 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
                        <span className="sr-only">Stack: </span>
                        {project.tech.join(" · ")}
                      </p>
                    )}
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

type SelectedSystemsProps = {
  projects: ProjectFrontmatter[];
};

/**
 * One fact in a system's record: the term small and muted, the value at label
 * scale in ink. The two carry different weight on purpose — V8 rendered both at
 * the same 12px, which is what made five true statements read as a table dump
 * rather than as a record with a subject.
 */
function RegisterFact({ term, children }: { term: string; children: React.ReactNode }) {
  // A `div`, not a `span`: a `<dl>` may only directly contain `dt`/`dd` groups,
  // `script`, `template` or `div`, and axe's `definition-list` rule enforces it.
  // Caught by the a11y suite when this was first written with a span.
  return (
    <div className="inline-flex items-baseline gap-2">
      <dt className="text-mono-meta uppercase text-ink-muted">{term}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

/** Decorative separator between record facts. Never announced. */
function Divider() {
  return (
    <span aria-hidden="true" className="text-line">
      ·
    </span>
  );
}
