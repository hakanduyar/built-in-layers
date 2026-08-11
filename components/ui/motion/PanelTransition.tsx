"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type PanelTransitionProps = {
  children: ReactNode;
  /** Remount key: changing it (e.g. to the newly active layer's id)
   *  retriggers the enter transition for the freshly shown panel. */
  panelKey: string;
  /**
   * False only for the very first panel shown the instant the explorer
   * enhances from its stacked no-JS state -- that exact content was
   * already fully visible before hydration (LayerExplorer's own
   * `LayerSection` fallback), so re-fading it in on mount would be a
   * regression, not a reveal. True for every subsequent, real
   * user-triggered tab switch, which is when DESIGN_SYSTEM §12's panel
   * transition actually applies. Found by adversarial review: this
   * component previously animated unconditionally on every mount,
   * including the automatic one hydration itself causes.
   */
  animateEntry: boolean;
};

// DESIGN_SYSTEM §12: Layer Explorer panel change = crossfade + 8px rise,
// <=300ms. This is a distinct case from Reveal: it is only ever mounted
// inside LayerExplorer's already-client-side, already-post-hydration tabs
// branch (never part of the no-JS/SSR output), so -- unlike Reveal -- it
// needs no separate mounted-gate; by the time this component exists at
// all, JavaScript is already running.
export function PanelTransition({ children, panelKey, animateEntry }: PanelTransitionProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion || !animateEntry) {
    return <div key={panelKey}>{children}</div>;
  }

  return (
    <motion.div
      key={panelKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
