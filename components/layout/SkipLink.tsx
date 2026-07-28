/** DESIGN_SYSTEM §11: visible on focus as an ink-on-paper bar, top-left. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-mono-label focus:uppercase focus:text-paper"
    >
      Skip to content
    </a>
  );
}
