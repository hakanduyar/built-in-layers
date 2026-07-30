import type { ReactNode } from "react";

type NoteProps = {
  children: ReactNode;
};

// ARCHITECTURE §6 restricted MDX component map: "Note (aside)".
export function Note({ children }: NoteProps) {
  return (
    <aside className="border-l-2 border-ink bg-soft-paper px-4 py-3 font-display text-body text-ink">
      {children}
    </aside>
  );
}
