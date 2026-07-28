"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavItem } from "@/data/site";

type MobileNavProps = {
  items: NavItem[];
};

/**
 * The one Client Component in TASK-002 (revised D-005).
 *
 * The MENU trigger and its closed `<dialog>` are always rendered -- present
 * identically from first paint, before and after hydration. A closed
 * `<dialog>` is `display: none` natively (zero layout footprint), and the
 * trigger's `aria-expanded`/`aria-controls` are static markup, so there is
 * no structural difference for JS-enabled users to ever flash between: no
 * mount-detection gate, no layout shift.
 *
 * (An earlier version gated the trigger behind a `useSyncExternalStore`
 * "mounted" check and rendered a full stacked link list as the pre-mount
 * fallback. That fallback was ~240px taller than the collapsed header,
 * so hydration caused a large, measured layout collapse -- confirmed via
 * a delayed-JS Chromium/WebKit test before this fix. Removed.)
 *
 * No-JS fallback: a `<noscript>` block renders the plain, always-reachable
 * link list and hides the (otherwise inert without JS) trigger via a
 * noscript-scoped `<style>` override. Browsers only parse/apply `<noscript>`
 * content -- including the nested `<style>` -- when scripting is disabled,
 * so this resolves natively at parse time, with no JavaScript involved and
 * no dependency on hydration timing.
 *
 * The panel uses the native `<dialog>` element opened via `showModal()`,
 * which gives focus containment, Escape-to-close, and background-inert
 * behavior for free from the browser in both Chromium and WebKit --
 * avoiding hand-rolled ARIA that native HTML already provides correctly.
 */
export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleDialogClose() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        id="mobile-nav-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center font-mono text-mono-label tracking-mono-label uppercase text-ink"
      >
        Menu
      </button>

      <dialog
        id="mobile-nav-panel"
        ref={dialogRef}
        aria-label="Primary navigation"
        onClose={handleDialogClose}
        className="m-0 h-dvh max-h-none w-full max-w-none border-none bg-paper p-6"
      >
        <div className="flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-mono text-mono-label tracking-mono-label uppercase text-ink"
          >
            Close
          </button>
        </div>
        <nav aria-label="Primary">
          <ul className="mt-8 flex flex-col gap-6">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-heading-m font-display uppercase text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>

      <noscript>
        <style>{"#mobile-nav-trigger { display: none; }"}</style>
        <nav aria-label="Primary">
          <ul className="flex flex-col gap-2 py-4">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block min-h-11 py-3 font-mono text-mono-label tracking-mono-label uppercase text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </noscript>
    </div>
  );
}
