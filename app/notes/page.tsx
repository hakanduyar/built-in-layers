import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { pendingCopy } from "@/data/copy";
import { notes } from "@/data/notes";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Notes",
  description: "Selected technical writing by Hakan Duyar.",
  path: "/notes",
});

export default function NotesPage() {
  const verifiedNotes = notes.filter((note) => note.verified);

  return (
    <Container className="py-16">
      <SectionHeading label="NOTES" />
      <h1 className="mt-4 font-display text-heading-l text-ink">Notes</h1>

      {verifiedNotes.length === 0 ? (
        <p className="mt-4 max-w-measure font-display text-body text-ink-muted">
          {pendingCopy.notesPrefix}{" "}
          <TextLink href="https://hakanduyar.medium.com/" external>
            hakanduyar.medium.com
          </TextLink>
        </p>
      ) : (
        <ul className="mt-8">
          {verifiedNotes.map((note) => (
            <li key={note.url} className="border-t border-line py-6">
              <MonoLabel className="text-ink-muted">{note.category}</MonoLabel>
              {/* V13 (mobile gate, M4): same title-as-route pattern as
                  ProjectCard, so it takes the same 44px hit box below `lg`. */}
              <h3 className="mt-2 font-display text-heading-m text-ink">
                <TextLink
                  href={note.url}
                  external
                  className="max-lg:inline-block max-lg:touch-link"
                >
                  {note.title}
                </TextLink>
              </h3>
              <p className="mt-2 max-w-measure font-display text-body text-ink-muted">
                {note.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
