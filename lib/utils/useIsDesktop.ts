"use client";

import { useEffect, useState } from "react";

const QUERY = "(min-width: 1024px)";

/**
 * V14.3 Gate E: whether the viewport is at Tailwind's `lg` breakpoint, settled
 * after mount. Starts `false` on the server and on the first client render, so
 * server and client always agree, and flips once the media query is read --
 * the same discipline `useSettledReducedMotion` follows. Used to keep the
 * desktop-only presentation timing (earlier reveals, earlier presence) off the
 * mobile composition the V13 gate froze.
 */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return desktop;
}
