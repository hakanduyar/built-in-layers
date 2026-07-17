# TASK-007 — Motion layer & interactive explorer

Status: NOT STARTED — HARD GATE: requires Phase 3 (TASK-004 content system) AND Phase 4 (TASK-003 static layout) approved; at least one published case study strongly preferred (ROADMAP Phase 7)

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

## Implementation steps

1. Read docs; report plan incl. exact list of elements that will animate; `git status`.
2. Install `motion`; build `Reveal` with reduced-motion branch; unit-test the branch.
3. Build `LayerExplorer` test-first (roles → keyboard → state visuals → transition); wire on homepage, then case studies.
4. Verify no-JS output unchanged (build + JS-disabled pass).
5. Apply hero intro + section reveals per the approved element list; count animated elements per DESIGN_SYSTEM limits.
6. Full gate run incl. reduced-motion Playwright project; manual OS-level reduced-motion pass; report.

## Acceptance criteria

- [ ] All verification commands pass, including the reduced-motion e2e run.
- [ ] LayerExplorer: complete keyboard operation with manual activation (arrows/Home/End move focus; Enter/Space activate); correct ARIA roles and relationships; state visuals match DESIGN_SYSTEM §12 table; panels swap real, distinct content.
- [ ] With JS disabled: all three layer sections visible, ordered, labelled, and readable on every page that has the explorer — project content never depends on JavaScript.
- [ ] With reduced motion: zero reveals/transitions; content complete; layer switch instant.
- [ ] Only `motion` added; client components added by this task limited to `LayerExplorer` + `components/ui/motion/*` (the existing `MobileNav` from TASK-002 is unchanged).
- [ ] No layout shift caused by any animation (space reserved).
- [ ] Every animated element on the approved list in the plan; nothing animates below the fold pre-scroll; no forbidden movement types.

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
