type ExposedGridLinesProps = {
  columns?: number;
  /** Which 1-indexed column lines to actually draw. Omitted = every line
   *  (the original continuous field). All `columns` tracks still exist in
   *  the underlying grid either way, so a sparse `lines` set stays aligned
   *  to the exact same column geometry as the full field -- these are
   *  fragments of one real grid, not a separate smaller one. */
  lines?: number[];
  className?: string;
};

// DESIGN_SYSTEM principle #2: "The grid is visible on purpose." This makes
// the real 12-column grid the section is already laid out on briefly
// visible as a background texture -- not an invented decoration, a literal
// rendering of the same column lines every grid-based section already
// aligns to. Desktop only (the mobile layout collapses to a single column,
// where exposing grid lines has nothing to demonstrate); aria-hidden and
// non-interactive.
//
// PROTOTYPE V2 revision: V1 rendered every column line as a full-height
// field, which the visual review correctly read as generic design-tool
// wallpaper rather than a structural device. `lines` restricts drawing to
// specific column starts -- callers now pass only the lines that coincide
// with a real content anchor (where a name, a step, or a panel actually
// starts), and pair `className` with an explicit height/position instead of
// `inset-0`/`h-full` so a fragment reads as "this coordinate matters," not
// "here is the whole grid."
export function ExposedGridLines({ columns = 12, lines, className }: ExposedGridLinesProps) {
  const active = lines ?? Array.from({ length: columns }, (_, index) => index + 1);
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none hidden lg:grid ${className ?? "absolute inset-0"}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: "24px" }}
    >
      {Array.from({ length: columns }, (_, index) => {
        const column = index + 1;
        return (
          <span
            key={column}
            className={active.includes(column) ? "h-full border-l border-line/40" : "h-full"}
          />
        );
      })}
    </div>
  );
}
