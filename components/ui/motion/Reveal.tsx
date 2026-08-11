"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useHasMounted } from "@/lib/utils/useHasMounted";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in milliseconds, for a tight sibling group (e.g. the
   *  Hero's 3 lines, Selected Systems' cards). DESIGN_SYSTEM §13: <=90ms
   *  between siblings, max 5 staggered items. */
  delayMs?: number;
  /**
   * Set for content that is always on screen at page load (the Hero).
   * DESIGN_SYSTEM §13 treats "Hero intro: one staggered reveal on load" as
   * a distinct pattern from "Scroll-triggered reveals" (everything else,
   * threshold ~0.2). On-load reveals never consult `useInView` at all --
   * belt-and-suspenders on top of the asymmetric-transition fix below,
   * specifically for the one section where even a single-frame dip would
   * be most noticeable (the very first thing a visitor sees).
   */
  onLoad?: boolean;
};

// DESIGN_SYSTEM §13 "Scroll-triggered reveals" + "Hero intro": opacity fade
// + vertical translate <=16px, once per element, threshold ~0.2, duration
// and easing matching the existing --duration-base/--ease-standard tokens
// (kept as literal numbers here since Motion's transition prop takes plain
// values, not CSS var() references -- these are the *same* approved values,
// not new ones).
//
// Progressive enhancement (this task's hard requirement): the element is
// ALWAYS a `motion.div` -- server, first client render, and every render
// after -- so `ref` never retargets a different DOM node across the mount
// boundary (an earlier version swapped between a plain `<div>` and a
// `motion.div`, which silently broke `useInView`'s one-time observer: the
// hook attached to the first, throwaway node and never re-fired on the
// real one, leaving content stuck at `opacity: 0` after hydration --
// caught empirically via a computed-opacity trace).
//
// A second, more serious bug was found the same way by an independent
// adversarial review, with a real non-scrolling browser trace: once
// `mounted` flips true, below-the-fold content (everything not already on
// screen) legitimately has `inView === false` at that instant -- `useInView`
// always *starts* false and only confirms true/false asynchronously via its
// own IntersectionObserver callback, on a completely separate schedule from
// `useHasMounted`'s notification. `animate` therefore goes from `visible`
// (the honest pre-hydration state) to `hidden` -- and because this is a
// *change*, not the element's first paint, Motion animates it: real,
// visible content silently fades to invisible the instant JavaScript
// finishes loading, well before the user has scrolled anywhere near it --
// the exact opposite of progressive enhancement, and a direct violation of
// "nothing animates below the fold before the user reaches it."
// Fixed by making the transition duration depend on *direction*: going to
// `hidden` is instant (a single, imperceptible layout-only change quietly
// arming the reveal before the user could ever see it) while going to
// `visible` still animates normally over the full duration -- that second
// case is the only one DESIGN_SYSTEM §13 actually asks to look like a
// "reveal" (either the genuine scroll-into-view case, or `onLoad` content
// whose `inView` was true from the very first animated render).
export function Reveal({ children, className, delayMs = 0, onLoad = false }: RevealProps) {
  const mounted = useHasMounted();
  const ref = useRef<HTMLDivElement>(null);
  // Always called (Rules of Hooks) even for onLoad reveals -- its result is
  // simply unused there. The observer overhead is negligible at this scale
  // (a handful of Reveal instances per page).
  const asyncInView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();

  const inView = onLoad || asyncInView;
  const shouldAnimate = mounted && !reduceMotion;
  const visible = { opacity: 1, y: 0 };
  const hidden = { opacity: 0, y: 16 };
  const target = shouldAnimate ? (inView ? visible : hidden) : visible;

  return (
    <motion.div
      ref={ref}
      className={className}
      data-reveal="true"
      animate={target}
      transition={{
        duration: target === hidden ? 0 : 0.24,
        ease: [0.2, 0, 0, 1],
        delay: target === hidden ? 0 : delayMs / 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
