import Link from "next/link";
import { SystemNode } from "@/components/spatial/SystemNode";
import { Reveal } from "@/components/ui/motion/Reveal";
import {
  layerDefinitions,
  sectionIndex,
  selectedSystemsHeading,
  selectedSystemsSubheading,
} from "@/data/copy";
import type { ProjectFrontmatter } from "@/lib/content/schemas";

type LayerKey = "surface" | "flow" | "system";

const VERIFICATION_LABEL: Record<ProjectFrontmatter["verificationStatus"], string> = {
  verified: "Verified against source",
  partial: "Partly verified",
  "requires-user": "Not yet verified",
  "do-not-publish": "Not published",
};

const PROVENANCE_LABEL: Record<ProjectFrontmatter["provenance"], string> = {
  personal: "Personal",
  professional: "Professional",
  internship: "Internship",
  fork: "Fork",
  learning: "Learning",
};

function humanise(value: string): string {
  const spaced = value.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * A layer is present only when the project's validated record can substantiate
 * it: either the authored layer summary exists or a registered asset names that
 * layer. No slug table and no inferred product claims.
 */
export function projectLayerCoverage(project: ProjectFrontmatter, layer: LayerKey): boolean {
  return Boolean(project.layers?.[layer] || project.images.some((image) => image.layer === layer));
}

/**
 * The resolved map after the spatial journey.
 *
 * This deliberately does not replay the project gallery. The reader has already
 * experienced title, description, stack and evidence at full scale. Here every
 * system becomes one row in a common topology: Surface / Flow / System coverage
 * on the route, then provenance and verification at the edge. The result answers
 * a new question -- which layers can this portfolio actually substantiate? --
 * while keeping the same loader-fed order and one route into each case study.
 */
export function SelectedSystems({ projects }: SelectedSystemsProps) {
  return (
    <SystemNode index={sectionIndex.selectedSystems} label={selectedSystemsHeading}>
      {/* V13 (Fable gate, finding E): the title row shares the register's own
          12-column grid AND its gap, so the column label below lands exactly on
          the Record column it names. Before, it started at column 9 of a
          gap-10 grid -- measured 77-80px left of the Record header at every
          desktop viewport, aligned to nothing on the page. */}
      <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-7">
          <h2 className="mt-5 font-display text-display-l uppercase text-ink">
            {selectedSystemsHeading}
          </h2>
          <p className="mt-4 max-w-[42rem] font-display text-body-l text-ink-muted">
            {selectedSystemsSubheading}
          </p>
        </div>
        <p className="mt-5 max-w-[28rem] font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:col-start-10 lg:col-span-3 lg:mt-0">
          Resolved by layer and record
        </p>
      </div>

      <Reveal className="mt-10 lg:mt-8">
        <div className="border-y border-ink">
          <div className="hidden border-b border-line py-4 lg:grid lg:grid-cols-12 lg:gap-8">
            <span className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:col-span-4">
              System
            </span>
            <div className="grid grid-cols-3 gap-4 lg:col-span-5">
              {layerDefinitions.map((layer) => (
                <span
                  key={layer.label}
                  className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
                >
                  {layer.label}
                </span>
              ))}
            </div>
            <span className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:col-span-3">
              Record
            </span>
          </div>

          <ol>
            {projects.map((project, index) => (
              <li
                key={project.slug}
                className="border-b border-line py-6 last:border-b-0 lg:grid lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-3"
              >
                <div className="flex items-start gap-5 lg:col-span-4">
                  <span
                    aria-hidden="true"
                    className="pt-1 font-mono text-mono-label tracking-mono-label text-ink-muted"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-heading-m text-ink">
                      <Link
                        href={`/work/${project.slug}`}
                        className="group/open underline decoration-1 underline-offset-[3px] transition-[color,text-decoration-thickness] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-signal-text hover:decoration-2"
                      >
                        {project.title}
                        <span
                          aria-hidden="true"
                          className="ml-2 inline-block text-[0.7em] no-underline"
                        >
                          ↗
                        </span>
                      </Link>
                    </h3>
                    <p className="mt-1 font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                      {project.categoryLabel}
                    </p>
                  </div>
                </div>

                <ul
                  aria-label={`${project.title} documented layers`}
                  className="relative mt-5 grid grid-cols-3 gap-4 before:absolute before:left-[8%] before:right-[8%] before:top-[7px] before:h-px before:bg-line lg:col-span-5 lg:mt-0"
                >
                  {layerDefinitions.map((layer) => {
                    const key = layer.label.toLowerCase() as LayerKey;
                    const present = projectLayerCoverage(project, key);
                    return (
                      <li
                        key={layer.label}
                        data-layer-record={`${project.slug}:${key}:${present ? "present" : "absent"}`}
                        className="relative z-[1]"
                      >
                        <span
                          aria-hidden="true"
                          className={`block h-[15px] w-[15px] border ${
                            present ? "border-ink bg-ink" : "border-line bg-paper"
                          }`}
                        />
                        <span className="mt-2 block font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted lg:hidden">
                          {layer.label}
                        </span>
                        <span className="sr-only">
                          {layer.label}: {present ? "record present" : "no record published"}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-5 border-l border-line pl-4 lg:col-span-3 lg:mt-0">
                  <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
                    {PROVENANCE_LABEL[project.provenance]}
                    {project.upstream ? ` of ${project.upstream.name}` : ""}
                  </p>
                  <p className="mt-1 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
                    {VERIFICATION_LABEL[project.verificationStatus]}
                    {project.phase ? ` · ${humanise(project.phase)}` : ""}
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

type SelectedSystemsProps = {
  projects: ProjectFrontmatter[];
};
