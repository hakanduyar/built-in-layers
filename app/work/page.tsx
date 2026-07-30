import type { Metadata } from "next";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Container } from "@/components/ui/Container";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pendingCopy } from "@/data/copy";
import { getProjectsByTier } from "@/lib/content/work";
import type { Tier } from "@/lib/content/schemas";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description: "Selected engineering work by Hakan Duyar.",
  path: "/work",
});

// PROJECT_SPEC §9 presentation categories, in the fixed group order.
const TIER_ORDER: Tier[] = ["featured", "real-life", "archive", "origins"];
const TIER_LABELS: Record<Tier, string> = {
  featured: "Featured systems",
  "real-life": "Built for real life",
  archive: "Selected archive",
  origins: "Origins / early experiments",
};

export default function WorkPage() {
  const groups = TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    projects: getProjectsByTier(tier),
  })).filter((group) => group.projects.length > 0);

  return (
    <Container className="py-16">
      <SectionHeading label="WORK" />
      <h1 className="mt-4 font-display text-heading-l text-ink">Selected systems</h1>

      {groups.length === 0 ? (
        <p className="mt-4 max-w-[42rem] font-display text-body text-ink-muted">
          {pendingCopy.work}
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.tier} className="mt-12">
            <MonoLabel className="text-ink-muted">{group.label}</MonoLabel>
            <ul className="mt-4">
              {group.projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </ul>
          </div>
        ))
      )}
    </Container>
  );
}
