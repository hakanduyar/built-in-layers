import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { pendingCopy } from "@/data/copy";

export const metadata: Metadata = buildMetadata({
  title: "Notes",
  description: "Selected technical writing, linked from Medium.",
  path: "/notes",
});

// Route shell only -- article selection is a pending Hakan input (D-009).
export default function NotesPage() {
  return (
    <Container>
      <div className="py-16">
        <SectionHeading label="NOTES" />
        <h1 className="mt-4 text-heading-l text-ink">Notes</h1>
        <p className="mt-4 max-w-[42rem] text-body text-ink-muted">
          {pendingCopy.notesPrefix}{" "}
          <TextLink href="https://hakanduyar.medium.com/" external>
            hakanduyar.medium.com
          </TextLink>
          .
        </p>
      </div>
    </Container>
  );
}
