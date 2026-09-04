"use client";

import { useEffect, useId, useRef, useState } from "react";

type FigureInspectProps = {
  src: string;
  alt: string;
  /** The figure's caption line as rendered ("FIG 03 — ..."), reused as the plate's title. */
  title: string;
  /** Intrinsic pixel width of the asset, when known (Figure's readIntrinsicDimensions). */
  width?: number;
  height?: number;
};

/**
 * V13 mobile gate (M1). The width the plate is laid out at inside the
 * inspector. The 13 verified diagrams are 1600 units wide and their smallest
 * label is 14 units (jointledger/book-data-model.svg); at 1400px that label
 * renders at 12.25px, the mono-meta floor DESIGN_SYSTEM §3 sets for the
 * smallest type on the site. The screenshots are 1400-1878px wide, so they
 * sit at or just under 1:1. Nothing is drawn that is not in the source file:
 * the inspector shows the same asset, at a width at which it can be read.
 */
export const INSPECT_PLATE_WIDTH = 1400;

// The mobile figure strategy. Below `lg` a case-study figure sits in a
// 288-736px column, which puts a 1600-unit diagram at 0.18-0.46 of its
// intrinsic size and its labels at 3-6 CSS px (docs/MOBILE_AUDIT.md, M1).
// Rather than a redrawn "mobile diagram" (invented content) or a phone-sized
// crop (hidden content), the plate keeps its place in the argument at column
// width and gains one control: INSPECT opens the same asset in a native modal
// dialog at INSPECT_PLATE_WIDTH, on paper, panning on both axes, with the
// browser's own pinch-zoom on top. Trigger and dialog are always rendered
// (the MobileNav precedent: a closed <dialog> has zero layout footprint, so
// there is no pre/post-hydration difference to shift layout); only the
// plate's <img> is mounted while open, so the page never carries a second
// copy of the figure and never fetches one it does not show.
export function FigureInspect({ src, alt, title, width, height }: FigureInspectProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Single close path: native "close" fires for Escape and for the button.
  function handleDialogClose() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  const plateWidth = width ? Math.min(width, INSPECT_PLATE_WIDTH) : INSPECT_PLATE_WIDTH;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-figure-inspect=""
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 shrink-0 items-center font-mono text-mono-label tracking-mono-label uppercase text-ink lg:hidden"
      >
        Inspect
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={handleDialogClose}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden overscroll-contain border-none bg-paper p-0 text-ink"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-1">
            <p
              id={titleId}
              className="min-w-0 font-mono text-mono-meta tracking-mono-meta text-ink-muted"
            >
              {title}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center font-mono text-mono-label tracking-mono-label uppercase text-ink"
            >
              Close
            </button>
          </div>
          {/* Both axes scroll; overscroll stays inside the plate so a pan that
              runs out of diagram never scrolls the case study underneath. */}
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-4">
            {/* Above the plate, where the eye lands on open; it pans away with
                the plate's top edge instead of waiting below 1400px of diagram. */}
            <p className="mb-3 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
              Pan to read. Pinch to zoom.
            </p>
            {open && (
              <div className="relative w-max border border-line bg-soft-paper p-1 rounded-1">
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
                {/* eslint-disable-next-line @next/next/no-img-element -- the same static asset the figure shows, laid out at a fixed reading width */}
                <img
                  src={src}
                  alt={alt}
                  decoding="async"
                  width={width}
                  height={height}
                  className="block h-auto max-w-none"
                  style={{ width: `${plateWidth}px` }}
                />
              </div>
            )}
          </div>
        </div>
      </dialog>

      {/* No-JS fallback: the trigger can do nothing without a script, so a
          parse-time style hides it; the figure itself is unaffected. */}
      <noscript>
        <style>{"[data-figure-inspect] { display: none; }"}</style>
      </noscript>
    </>
  );
}
