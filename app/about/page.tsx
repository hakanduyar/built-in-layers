import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { socialLinks } from "@/data/site";
import { pendingCopy } from "@/data/copy";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "A short introduction to Hakan Duyar, with links to GitHub, LinkedIn, and Medium.",
  path: "/about",
});

// Route shell only -- the full story/career content is a later task.
export default function AboutPage() {
  return (
    <Container>
      <div className="py-16">
        <SectionHeading label="ABOUT" />
        <h1 className="mt-4 text-heading-l text-ink">About</h1>
        <p className="mt-4 max-w-[42rem] text-body text-ink-muted">
          {pendingCopy.about}{" "}
          {socialLinks.map((link, index) => (
            <span key={link.url}>
              <TextLink href={link.url} external>
                {link.label}
              </TextLink>
              {index < socialLinks.length - 2 && ", "}
              {index === socialLinks.length - 2 && " and "}
            </span>
          ))}
          .
        </p>
      </div>
    </Container>
  );
}
