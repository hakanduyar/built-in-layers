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
 * V14.2 Gate C: the deepest stratum a system's record reaches -- the foot of
 * its descent in the section drawing. -1 when the record documents no layer
 * at all, in which case no descent is drawn: the system stands on the
 * surface, not yet surveyed.
 */
export function projectDepth(project: ProjectFrontmatter): number {
  let depth = -1;
  layerDefinitions.forEach((layer, index) => {
    if (projectLayerCoverage(project, layer.label.toLowerCase() as LayerKey)) depth = index;
  });
  return depth;
}

/**
 * The resolved map after the spatial journey.
 *
 * This deliberately does not replay the project gallery. The reader has already
 * experienced title, description, stack and evidence at full scale. Here every
 * system becomes one position in a common topology: Surface / Flow / System
 * coverage on the route, then provenance and verification at the foot. The
 * result answers a new question -- which layers can this portfolio actually
 * substantiate? -- while keeping the same loader-fed order and one route into
 * each case study.
 *
 * V14.2 GATE C (owner) -- THE INDEX IS A SECTION, NOT A TABLE.
 *
 * The V14.1 register put the five systems in rows against a header of five
 * column names, with the three layers as three squares on a line in each
 * row: a coverage table, read as "another portfolio grid". The world has
 * just drawn what a layer IS -- at the cut, the underside of the surface is
 * three strata and a descent to SYSTEM; at Built in Layers the three are
 * defined; on route two they are the floors the reader climbs back through.
 * So the index is now drawn in that grammar, at `lg`: the three strata run
 * across the whole register as floors, named once in the gutter as every
 * band in the world is named; each system stands on the surface as a
 * station -- the same glyph the route and the map give it -- and descends
 * from that station through the floors to the deepest layer its validated
 * record reaches, with a mark on every floor it documents (filled) and on
 * every floor it does not (hollow); its record, provenance and verification,
 * is its footing under the SYSTEM line. A system whose record documents no
 * layer stands on the surface with no descent and hollow marks: not yet
 * surveyed, which is what "Not yet verified" means here. Every mark is the
 * same loader-fed fact the rows carried; only the drawing changed. The
 * mobile register is the V13 gate's, untouched below `lg`.
 */
export function SelectedSystems({ projects }: SelectedSystemsProps) {
  return (
    <SystemNode index={sectionIndex.selectedSystems} label={selectedSystemsHeading} major>
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

      {/* V14.1 (owner §14): THE REGISTER IS THE MAP'S INDEX, NOT A TABLE.
          The four systems the route visited carry the world's own station
          glyph -- the filled ring the map draws for a visited stop -- and the
          system that continues on the Work index carries the branch's hollow
          ring, exactly as the terminus map above drew it. Same five stops,
          same five symbols. */}
      <Reveal early className="mt-10 lg:mt-12">
        <div className="border-y border-ink lg:border-y-0">
          {/* At `lg` the list is a five-column section drawing: one subgrid
              row for the station and its name, one for the strata, one for
              the footing, so the floors run level across every column
              whatever the names wrap to. The gutter left of the first column
              is where the strata are named. */}
          <ol
            data-systems-section="true"
            className="[--strata-gutter:0px] lg:ml-[var(--strata-gutter)] lg:grid lg:grid-cols-5 lg:grid-rows-[auto_auto_auto] lg:[--strata-gutter:5.5rem]"
          >
            {projects.map((project, index) => {
              const visited = ROUTE_ONE_IDS.some((id) => id === project.slug);
              const depth = projectDepth(project);
              const first = index === 0;
              const last = index === projects.length - 1;
              return (
                <li
                  key={project.slug}
                  data-system-column={project.slug}
                  className="border-b border-line py-6 last:border-b-0 lg:row-span-3 lg:grid lg:min-w-0 lg:grid-rows-subgrid lg:border-b-0 lg:py-0"
                >
                  {/* THE STATION AND ITS NAME. Below lg, the V13 row: glyph
                      and index beside the title block. At lg, stacked at the
                      column's leading edge, with the descent leaving the
                      station toward the first floor. */}
                  <div className="relative flex items-start gap-5 lg:flex-col lg:items-stretch lg:gap-2 lg:pb-5 lg:pr-6">
                    {depth >= 0 && (
                      <span
                        aria-hidden="true"
                        data-system-descent={project.slug}
                        className="absolute bottom-0 left-[4.5px] top-3 hidden w-px bg-line lg:block"
                      />
                    )}
                    <span aria-hidden="true" className="flex items-center pt-1 lg:gap-3 lg:pt-0">
                      <span
                        data-station-glyph={visited ? "visited" : "branch"}
                        className={
                          visited
                            ? "relative z-[1] hidden h-2.5 w-2.5 rounded-full border border-ink bg-ink lg:block"
                            : "relative z-[1] hidden h-2.5 w-2.5 rounded-full border border-ink bg-paper lg:block"
                        }
                      />
                      <span className="font-mono text-mono-label tracking-mono-label text-ink-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                    {/* Beside the descent, never on it: the name stands to the
                        right of the station's line, as every label in the
                        world stands beside its rail. */}
                    <div className="lg:min-w-0 lg:pl-6">
                      {/* V13 (mobile gate, M4): the register's title is the route
                          into each system and was a 24px-tall target on phones.
                          `touch-link` (styles/globals.css) gives it a 44px hit
                          box below `lg` and changes nothing else -- the row's
                          rhythm and the desktop are pixel-identical
                          (docs/FROZEN_BOUNDARY.md §5). */}
                      <h3 className="font-display text-heading-m text-ink lg:text-[clamp(1.0625rem,1.5vw,1.375rem)] lg:leading-[1.2]">
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
                      {/* V14.3 Gate E: the classification is information, at
                          label size on the desktop. Mobile keeps meta. */}
                      <p className="mt-1 font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted lg:text-mono-label lg:tracking-mono-label">
                        {project.categoryLabel}
                      </p>
                    </div>
                  </div>

                  {/* THE STRATA. Below lg, three squares on a line with their
                      names. At lg, three floors: the rule runs the column's
                      full width (and, in the first column, back through the
                      gutter to the stratum's name); the mark sits on the rule
                      at the station's x; the descent continues through the
                      floor while a deeper layer is documented. */}
                  <ul
                    aria-label={`${project.title} documented layers`}
                    className="relative mt-5 grid grid-cols-3 gap-4 before:absolute before:left-[8%] before:right-[8%] before:top-[7px] before:h-px before:bg-line lg:mt-0 lg:grid-cols-1 lg:gap-0 lg:before:hidden"
                  >
                    {layerDefinitions.map((layer, layerIndex) => {
                      const key = layer.label.toLowerCase() as LayerKey;
                      const present = projectLayerCoverage(project, key);
                      const foot = layerIndex === layerDefinitions.length - 1;
                      return (
                        <li
                          key={layer.label}
                          data-layer-record={`${project.slug}:${key}:${present ? "present" : "absent"}`}
                          className={`relative z-[1] ${foot ? "lg:h-7" : "lg:h-11"}`}
                        >
                          {/* the floor */}
                          <span
                            aria-hidden="true"
                            className="absolute right-0 top-0 hidden h-px bg-ink lg:block"
                            style={{
                              left: first ? "calc(-1 * var(--strata-gutter))" : 0,
                              opacity: 0.22 + layerIndex * 0.1,
                            }}
                          />
                          {first && (
                            <span
                              aria-hidden="true"
                              data-strata-label={key}
                              className="absolute top-2 hidden font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:block"
                              style={{ left: "calc(-1 * var(--strata-gutter))" }}
                            >
                              {layer.label}
                            </span>
                          )}
                          {/* the descent, on through this floor */}
                          {depth > layerIndex && (
                            <span
                              aria-hidden="true"
                              className="absolute bottom-0 left-[4.5px] top-0 hidden w-px bg-line lg:block"
                            />
                          )}
                          <span
                            aria-hidden="true"
                            className={`relative z-[1] block h-[15px] w-[15px] border lg:absolute lg:left-0 lg:top-0 lg:h-2.5 lg:w-2.5 lg:-translate-y-1/2 ${
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

                  {/* THE FOOTING: the record, under the SYSTEM line. */}
                  <div
                    className={`mt-5 border-l border-line pl-4 lg:mt-0 lg:border-l-0 lg:pl-6 ${last ? "" : "lg:pr-4"}`}
                  >
                    <p className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
                      {PROVENANCE_LABEL[project.provenance]}
                      {project.upstream ? ` of ${project.upstream.name}` : ""}
                    </p>
                    {/* V14 (§21): the verification state is the record's most
                        important line and was its smallest (12px). Label size at
                        `lg`; the mobile row is the V13 gate's. */}
                    {/* V14.2 Gate C: at a column's measure the record wraps,
                        so the verification and phase lines take the meta size
                        and each phase stands on its own line -- three short
                        lines under the SYSTEM floor rather than five. */}
                    <p className="mt-1 font-mono text-mono-meta tracking-mono-meta text-ink-muted lg:text-ink">
                      {VERIFICATION_LABEL[project.verificationStatus]}
                      {project.phase ? (
                        <>
                          <span className="lg:hidden"> · </span>
                          <span className="lg:block">{humanise(project.phase)}</span>
                        </>
                      ) : null}
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
