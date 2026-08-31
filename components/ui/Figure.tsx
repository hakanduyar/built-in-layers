import { readIntrinsicDimensions } from "@/lib/utils/imageDimensions";

type FigureProps = {
  src: string;
  alt: string;
  caption?: string;
  index?: number;
  /**
   * FABLE GATE 1 (Q1a): opt-in frame ratio. When set, the media is presented in
   * a fixed-aspect frame and `object-fit: cover` crops the overflow -- the
   * mechanism the gate chose to give a wide, shallow screenshot real vertical
   * presence without distortion and without widening past the accepted width.
   *
   * Strictly additive: when absent (every existing call site, including the
   * frozen Kıvılcım figure), the rendered markup and behaviour are byte-for-byte
   * what they were before this prop existed. The frame reserves its box via
   * `aspect-ratio`, so the TASK-008 CLS guarantee holds in this branch too.
   */
  frameRatio?: number;
  /**
   * Which part of the media the frame keeps, as a CSS object-position value.
   * Only read when `frameRatio` is set. The choice of window is an editorial
   * decision made per call site -- it decides what the caption's claim shows.
   */
  framePosition?: string;
};

// DESIGN_SYSTEM §9: soft-paper mat, 1px line border, corner ticks (§8 item
// 3, aria-hidden, decorative only), radius-1, mono-meta "FIG NN — caption".
export function Figure({ src, alt, caption, index, frameRatio, framePosition }: FigureProps) {
  const dimensions = readIntrinsicDimensions(src);
  const image = (
    /* eslint-disable-next-line @next/next/no-img-element -- static asset paths only, next/image not needed for this primitive */
    <img
      src={src}
      alt={alt}
      fetchPriority="low"
      decoding="async"
      className={frameRatio ? "block h-full w-full object-cover" : "block h-auto w-full"}
      style={frameRatio && framePosition ? { objectPosition: framePosition } : undefined}
      {...dimensions}
    />
  );
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
      {/* TASK-008 (Lighthouse-measured, 2026-08-11): every Figure usage
          (ProjectCard thumbnails, case-study layer figures) sits below the
          real LCP candidate (each page's own text h1) -- React 19's
          automatic initial-render image preloading was hoisting all of
          them, including a 338KB screenshot, into high-priority <link
          rel="preload"> requests competing with the page's actual critical
          path. fetchPriority="low" suppresses that auto-preload hinting
          while still fetching the image in normal document order --
          `loading="lazy"` was tried first and reverted: combined with this
          `<img>` having no explicit width/height, native lazy-loading left
          the element at a genuine 0x0 layout box (no reserved space) until
          it scrolled near the viewport, a real CLS/visibility regression
          caught by tests/e2e/home.spec.ts, not merely a test artifact. */}
      {/* TASK-008 (Lighthouse-measured, 2026-08-12): a real CLS regression
          (0.068, /work) traced to this <img> never having had explicit
          width/height -- readIntrinsicDimensions reads each asset's real
          pixel size directly so the browser can reserve its layout box
          before the file loads (the mechanism ARCHITECTURE §9 already
          described but this component never actually implemented).
          h-auto keeps the element fully responsive at its reserved
          aspect ratio; dimensions is null (attributes omitted) only for a
          format readIntrinsicDimensions doesn't recognize -- unchanged
          prior behavior, not a regression. */}
      {frameRatio ? (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${frameRatio}` }}>
          {image}
        </div>
      ) : (
        image
      )}
      {caption && (
        <figcaption className="mt-2 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          {index ? `FIG ${String(index).padStart(2, "0")} — ${caption}` : caption}
        </figcaption>
      )}
    </figure>
  );
}
