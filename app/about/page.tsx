import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { pendingCopy } from "@/data/copy";
import { contactUrl } from "@/data/site";
import { buildMetadata, buildPersonJsonLd } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "About Hakan Duyar, Frontend & Product Engineer.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container className="py-16">
      <JsonLd data={buildPersonJsonLd()} />
      <SectionHeading label="ABOUT" />
      <h1 className="mt-4 font-display text-heading-l text-ink">About</h1>
      <p className="mt-4 max-w-[42rem] font-display text-body text-ink-muted">
        {pendingCopy.aboutPrefix}{" "}
        <TextLink href={contactUrl} external>
          LinkedIn
        </TextLink>
        .
      </p>
    </Container>
  );
}
