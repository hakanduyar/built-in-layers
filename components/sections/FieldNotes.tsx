import { SystemNode } from "@/components/spatial/SystemNode";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import { pendingCopy } from "@/data/copy";
import type { Note } from "@/lib/content/schemas";

type FieldNotesProps = {
  notes: Note[];
};

/** Where the writing actually lives. One place, stated once. */
const ARCHIVE_URL = "https://hakanduyar.medium.com/";
const ARCHIVE_LABEL = "hakanduyar.medium.com";

// IA section 7. Never invents article titles, dates, or categories.
//
// V9 (§P0) -- THE FOOTPRINT NOW MATCHES THE CONTENT.
//
// `data/notes.ts` is an empty array, by design: D-008 keeps it empty until Hakan
// selects and confirms real articles, and D-009 keeps the section on its honest
// pending path until then. That part was already right.
//
// What was wrong was the SIZE. V6.8 gave this section a full 12-column split --
// a seven-column archive beside a four-column INDEX register -- and then filled
// it with one "External" row and two links, one of which pointed at the same
// Medium URL as the other. Measured on the built page at 1536x864, the run
// between "Field notes" and the next real content was 360px in which real
// content occupied 0.23-0.57% of the viewport: the section was reserving a scene
// and paying for it with air. The owner's verdict was exact -- "no giant scene
// for two small links".
//
// So the empty state is now a BRIDGE, not a scene: one register line, the real
// destination, and the site's own index. It keeps its heading, its node and its
// place in the IA, and it stops claiming the vertical territory of a section
// that has three articles in it.
//
// THE POPULATED STATE IS UNCHANGED IN KIND AND BETTER IN DETAIL. The moment
// `data/notes.ts` carries verified entries, this renders them as real rows with
// their real metadata and takes the space it has earned. Nothing here has to be
// rewritten when that happens -- which is the point of keeping one component for
// both states rather than a placeholder that gets replaced.
export function FieldNotes({ notes }: FieldNotesProps) {
  const verifiedNotes = notes.filter((note) => note.verified).slice(0, 3);

  if (verifiedNotes.length === 0) {
    return (
      <SystemNode index="07" label="Field notes">
        <Reveal>
          {/* One line, on one rule. The heading stays at section scale so the IA
              is unbroken; everything under it is sized for what it actually is. */}
          <div className="border-t border-ink pt-6 lg:flex lg:items-baseline lg:justify-between lg:gap-10">
            <div>
              <h2 className="font-display text-heading-l tracking-heading-l uppercase text-ink">
                Field notes
              </h2>
              <p className="mt-3 max-w-[34rem] font-display text-body text-ink-muted">
                {pendingCopy.notesPrefix}{" "}
                <TextLink href={ARCHIVE_URL} external>
                  {ARCHIVE_LABEL}
                </TextLink>
              </p>
            </div>
            <nav
              aria-label="Field notes"
              className="mt-5 shrink-0 font-mono text-mono-meta tracking-mono-meta uppercase lg:mt-0"
            >
              <TextLink href="/notes">See all notes</TextLink>
            </nav>
          </div>
        </Reveal>
      </SystemNode>
    );
  }

  return (
    <SystemNode index="07" label="Field notes">
      <h2 className="mt-5 font-display text-display-l uppercase text-ink">Field notes</h2>

      <div className="mt-10 lg:grid lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-7">
          <ul>
            {verifiedNotes.map((note) => (
              <li key={note.url} className="border-t border-line py-6">
                <h3 className="font-display text-heading-m text-ink">
                  <TextLink href={note.url} external>
                    {note.title}
                  </TextLink>
                </h3>
                <p className="mt-2 font-display text-body text-ink-muted">{note.description}</p>
              </li>
            ))}
          </ul>
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
                <TextLink href={ARCHIVE_URL} external>
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
