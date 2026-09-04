import type { ReactNode } from "react";

type NoteProps = {
  children: ReactNode;
};

// ARCHITECTURE §6 restricted MDX component map: "Note (aside)".
// `max-w-measure` (V13, M2): an aside is running text; it takes the reading
// measure, not the column, so its line never outruns the paragraphs around it.
export function Note({ children }: NoteProps) {
  return (
    <aside className="max-w-measure border-l-2 border-ink bg-soft-paper px-4 py-3 font-display text-body text-ink">
      {children}
    </aside>
  );
}
