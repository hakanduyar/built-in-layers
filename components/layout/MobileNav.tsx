"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavItem } from "@/data/site";

type MobileNavProps = {
  items: NavItem[];
};

// Trigger and dialog are ALWAYS rendered — server and client markup are
// structurally identical. A closed <dialog> has zero layout footprint
// natively, so there is no pre/post-hydration render difference to cause
// CLS (unlike a mount-gated conditional render, which was tried and
// measured to cause a ~240px layout shift on first paint).
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

  // Single close path: native dialog "close" fires for Escape, the close
  // button, and (via an explicit onClick below) route-link selection.
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
                  className="block font-display text-heading-m uppercase text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>

      {/* No-JS fallback: hides the (otherwise inert) trigger via a scoped
          style resolved at HTML-parse time, and exposes every nav link
          directly. Zero JavaScript/hydration dependency. */}
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
