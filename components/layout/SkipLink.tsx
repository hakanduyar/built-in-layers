// DESIGN_SYSTEM.md §11: visible on focus as an --ink on --paper bar, top-left.
// The global :focus-visible outline (never suppressed) provides the visible
// focus indicator on top of this.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:font-mono focus:text-mono-label focus:tracking-mono-label focus:uppercase focus:text-ink"
    >
      Skip to content
    </a>
  );
}
