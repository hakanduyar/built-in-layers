import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pendingCopy } from "@/data/copy";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Lab",
  description: "Small experiments by Hakan Duyar.",
  path: "/lab",
});

export default function LabPage() {
  return (
    <Container className="py-16">
      <SectionHeading label="LAB" />
      <h1 className="mt-4 font-display text-heading-l text-ink">Lab</h1>
      <p className="mt-4 max-w-[42rem] font-display text-body text-ink-muted">{pendingCopy.lab}</p>
    </Container>
  );
}
