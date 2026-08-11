"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { LayerSection } from "@/components/project/LayerSection";
import { PanelTransition } from "@/components/ui/motion/PanelTransition";
import { useHasMounted } from "@/lib/utils/useHasMounted";

type LayerKey = "surface" | "flow" | "system";

type LayerExplorerProps = {
  layers: { surface: ReactNode; flow: ReactNode; system: ReactNode };
};

const ITEMS: Array<{ key: LayerKey; label: "Surface" | "Flow" | "System" }> = [
  { key: "surface", label: "Surface" },
  { key: "flow", label: "Flow" },
  { key: "system", label: "System" },
];

// ARCHITECTURE §12 / DESIGN_SYSTEM §12 / revised D-006: WAI-ARIA Tabs with
// manual activation. All three layers arrive already server-rendered
// (compiled MDX from lib/content/work.ts) as props/children -- this
// component only ever toggles which already-rendered subtree is visible;
// it never fetches, recompiles, or duplicates project content client-side.
//
// Progressive enhancement: before hydration commits (server output, and the
// first client render), `enhanced` is false on both server and client --
// identical markup, no hydration mismatch (via `useHasMounted`, a
// `useSyncExternalStore` check, not a setState-in-effect) -- and the
// component renders the exact same stacked `LayerSection`s the site
// shipped before this task. Only after mount does it re-render into the
// tablist/tabpanel structure. No-JS users therefore get the full stacked,
// always-visible, always-indexable rendering forever, unchanged.
export function LayerExplorer({ layers }: LayerExplorerProps) {
  const enhanced = useHasMounted();
  const [active, setActive] = useState<LayerKey>("surface");
  const [focusedIndex, setFocusedIndex] = useState(0);
  // Adversarial review finding: the very first panel shown the instant the
  // explorer enhances (still Surface, still the same content the no-JS
  // stacked view already painted) must NOT replay an enter animation --
  // that content was already fully visible before hydration. Only a real,
  // user-triggered tab switch should play DESIGN_SYSTEM §12's panel-change
  // transition. Tracked as state (not a ref) because it's read during
  // render to choose PanelTransition's behavior, and this project's lint
  // config forbids reading refs during render.
  const [hasSwitchedTabs, setHasSwitchedTabs] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const idPrefix = useId();

  if (!enhanced) {
    return (
      <div>
        {ITEMS.map((item) => (
          <LayerSection key={item.key} label={item.label}>
            {layers[item.key]}
          </LayerSection>
        ))}
      </div>
    );
  }

  function tabId(key: LayerKey) {
    return `${idPrefix}-tab-${key}`;
  }
  function panelId(key: LayerKey) {
    return `${idPrefix}-panel-${key}`;
  }

  function focusTab(index: number) {
    const wrapped = (index + ITEMS.length) % ITEMS.length;
    setFocusedIndex(wrapped);
    tabRefs.current[wrapped]?.focus();
  }

  function activateTab(index: number) {
    const item = ITEMS[index];
    if (!item) return;
    setFocusedIndex(index);
    setActive(item.key);
    setHasSwitchedTabs(true);
    // Adversarial review finding: a mouse/touch click on a <button> does not
    // move real DOM focus in WebKit/Safari (Chromium does this natively).
    // Without this, clicking a tab in Safari would leave the visible focus
    // ring on whatever was previously focused, and a subsequent Tab press
    // would resume from that stale position instead of the tab the user
    // just activated.
    tabRefs.current[index]?.focus();
  }

  // Manual activation (revised D-006): ArrowLeft/ArrowRight and Home/End
  // move focus only. Enter/Space activation is native <button> behavior --
  // no handler needed for those keys.
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(ITEMS.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Case study layers"
        // DESIGN_SYSTEM §12: "On mobile the tablist is a single
        // wrapping/scrollable row" -- overflow-x-auto is the safe default
        // for a translation-ready label set (current English labels never
        // need it, but nothing structurally prevented an overflow before).
        className="flex gap-6 overflow-x-auto border-b border-line"
      >
        {ITEMS.map((item, index) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              type="button"
              id={tabId(item.key)}
              aria-controls={panelId(item.key)}
              aria-selected={isActive}
              tabIndex={focusedIndex === index ? 0 : -1}
              onClick={() => activateTab(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={
                "flex min-h-11 min-w-11 items-center justify-center gap-2 border-b-2 pb-2 font-mono text-mono-label tracking-mono-label uppercase transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] " +
                (isActive
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-muted hover:border-line hover:text-ink")
              }
            >
              {isActive && <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal-ui" />}
              {item.label}
            </button>
          );
        })}
      </div>

      {ITEMS.map((item) => (
        <div
          key={item.key}
          role="tabpanel"
          id={panelId(item.key)}
          aria-labelledby={tabId(item.key)}
          hidden={active !== item.key}
          // WAI-ARIA APG: a tabpanel with no guaranteed focusable content
          // (project layer prose is often plain headings/paragraphs) needs
          // tabIndex={0} so keyboard users can reach and scroll it -- without
          // this, Tab skips straight over the panel's own content entirely.
          tabIndex={0}
        >
          {active === item.key && (
            <div className="mt-8 max-w-[42rem] font-display text-body text-ink">
              <PanelTransition panelKey={item.key} animateEntry={hasSwitchedTabs}>
                {layers[item.key]}
              </PanelTransition>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
