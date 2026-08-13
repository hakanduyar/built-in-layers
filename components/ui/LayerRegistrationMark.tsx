type LayerRegistrationMarkProps = {
  className?: string;
};

// DESIGN_SYSTEM §8 item 5: "Layer registration mark: three stacked 2px bars
// (the visual shorthand for Surface/Flow/System)" -- documented since the
// system's approval but, until this prototype, only ever actually built
// once, inline inside app/opengraph-image.tsx. Extracted here as the real,
// reusable UI primitive that document already called for, using the exact
// same proportions (widths stepped by 24px) and token colors (ink /
// ink-muted / signal) as that OG image, so the mark reads as one consistent
// signature wherever it appears. Purely decorative -- aria-hidden, conveys
// nothing not already present as text next to it.
export function LayerRegistrationMark({ className }: LayerRegistrationMarkProps) {
  return (
    <div aria-hidden="true" className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="block h-0.5 w-6 bg-ink" />
      <span className="block h-0.5 w-4 bg-ink-muted" />
      <span className="block h-0.5 w-2 bg-signal" />
    </div>
  );
}
