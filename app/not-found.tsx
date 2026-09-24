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
      <p className="mt-4 max-w-measure font-display text-body text-ink-muted">
        {notFoundCopy.body}
      </p>
      {/* V13 (mobile gate, M4): the page's only two routes onward were 43x21
          and 37x21 targets on phones; `touch-link` gives each 44px below `lg`. */}
      <nav aria-label="Suggested pages" className="mt-8">
        <ul className="flex gap-6">
          <li>
            <TextLink href="/" className="max-lg:inline-block max-lg:touch-link">
              Home
            </TextLink>
          </li>
          <li>
            <TextLink href="/work" className="max-lg:inline-block max-lg:touch-link">
              Work
            </TextLink>
          </li>
        </ul>
      </nav>
    </Container>
  );
}
