# TASK-007 — Motion layer & interactive explorer

Status: **COMPLETE (2026-08-11)** — reviewed and approved. Hard gate satisfied (TASK-003/004/005/006 all COMPLETE, three case studies published: Kıvılcım, DropSpot, JointLedger). **7 of 7 acceptance criteria genuinely met**, verified via unit tests (RTL), Playwright (Chromium + WebKit, including a dedicated `reducedMotion: 'reduce'` suite and a no-JS suite), an independent three-track adversarial code review, and direct empirical browser tracing (not just automated assertions — two real bugs were found this way that the automated suite alone did not catch; see the dated `docs/PROGRESS.md` log entries for the full account). Re-verified in full at finalization: file-inventory reconciled, full quality suite re-run clean (364 unit / 224 Playwright), fresh-production-server route matrix and console/hydration checks clean, no-JS raw HTML re-confirmed, four-width visual QA re-confirmed. TASK-008 next.

## Objective

Add the interaction layer: the Surface/Flow/System explorer becomes an accessible ARIA tab interface (homepage and case-study pages), plus the restrained site-wide motion defined in DESIGN_SYSTEM §13 — all fully degradable (no-JS = current stacked rendering; reduced-motion = instant states).

## In scope

- Install `motion` (Motion for React) — the only new dependency.
- `components/ui/motion/Reveal.tsx` (and at most one more wrapper if genuinely needed): client wrappers around Motion primitives; every wrapper calls `useReducedMotion()` and renders final state when reduction is requested. Raw `motion.*` usage outside `components/ui/motion/` is forbidden.
- `components/project/LayerExplorer.tsx` (client): WAI-ARIA Tabs per ARCHITECTURE §12 + DESIGN_SYSTEM §12 with **manual activation** (revised D-006) — `tablist/tab/tabpanel` roles and relationships correct, roving tabindex, **ArrowLeft/ArrowRight move tab focus without activating, Home/End move to first/last tab, Enter/Space activate the focused tab**, `aria-selected`, ≥44px targets, visual states exactly per the §12 table, crossfade+8px rise ≤300ms panel transition. Receives layer content as server-rendered props/children (content compilation stays on the server; the client component only switches visibility).
- Progressive enhancement wiring: server renders the stacked `LayerSection`s (existing); the explorer enhances them into tabs on hydration. No-JS output remains the stacked version.
- Homepage `LayerExplorerIntro` upgraded to preview a featured project's real layers via the explorer.
- Case-study pages: layer sections gain the explorer treatment where `depth: full|short` (stacked remains the semantic fallback).
- Site-wide motion: hero intro stagger (≤700ms total), once-per-element section reveals (section-level only), hover/underline transitions using duration/easing tokens. Applied strictly within DESIGN_SYSTEM §13 allowed-movements list.
- CSS reduced-motion clamp verified end-to-end (already in globals from TASK-001).
- Tests: RTL — tab roles, manual-activation keyboard contract (arrows move focus without activating; Enter/Space activate; Home/End), `aria-selected`, reduced-motion branch; Playwright — keyboard-only layer switching with manual activation, `reducedMotion: 'reduce'` run of the full smoke suite, no-JS check (JS disabled context) that all three layer sections remain visible, ordered, labelled, and readable.

## Out of scope

- Any new animation type outside DESIGN_SYSTEM §13 (parallax, scroll-linked, scale, springs — forbidden).
- Layout/copy/design changes to approved static pages (motion must not move layout — reserve space, animate opacity/transform only).
- Page transitions, route animations, loading screens. New content. SEO work.

## Dependencies

- Phases 3 (content system) & 4 (static layout) approved — static-layout gate honored. Revised D-006 (manual activation) resolved 2026-07-17. `motion` pre-approved in ARCHITECTURE §14.

## Exact files expected to be created or changed

```text
Created: components/ui/motion/Reveal.tsx,
  components/project/LayerExplorer.tsx,
  tests/unit/layer-explorer.test.tsx, tests/e2e/motion.spec.ts
Changed: components/sections/Hero.tsx, LayerExplorerIntro.tsx,
  components/sections/* (reveal wiring only),
  components/project/LayerSection.tsx (enhancement hooks),
  app/work/[slug]/page.tsx (explorer composition),
  package.json/pnpm-lock.yaml (motion)
```

**Actual final file list (2026-08-11), reconciled against the plan above:**
`components/project/LayerSection.tsx` needed no changes at all — `LayerExplorer`'s pre-mount branch reuses it exactly as-is, so no "enhancement hooks" turned out to be necessary. Two genuine additions beyond the plan: `components/ui/motion/PanelTransition.tsx` (a second motion wrapper — the plan itself allows "at most one more wrapper if genuinely needed"; justified because it serves a materially different trigger, a post-hydration tab-swap remount, than `Reveal`'s scroll/load-based reveal) and `lib/utils/useHasMounted.ts` (a small, non-motion hydration-safety utility, needed because this project's `react-hooks/set-state-in-effect` lint rule forbids the classic `useState`+`useEffect` mount-detection pattern; shared because the exact same pattern was independently needed in both `Reveal.tsx` and `LayerExplorer.tsx`, meeting ARCHITECTURE §17's "two or more real places" bar for a `lib/utils/` primitive). `components/project/ProjectCard.tsx` and `components/ui/TextLink.tsx` were also changed — both fall under this task's own explicitly-approved "Project-card interactions" and "hover/underline transitions using duration/easing tokens" allowances, reviewed and confirmed in-scope, not a deviation.

## Implementation steps

1. Read docs; report plan incl. exact list of elements that will animate; `git status`.
2. Install `motion`; build `Reveal` with reduced-motion branch; unit-test the branch.
3. Build `LayerExplorer` test-first (roles → keyboard → state visuals → transition); wire on homepage, then case studies.
4. Verify no-JS output unchanged (build + JS-disabled pass).
5. Apply hero intro + section reveals per the approved element list; count animated elements per DESIGN_SYSTEM limits.
6. Full gate run incl. reduced-motion Playwright project; manual OS-level reduced-motion pass; report.

## Acceptance criteria

- [x] All verification commands pass, including the reduced-motion e2e run. **Met (2026-08-11)**: `pnpm typecheck && pnpm lint && pnpm format:check` clean; `pnpm test` 364/364; `rm -rf .next && pnpm build` clean (6 routes); `pnpm exec playwright test` 224/224 on Chromium + WebKit, including `tests/e2e/motion.spec.ts`'s dedicated `test.describe("Motion: reducedMotion emulation")` block (`contextOptions: { reducedMotion: "reduce" }` — this installed Playwright version, 1.62.0, nests the option there rather than accepting it as a top-level `test.use()` key; confirmed against the installed package's own type definitions, not assumed from older API docs).
- [x] LayerExplorer: complete keyboard operation with manual activation (arrows/Home/End move focus; Enter/Space activate); correct ARIA roles and relationships; state visuals match DESIGN_SYSTEM §12 table; panels swap real, distinct content. **Met, independently re-verified (2026-08-11)**: `tests/unit/layer-explorer.test.tsx` (10 RTL tests: roles, roving tabindex, click activation, manual-activation keyboard contract — ArrowRight moves focus without activating, Enter then activates, Home/End, wraparound, reduced-motion branch) plus `tests/e2e/motion.spec.ts` (real-browser keyboard/touch/focus-visibility coverage). An independent adversarial accessibility review additionally found and this pass fixed three real gaps not caught by the original implementation or its own first test pass: (1) tab buttons had no structural touch-target *width* guarantee (`min-h-11` alone, no `min-w-11`) — fixed; (2) `tabpanel` had no `tabIndex={0}` fallback, so a keyboard user could Tab straight past a panel with no focusable content inside it — fixed; (3) clicking a tab only updated React state, never real DOM focus, which is a genuine WebKit/Safari gap (Chromium focuses buttons on click, WebKit does not) — fixed by calling `.focus()` in `activateTab`. All three fixes verified empirically against real rendered/measured DOM, not just re-reading the code.
- [x] With JS disabled: all three layer sections visible, ordered, labelled, and readable on every page that has the explorer — project content never depends on JavaScript. **Met, verified two independent ways (2026-08-11)**: `tests/e2e/motion.spec.ts`'s `javaScriptEnabled: false` suite (homepage preview + case-study page, zero `role="tab"`/`"tablist"` present, real Kıvılcım prose readable) and a direct `curl` of the raw server HTML for `/` and `/work/kivilcim` — confirms real `<h2>Surface</h2>`/`<h2>Flow</h2>`/`<h2>System</h2>` headings and zero `role="tab...` occurrences before any JavaScript could possibly run.
- [x] With reduced motion: zero reveals/transitions; content complete; layer switch instant. **Met (2026-08-11)**: verified via `tests/e2e/motion.spec.ts`'s reduced-motion suite and a full-page screenshot at 375px with `reducedMotion: "reduce"` emulated — every section renders fully visible immediately, no pending reveals. `PanelTransition` and `Reveal` both branch on `useReducedMotion()` to the fully static, non-animated case.
- [x] Only `motion` added; client components added by this task limited to `LayerExplorer` + `components/ui/motion/*` (the existing `MobileNav` from TASK-002 is unchanged). **Met, independently re-verified (2026-08-11)**: `package.json` diff is exactly one line (`"motion": "^13.0.0"`); `pnpm-lock.yaml`'s new entries (`framer-motion`, `motion-dom`, `motion-utils`) are all inside `motion`'s own resolved dependency tree, confirmed by reading the lockfile's `snapshots:` block directly, not assumed. `grep '"use client"'` across the full diff returns exactly `Reveal.tsx`, `PanelTransition.tsx`, `LayerExplorer.tsx` — `components/layout/MobileNav.tsx` is untouched (confirmed absent from `git status --short`).
- [x] No layout shift caused by any animation (space reserved). **Met (2026-08-11)**: a dedicated Playwright test scrolls the Layer Explorer's tablist into view first, then confirms its own bounding box doesn't move (`<2px` in either axis) across a tab switch — an earlier version of this test falsely measured a ~2231px "shift" that was actually Playwright's own click-triggered auto-scroll-into-view, not a real layout shift; fixed once the true cause was traced (`offsetTop` relative to the document never changed; only `window.scrollY` did). Below-panel content height legitimately differs between layers (Surface/Flow/System prose isn't the same length) — that's real content, not a CLS-causing animation artifact, and isn't what this criterion is about.
- [x] Every animated element on the approved list in the plan; nothing animates below the fold pre-scroll; no forbidden movement types. **Met, after fixing a real violation found by adversarial review (2026-08-11)**: the original implementation animated the transition *to* `hidden` for below-the-fold `Reveal` content the instant JavaScript hydrated — real, visible content fading to invisible before the user had scrolled anywhere near it, confirmed with a non-scrolling browser opacity trace. Fixed by making the hide transition instant (`duration: 0`, a single imperceptible state change, not an animation) while the genuine reveal-on-scroll transition still animates normally; `onLoad`-marked content (Hero, Positioning — both empirically confirmed to sit inside the initial viewport) bypasses the async observer race entirely. Re-traced after the fix: zero in-viewport elements ever observed at `opacity: 0`. Final animated-element list: Hero (3, `onLoad`), Positioning (1, `onLoad`), Built in Layers definitions list (1), Layer Explorer preview block (1), Selected Systems cards (≤4, staggered), Built for Real Life primary content (1), How I Build list (1), Field Notes primary content (1), About preview paragraph (1), Layer Explorer panel transitions (on genuine tab switches only, never on initial mount), ProjectCard hover/focus border, TextLink hover underline/color. No parallax, scroll-linked, scale, spring, rotation, or blur animation anywhere in the diff.

## Required verification commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
```

## Manual browser checks

- Hero intro plays once, ≤700ms, readable throughout; reload sanity.
- Layer switch by mouse, touch (device emulation), and keyboard at 375/768/1024/1440px.
- Scroll the full homepage: reveals fire once, section-level only; no re-triggering, no jank (DevTools performance pass — no long tasks from animation).
- OS reduced-motion enabled: repeat the full pass.

## Accessibility checks

- Tabs: `tablist/tab/tabpanel` roles, `aria-selected`, roving tabindex verified in the accessibility tree.
- Focus visible on tabs in every state; focus order sensible after panel switch.
- No information exists only during/after an animation.

## Content verification checks

- No content changes in this task — diff over `content/` must be empty.

## Rollback notes

Feature-level revert: remove created components/tests, restore changed files from git, revert `package.json`/lockfile, `pnpm install`. Site returns to fully-static approved state — this is the designed fallback, so rollback is low-risk.

## Completion report template

```markdown
### TASK-007 report — <date>
- Files created/changed: <list>
- Dependency added: motion@<version>
- Animated elements (final list vs plan): <list>
- Commands run and results (incl. reduced-motion e2e): <...>
- Manual checks (keyboard/touch/no-JS/OS reduced-motion/perf): <results>
- QA_CHECKLIST sections run: 1, 3, 4, 5, 6, 7 — <results>
- Deviations: <none | list>
- Unresolved issues: <none | list>
- Git status after: <...>
STOPPED. Awaiting review for Phase 7.
```
