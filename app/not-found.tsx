import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { notFoundCopy } from "@/data/copy";

export const metadata: Metadata = buildMetadata({
  title: "Page not found",
  description: notFoundCopy.body,
  path: "/404",
});

export default function NotFound() {
  return (
    <Container>
      <div className="py-24">
        <p aria-hidden="true" className="font-display text-display-l uppercase text-ink">
          404
        </p>
        <h1 className="mt-2 text-heading-l text-ink">{notFoundCopy.heading}</h1>
        <p className="mt-4 max-w-[42rem] text-body text-ink-muted">{notFoundCopy.body}</p>
        <nav aria-label="Suggested pages" className="mt-8 flex gap-6">
          <TextLink href="/">Home</TextLink>
          <TextLink href="/work">Work</TextLink>
        </nav>
      </div>
    </Container>
  );
}
