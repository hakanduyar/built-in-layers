import { SystemNode } from "@/components/spatial/SystemNode";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import { pendingCopy } from "@/data/copy";
import type { Note } from "@/lib/content/schemas";

type FieldNotesProps = {
  notes: Note[];
};

// IA section 8. Never invents article titles, dates, or categories. Renders real
// entries automatically once data/notes.ts is populated (D-008).
//
// V6.8 (§9) -- THE AWAITING-ENTRY ROWS ARE GONE.
//
// The V6.7 completion pass rendered two "Awaiting entry" capacity rows under the
// one real destination, and the V6.8 review's verdict was exact: labelled empty
// rows still read as "content will be added later", however the implementation
// justifies them. A page has to look complete TODAY.
//
// V6.8 replaced them with a fading dashed continuation rule; the final
// remediation pass removed that too (two reviews read its fade-out as a
// half-drawn box) -- extensibility is now stated once, by the INDEX register's
// real links. One real entry reads as an archive of one, not a list with holes.
//
export function FieldNotes({ notes }: FieldNotesProps) {
  const verifiedNotes = notes.filter((note) => note.verified);

  return (
    <SystemNode index="07" label="Field notes">
      <h2 className="mt-5 font-display text-display-l uppercase text-ink">Field notes</h2>

      {/* FINAL REMEDIATION: the entry, the dashed continuation and the two
          stray links no longer float in a single narrow column with the
          section's right half empty. Left column: the archive itself (real
          entries, or the honest external row). Right column: the archive's INDEX register -- where the writing lives
          and where the full index is -- the same facts that were scattered as
          loose lines, now stated as one composed record. */}
      <div className="mt-10 lg:grid lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-7">
          <ul>
            {verifiedNotes.slice(0, 3).map((note) => (
              <li key={note.url} className="border-t border-line py-6">
                <h3 className="font-display text-heading-m text-ink">
                  <TextLink href={note.url} external>
                    {note.title}
                  </TextLink>
                </h3>
                <p className="mt-2 font-display text-body text-ink-muted">{note.description}</p>
              </li>
            ))}

            {verifiedNotes.length === 0 && (
              <li className="border-t border-ink py-6">
                <span
                  aria-hidden="true"
                  className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
                >
                  External
                </span>
                <p className="mt-3 font-display text-body-l text-ink">
                  {pendingCopy.notesPrefix}{" "}
                  <TextLink href="https://hakanduyar.medium.com/" external>
                    hakanduyar.medium.com
                  </TextLink>
                </p>
              </li>
            )}
          </ul>
          {/* The V6.8 dashed continuation rule was REMOVED here, not restyled:
              with the INDEX register now stating where the archive continues,
              the fading dash was a second device for the same fact, and two
              independent reviews read its fade-out as a half-drawn box. One
              device per fact. */}
        </Reveal>

        <Reveal className="mt-10 lg:col-start-9 lg:col-span-4 lg:mt-0">
          <div className="border-t border-ink pt-6">
            <span
              aria-hidden="true"
              className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
            >
              Index
            </span>
            <ul className="mt-4">
              <li className="flex items-baseline justify-between gap-4 border-t border-line py-2.5">
                <span className="font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                  Archive
                </span>
                <TextLink href="https://hakanduyar.medium.com/" external>
                  Medium
                </TextLink>
              </li>
              <li className="flex items-baseline justify-between gap-4 border-t border-line py-2.5">
                <span className="font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                  Site index
                </span>
                <TextLink href="/notes">See all notes</TextLink>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </SystemNode>
  );
}
