import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pendingCopy } from "@/data/copy";

export const metadata: Metadata = buildMetadata({
  title: "Lab",
  description: "Small experiments — nothing published yet.",
  path: "/lab",
});

// Route shell only -- honest empty state (D-009); no fake experiments.
export default function LabPage() {
  return (
    <Container>
      <div className="py-16">
        <SectionHeading label="LAB" />
        <h1 className="mt-4 text-heading-l text-ink">Lab</h1>
        <p className="mt-4 max-w-[42rem] text-body text-ink-muted">{pendingCopy.lab}</p>
      </div>
    </Container>
  );
}
