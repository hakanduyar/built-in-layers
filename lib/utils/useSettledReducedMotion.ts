"use client";

import { useReducedMotion } from "motion/react";
import { useHasMounted } from "@/lib/utils/useHasMounted";

/**
 * `useReducedMotion()`, made hydration-safe.
 *
 * THE BUG THIS FIXES (measured, not theoretical). `useReducedMotion()` cannot
 * know the user's preference during SSR, so it renders `false` on the server and
 * flips to `true` on the first client render for a reduced-motion visitor. Any
 * component that picks a DIFFERENT inline style from that boolean therefore
 * serves one value and hydrates another, which React rejects outright:
 *
 *   Error: Hydration failed because the server rendered HTML didn't match the
 *   client. As a result this tree will be regenerated on the client.
 *
 * Caught in the recovered V6.8 baseline audit by loading the production build
 * with `reducedMotion: "reduce"`: `DriftBlock` served
 * `translateX(... 0.04 ...)` (the block's entry position, from the scroll motion
 * value at progress 0) and hydrated `translateX(... 0.22 ...)` (its reduced-motion
 * mid position). React then discarded and regenerated the subtree, which in turn
 * detached the ref Motion's `useScroll` was watching and produced a second error,
 * "Target ref is defined but not hydrated". One mismatch, two errors, and a whole
 * client-side re-render of the lower page -- for reduced-motion users only, which
 * is exactly the audience least able to absorb a re-render.
 *
 * THE FIX. Report `false` during SSR and the first client render -- so the served
 * and hydrated markup are byte-identical -- then report the real preference once
 * hydration has committed. Reduced-motion users get their static composition a
 * frame later instead of never, and nobody gets a regenerated tree.
 *
 * `SpatialCamera` already gated its whole reduced-motion branch behind
 * `useHasMounted` for this reason; this hook is that same discipline packaged so
 * every consumer gets it by construction rather than by remembering.
 */
export function useSettledReducedMotion(): boolean {
  const mounted = useHasMounted();
  const reduceMotion = useReducedMotion();
  return mounted && Boolean(reduceMotion);
}
