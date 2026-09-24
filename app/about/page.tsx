import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { aboutIntro, workIndexLabel } from "@/data/copy";
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
      {/* V9 (§P0): the real introduction, replacing "A fuller introduction is
          coming here." Assembled only from facts this repository already asserts
          — see the note on `aboutIntro` in data/copy.ts for the source of every
          claim and for what is deliberately NOT said. */}
      {/* V13 (M2): running text takes the `measure` token (34rem below `lg`,
          42rem from `lg`). The lead keeps its approved 46rem on the desktop. */}
      <p className="mt-6 max-w-measure font-display text-body-l text-ink lg:max-w-[46rem]">
        {aboutIntro.lead}
      </p>
      <p className="mt-5 max-w-measure font-display text-body text-ink-muted">
        {aboutIntro.method}
      </p>
      <p className="mt-4 max-w-measure font-display text-body text-ink-muted">
        {aboutIntro.practice}
      </p>
      <p className="mt-4 max-w-measure font-display text-body text-ink-muted">
        {aboutIntro.honesty}
      </p>
      <p className="mt-8 max-w-measure font-display text-body text-ink-muted">
        The systems themselves are on the{" "}
        <TextLink href="/work">{workIndexLabel.toLowerCase()}</TextLink>. For anything else, reach
        me on{" "}
        <TextLink href={contactUrl} external>
          LinkedIn
        </TextLink>
        .
      </p>
    </Container>
  );
}
