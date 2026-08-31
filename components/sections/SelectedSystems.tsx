import { SystemNode } from "@/components/spatial/SystemNode";
import { Reveal } from "@/components/ui/motion/Reveal";
import { TextLink } from "@/components/ui/TextLink";
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
                    <h3 className="font-display text-heading-l tracking-heading-l text-ink">
                      <TextLink href={`/work/${project.slug}`}>{project.title}</TextLink>
                    </h3>
                    <p className="mt-2 font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                      {project.categoryLabel}
                    </p>
                  </div>
                  <div className="mt-3 lg:mt-1.5">
                    <p className="max-w-[36rem] font-display text-body text-ink-muted">
                      {project.description}
                    </p>
                    {/* The register itself. A definition list on purpose: these
                        are term/value pairs about one system, and the grid keeps
                        the terms in one column so the five rows read DOWN as a
                        record rather than across as a tag cloud. */}
                    <dl className="mt-4 grid max-w-[36rem] grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1.5 border-t border-line pt-3">
                      <RegisterRow term="Provenance">
                        {PROVENANCE_LABEL[project.provenance]}
                        {project.upstream ? ` of ${project.upstream.name}` : ""}
                      </RegisterRow>
                      {project.phase && (
                        <RegisterRow term="Phase">{humanise(project.phase)}</RegisterRow>
                      )}
                      <RegisterRow term="Access">{access(project)}</RegisterRow>
                      <RegisterRow term="Record">
                        {humanise(project.verificationStatus)}
                      </RegisterRow>
                      {project.tech.length > 0 && (
                        <RegisterRow term="Stack">{project.tech.join(" · ")}</RegisterRow>
                      )}
                    </dl>
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

/** One term/value pair in a system's register. Two grid cells, not a nested
 *  wrapper, so every value in the column starts on the same left edge. */
function RegisterRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
        {term}
      </dt>
      <dd className="font-mono text-mono-meta tracking-mono-meta text-ink">{children}</dd>
    </>
  );
}
