import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { notFoundCopy } from "@/data/copy";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Page not found",
  description: notFoundCopy.body,
  path: "/404",
});

export default function NotFound() {
  return (
    <Container className="py-16">
      <p aria-hidden="true" className="font-display text-display-l uppercase text-ink">
        404
      </p>
      <h1 className="mt-4 font-display text-heading-l text-ink">{notFoundCopy.heading}</h1>
      <p className="mt-4 max-w-[42rem] font-display text-body text-ink-muted">
        {notFoundCopy.body}
      </p>
      <nav aria-label="Suggested pages" className="mt-8">
        <ul className="flex gap-6">
          <li>
            <TextLink href="/">Home</TextLink>
          </li>
          <li>
            <TextLink href="/work">Work</TextLink>
          </li>
        </ul>
      </nav>
    </Container>
  );
}
