type FigureProps = {
  src: string;
  alt: string;
  caption?: string;
  index?: number;
};

// DESIGN_SYSTEM §9: soft-paper mat, 1px line border, corner ticks (§8 item
// 3, aria-hidden, decorative only), radius-1, mono-meta "FIG NN — caption".
export function Figure({ src, alt, caption, index }: FigureProps) {
  return (
    <figure className="relative border border-line bg-soft-paper p-1 rounded-1">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-2 w-2 border-l border-t border-ink"
      />
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 h-2 w-2 border-r border-t border-ink"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-ink"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-ink"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset paths only, next/image not needed for this primitive */}
      <img src={src} alt={alt} className="block w-full" />
      {caption && (
        <figcaption className="mt-2 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          {index ? `FIG ${String(index).padStart(2, "0")} — ${caption}` : caption}
        </figcaption>
      )}
    </figure>
  );
}
