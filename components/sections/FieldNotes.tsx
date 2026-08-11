import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import { pendingCopy } from "@/data/copy";
import type { Note } from "@/lib/content/schemas";

type FieldNotesProps = {
  notes: Note[];
};

// IA section 8. Same D-009-adjacent pending copy already live on /notes;
// never invents article titles, dates, or categories. Renders real entries
// automatically once data/notes.ts is populated (D-008). TASK-007: one
// section-level reveal on scroll around whichever primary content block
// renders, matching BuiltForRealLife's treatment of its own pending state.
export function FieldNotes({ notes }: FieldNotesProps) {
  const verifiedNotes = notes.filter((note) => note.verified);

  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="07" label="Field notes" />
      <h2 className="mt-4 font-display text-display-l uppercase text-ink">Field notes</h2>

      {verifiedNotes.length === 0 ? (
        <Reveal className="mt-4 max-w-[42rem]">
          <p className="font-display text-body text-ink-muted">
            {pendingCopy.notesPrefix}{" "}
            <TextLink href="https://hakanduyar.medium.com/" external>
              hakanduyar.medium.com
            </TextLink>
          </p>
        </Reveal>
      ) : (
        <Reveal className="mt-8">
          <ul>
            {verifiedNotes.slice(0, 3).map((note) => (
              <li key={note.url} className="border-t border-line py-6">
                <h3 className="font-display text-heading-m text-ink">
                  <TextLink href={note.url} external>
                    {note.title}
                  </TextLink>
                </h3>
                <p className="mt-2 max-w-[42rem] font-display text-body text-ink-muted">
                  {note.description}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <p className="mt-6">
        <TextLink href="/notes">See all notes</TextLink>
      </p>
    </section>
  );
}
