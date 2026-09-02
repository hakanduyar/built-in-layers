import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyHero } from "@/components/project/CaseStudyHero";
import { DecisionList } from "@/components/project/DecisionList";
import { LayerExplorer } from "@/components/project/LayerExplorer";
import { ProjectNeighbours } from "@/components/project/ProjectNeighbours";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { compileProjectMDX } from "@/lib/content/mdx";
import {
  getCaseStudyNeighbours,
  getPublishedProjects,
  getProjectBySlug,
  getProjectIndexBody,
  getProjectLayers,
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
// sections: 1 Project hero (CaseStudyHero); 2-4 One-minute summary/Why it
// exists/Constraints and 9-10 Evolution/Reflection are authored as `##`
// headings directly in index.mdx and appear naturally in its compiled body
// (no separate component needed — CONTENT_MODEL §3 marks these as
// index.mdx's own h2 sections); 5-7 Surface/Flow/System (LayerSection); 8
// Decisions (DecisionList, from frontmatter); 11 Next project (NextProject).
// None of this task's seed content is depth "full"/"short", so sections
// 2-11 render only when real content exists — proven structurally by the
// fixture-based template test, not by inventing public content here.
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
    <Container className="py-16">
      {/* IA 1: Project hero */}
      <CaseStudyHero project={project} />

      {/* IA 2-4, 9-10: One-minute summary, Why it exists, Constraints,
          Evolution, Reflection — authored as h2 headings in index.mdx */}
      {indexContent && (
        <div className="mt-8 max-w-[42rem] font-display text-body text-ink">{indexContent}</div>
      )}

      {project.tech.length > 0 && (
        <p className="mt-8 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          {project.tech.join(" · ")}
        </p>
      )}

      {project.links.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-6">
          {project.links.map((link) =>
            link.visibility === "public" ? (
              <li key={link.url}>
                <TextLink href={link.url} external>
                  {link.label}
                </TextLink>
              </li>
            ) : (
              <li key={link.label} className="font-mono text-mono-meta text-ink-muted">
                {link.label}
              </li>
            ),
          )}
        </ul>
      )}

      {/* IA 5-7: Surface, Flow, System -- TASK-007: enhanced into an ARIA
          tabs interface on hydration; the stacked rendering (LayerSection)
          remains the no-JS/pre-hydration output, unchanged. */}
      {layers && (
        <div className="mt-16">
          <LayerExplorer layers={layers} />
        </div>
      )}

      {/* IA 8: Decisions */}
      {project.decisions && project.decisions.length > 0 && (
        <div className="mt-16">
          <h2 className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
            Decisions
          </h2>
          <DecisionList decisions={project.decisions} />
        </div>
      )}

      {/* IA 11: movement between case studies, derived from the global
          `order` sequence (D-027) rather than an authored link. */}
      <div className="mt-16">
        <ProjectNeighbours previous={previous} next={next} />
      </div>
    </Container>
  );
}
