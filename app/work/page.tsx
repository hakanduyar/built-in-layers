import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pendingCopy } from "@/data/copy";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description: "Selected engineering work — case studies in progress.",
  path: "/work",
});

// Route shell only -- the work index (project cards, tiers) is TASK-004.
export default function WorkPage() {
  return (
    <Container>
      <div className="py-16">
        <SectionHeading label="WORK" />
        <h1 className="mt-4 text-heading-l text-ink">Selected systems</h1>
        <p className="mt-4 max-w-[42rem] text-body text-ink-muted">{pendingCopy.work}</p>
      </div>
    </Container>
  );
}
