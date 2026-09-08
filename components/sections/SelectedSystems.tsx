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
import { ROUTE_ONE_IDS } from "@/lib/spatial/scenes";

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
 * V14.2 Gate C: the deepest stratum a system's record reaches. -1 when the
 * record documents no layer at all.
 */
export function projectDepth(project: ProjectFrontmatter): number {
  let depth = -1;
  layerDefinitions.forEach((layer, index) => {
    if (projectLayerCoverage(project, layer.label.toLowerCase() as LayerKey)) depth = index;
  });
  return depth;
}

/**
 * The resolved index after the spatial journey.
 *
 * This deliberately does not replay the project gallery. The reader has already
 * experienced title, description, stack and evidence at full scale. Here every
 * system is one entry in a common record: which of Surface / Flow / System its
 * validated evidence covers, its provenance, how far it is verified, its phase.
 * The result answers a new question -- which layers can this portfolio actually
 * substantiate? -- while keeping the same loader-fed order and one route into
 * each case study.
 *
 * V14.5 (owner) -- THE INDEX IS A FILE, NOT A TABLE AND NOT A DRAWING.
 *
 * Gate C drew the five systems as a section: five columns descending through
 * three floors. The owner's reading was that the index should be calmer,
 * stronger in hierarchy, more present, and in the Machine's own grammar. So
 * at `lg` each system is now ONE ENTRY at reading scale, the way the
 * acquisition frame classifies a scene: the station and its index, the
 * subject's name at heading scale, its classification beneath, and on the
 * right the three layers as labelled marks -- filled where the record
 * documents the layer, hollow where it does not -- with the record's
 * provenance, verification and phase filed on one line under the name. Five
 * entries on rules, generous, one column, nothing drawn that is not a fact.
 * The mobile register below `lg` is the V13 gate's, untouched.
 */
export function SelectedSystems({ projects }: SelectedSystemsProps) {
  return (
    <SystemNode index={sectionIndex.selectedSystems} label={selectedSystemsHeading} major>
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

      <Reveal early className="mt-10 lg:mt-14">
        <div className="border-y border-ink lg:border-b-0">
          <ol>
            {projects.map((project, index) => {
              const visited = ROUTE_ONE_IDS.some((id) => id === project.slug);
              return (
                <li
                  key={project.slug}
                  data-system-entry={project.slug}
                  className="border-b border-line py-6 last:border-b-0 lg:grid lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-8 lg:gap-y-0 lg:border-b lg:py-8 lg:last:border-b"
                >
                  {/* THE SUBJECT. Below lg, the V13 row: glyph and index beside
                      the title block. At lg, the station and its index in a
                      gutter, the name at heading scale, the classification
                      beneath it. */}
                  <div className="flex items-start gap-5 lg:col-span-8 lg:row-start-1 lg:gap-6">
                    <span
                      aria-hidden="true"
                      className="flex items-center pt-1 lg:w-14 lg:shrink-0 lg:gap-3 lg:pt-3"
                    >
                      <span
                        data-station-glyph={visited ? "visited" : "branch"}
                        className={
                          visited
                            ? "hidden h-2.5 w-2.5 rounded-full border border-ink bg-ink lg:block"
                            : "hidden h-2.5 w-2.5 rounded-full border border-ink bg-paper lg:block"
                        }
                      />
                      <span className="font-mono text-mono-label tracking-mono-label text-ink-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <div className="lg:min-w-0">
                      {/* V13 (mobile gate, M4): `touch-link` gives the title a
                          44px hit box below `lg` and changes nothing else. */}
                      <h3 className="font-display text-heading-m text-ink lg:text-heading-l lg:tracking-heading-l">
                        <Link
                          href={`/work/${project.slug}`}
                          className="group/open underline decoration-1 underline-offset-[3px] transition-[color,text-decoration-thickness] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-ink-muted hover:decoration-2 max-lg:inline-block max-lg:touch-link"
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
                      <p className="mt-1 font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted lg:mt-2 lg:text-mono-label lg:tracking-mono-label">
                        {project.categoryLabel}
                      </p>
                    </div>
                  </div>

                  {/* THE LAYERS. Below lg, three squares on a line with their
                      names. At lg, three labelled marks on the right: filled
                      where the validated record documents the layer, hollow
                      where it does not. */}
                  <ul
                    aria-label={`${project.title} documented layers`}
                    className="relative mt-5 grid grid-cols-3 gap-4 before:absolute before:left-[8%] before:right-[8%] before:top-[7px] before:h-px before:bg-line lg:col-span-4 lg:row-start-1 lg:mt-3 lg:flex lg:justify-end lg:gap-8 lg:before:hidden"
                  >
                    {layerDefinitions.map((layer) => {
                      const key = layer.label.toLowerCase() as LayerKey;
                      const present = projectLayerCoverage(project, key);
                      return (
                        <li
                          key={layer.label}
                          data-layer-record={`${project.slug}:${key}:${present ? "present" : "absent"}`}
                          className="relative z-[1] lg:flex lg:items-center lg:gap-2.5"
                        >
                          <span
                            aria-hidden="true"
                            className={`block h-[15px] w-[15px] border lg:h-2.5 lg:w-2.5 ${
                              present ? "border-ink bg-ink" : "border-line bg-paper lg:border-ink"
                            }`}
                          />
                          <span
                            className={`mt-2 block font-mono text-mono-meta tracking-mono-meta uppercase lg:mt-0 lg:text-mono-label lg:tracking-mono-label ${
                              present ? "text-ink-muted lg:text-ink" : "text-ink-muted"
                            }`}
                          >
                            {layer.label}
                          </span>
                          <span className="sr-only">
                            {layer.label}: {present ? "record present" : "no record published"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* THE RECORD. Below lg the V13 block: provenance and the
                      verification line in a ruled block after the layers. At lg the
                      same two facts are filed on one line under the name -- the
                      grid places the block in the subject column's second row. */}
                  <div className="mt-5 border-l border-line pl-4 lg:col-span-8 lg:col-start-1 lg:row-start-2 lg:mt-3 lg:ml-20 lg:flex lg:flex-wrap lg:items-baseline lg:gap-x-3 lg:border-l-0 lg:pl-0">
                    <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink lg:whitespace-nowrap">
                      {PROVENANCE_LABEL[project.provenance]}
                      {project.upstream ? ` of ${project.upstream.name}` : ""}
                    </p>
                    <p className="mt-1 font-mono text-mono-meta tracking-mono-meta text-ink-muted lg:mt-0 lg:text-mono-label lg:tracking-mono-label lg:text-ink">
                      <span aria-hidden="true" className="hidden text-ink-muted lg:inline">
                        ·{" "}
                      </span>
                      {VERIFICATION_LABEL[project.verificationStatus]}
                      {project.phase ? ` · ${humanise(project.phase)}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Reveal>
    </SystemNode>
  );
}

type SelectedSystemsProps = {
  projects: ProjectFrontmatter[];
};
