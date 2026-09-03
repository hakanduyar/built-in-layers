import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyHero } from "@/components/project/CaseStudyHero";
import { DecisionList } from "@/components/project/DecisionList";
import { LayerExplorer } from "@/components/project/LayerExplorer";
import { DestinationLink, ProjectNeighbours } from "@/components/project/ProjectNeighbours";
import { Container } from "@/components/ui/Container";
import { selectedSystemsHeading, workIndexLabel } from "@/data/copy";
import { compileProjectMDX } from "@/lib/content/mdx";
import {
  getCaseStudyNeighbours,
  getPublishedProjects,
  getProjectBySlug,
  getProjectIndexBody,
  getProjectLayers,
  isCaseStudyDestination,
} from "@/lib/content/work";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  return buildMetadata({
    title: project?.title ?? "Project",
    description: project?.description ?? "",
    path: `/work/${slug}`,
  });
}

// Minimal semantic case-study template covering all 11 PROJECT_SPEC §7
// sections: 1 Project hero (CaseStudyHero, which also carries the record --
// provenance, phase, verification, stack, access -- and the contribution and
// AI-disclosure statements the content model requires); 2-4 One-minute
// summary/Why it exists/Constraints and 9-10 Evolution/Reflection are
// authored as `##` headings directly in index.mdx and appear naturally in
// its compiled body (no separate component needed — CONTENT_MODEL §3 marks
// these as index.mdx's own h2 sections); 5-7 Surface/Flow/System
// (LayerSection); 8 Decisions (DecisionList, from frontmatter); 11 movement
// between case studies (ProjectNeighbours, derived from the global order).
// Sections 2-11 render only when real content exists — proven structurally
// by the fixture-based template test, not by inventing public content here.
//
// V13 (Fable gate, finding D): section rhythm follows DESIGN_SYSTEM §5 --
// 96px between sections on desktop, 64px on mobile, hairline rules rather
// than boxes. A `preview`-depth project has no layers, decisions or
// neighbours; it used to end after its tech line as if the page had failed
// to load, so it now closes with the one onward route it honestly has: the
// work index.
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  // Belt-and-braces: dynamicParams = false already prevents any slug outside
  // getPublishedProjects() from routing here at all, but a route-level
  // check keeps this component correct even if that ever changes.
  if (!project || project.status !== "published") {
    notFound();
  }

  const indexBody = getProjectIndexBody(slug);
  const indexContent = indexBody ? await compileProjectMDX(indexBody) : null;
  const layers = await getProjectLayers(slug);
  const { previous, next } = getCaseStudyNeighbours(slug);

  return (
    <Container className="py-16 lg:py-24">
      {/* IA 1: Project hero */}
      <CaseStudyHero project={project} />

      {/* IA 2-4, 9-10: One-minute summary, Why it exists, Constraints,
          Evolution, Reflection — authored as h2 headings in index.mdx */}
      {indexContent && (
        <div className="mt-16 max-w-[42rem] font-display text-body text-ink lg:mt-24">
          {indexContent}
        </div>
      )}

      {/* IA 5-7: Surface, Flow, System -- TASK-007: enhanced into an ARIA
          tabs interface on hydration; the stacked rendering (LayerSection)
          remains the no-JS/pre-hydration output, unchanged. */}
      {layers && (
        <div className="mt-16 lg:mt-24">
          <LayerExplorer layers={layers} />
        </div>
      )}

      {/* IA 8: Decisions */}
      {project.decisions && project.decisions.length > 0 && (
        <section aria-labelledby="decisions-heading" className="mt-16 lg:mt-24">
          <h2 id="decisions-heading" className="font-display text-heading-l text-ink">
            Decisions
          </h2>
          <div className="mt-8">
            <DecisionList decisions={project.decisions} />
          </div>
        </section>
      )}

      {/* IA 11: movement between case studies, derived from the global
          `order` sequence (D-027) rather than an authored link. A project
          that is not a case-study destination has no position in that
          sequence, so it routes back to the index instead. */}
      {isCaseStudyDestination(project) ? (
        (previous || next) && (
          <div className="mt-16 lg:mt-24">
            <ProjectNeighbours previous={previous} next={next} />
          </div>
        )
      ) : (
        <nav aria-label={workIndexLabel} className="mt-16 border-t border-line pt-8 lg:mt-24">
          <DestinationLink label={workIndexLabel} href="/work">
            {selectedSystemsHeading}
          </DestinationLink>
        </nav>
      )}
    </Container>
  );
}
