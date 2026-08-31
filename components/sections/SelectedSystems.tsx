import { SystemNode } from "@/components/spatial/SystemNode";
import { Reveal } from "@/components/ui/motion/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { sectionIndex, selectedSystemsHeading, selectedSystemsSubheading } from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type SelectedSystemsProps = {
  projects: ProjectFrontmatter[];
};

/** "active-development" -> "Active development". Display only; same rule the
 *  system annotations use. The stored enum is never rewritten. */
function humanise(value: string): string {
  const spaced = value.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// V7 (owner §7-§8) — THE SYSTEMS INDEX. This replaces "Built for real life",
// which the owner read as exactly what it honestly was: a dormant register
// with zero entries, standing where the page's first post-journey section
// should carry its most information. The choice of INDEX over an "operational
// model" is structural: the page already states the operating model (How I
// Build, one section below), so a second methods section would say the same
// thing twice — while the one thing the lower page lacked was a compact,
// navigable account of the systems the world just toured. Recap and route
// onward, in one register.
//
// Every fact is loader-fed frontmatter: title, category, phase (only when a
// real value exists — D-018), the mandatory fork disclosure (CONTENT_MODEL
// §9), and the description. There is no slug->copy table and nothing invented;
// the section is exactly as long as the real published work list.
//
// The composition is the page's own register grammar: rows hung off one
// bounded spine, indices down one line — the same machine-reading How I Build
// established, carrying data instead of principles.
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
                    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                      {project.phase && (
                        <div className="flex items-baseline gap-2">
                          <dt className="font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                            Phase
                          </dt>
                          <dd className="font-mono text-mono-meta tracking-mono-meta text-ink">
                            {humanise(project.phase)}
                          </dd>
                        </div>
                      )}
                      {project.upstream && (
                        <div className="flex items-baseline gap-2">
                          <dt className="font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                            Provenance
                          </dt>
                          <dd className="font-mono text-mono-meta tracking-mono-meta text-ink">
                            Fork of {project.upstream.name}
                          </dd>
                        </div>
                      )}
                      {project.tech.length > 0 && (
                        <div className="flex items-baseline gap-2">
                          <dt className="font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                            Stack
                          </dt>
                          <dd className="font-mono text-mono-meta tracking-mono-meta text-ink">
                            {project.tech.slice(0, 3).join(" · ")}
                          </dd>
                        </div>
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
