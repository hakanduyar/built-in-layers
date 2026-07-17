# TASK-002 — Static shell

Status: NOT STARTED — requires Phase 1 approved

## Objective

The complete site chrome and route skeleton: root layout with header (desktop inline nav + mobile MENU trigger with accessible panel, per revised D-005), footer (with contact CTA), skip link; all MVP routes existing as honest static stubs; custom 404; baseline metadata helper. Client JavaScript limited to the single `MobileNav` component.

## In scope

- `data/site.ts`: nav items (Home, Work, Notes, Lab, About), verified social links (GitHub, LinkedIn, Medium — URLs exactly from CONTENT_INVENTORY), site name/title strings. **No email, no CV link** (unconfirmed — omit, do not placeholder in public chrome).
- `data/copy.ts`: chrome strings (nav labels, footer CTA seed copy from PROJECT_SPEC §11 "HAVE A COMPLEX PRODUCT? / LET'S MAKE IT FEEL SIMPLE.", pending-state texts approved in D-009).
- `components/layout/`: `SkipLink`, `SiteHeader` (word mark + **inline nav on desktop, visible MENU trigger on mobile** per revised D-005; **no active-route highlight in MVP** — the page `h1` already states location), `MobileNav` (**the one allowed Client Component of this task**: accessible full-screen or panel navigation — keyboard operable, Escape closes, focus managed into the panel on open and returned to the trigger on close, visible focus states, `aria-expanded` on the trigger, panel labelled; progressive enhancement: the server-rendered link list remains reachable without JavaScript), `SiteFooter` (contact CTA display-l block, social links, colophon line).
- `components/ui/`: `Container`, `SectionHeading` (index + rule per DESIGN_SYSTEM §8), `MonoLabel`, `TextLink` (internal/external variants with ↗ + screen-reader note), `ButtonLink` (primary/secondary).
- Root `app/layout.tsx`: fonts, skip link, header, `<main id="main">`, footer, `lang="en"`.
- `lib/seo/metadata.ts`: `buildMetadata` helper + title template + `SITE_URL` constant (env-driven; placeholder domain until confirmed — not rendered anywhere user-visible except canonical tags, which may use the Vercel URL until domain confirmation).
- Route stubs: `app/work/page.tsx`, `app/notes/page.tsx`, `app/lab/page.tsx`, `app/about/page.tsx` — each with correct `h1`, one-line honest pending text (D-009 wording where applicable), metadata via helper. `app/page.tsx` becomes a minimal home stub (hero copy NOT yet — just word mark + one-line positioning from approved copy; full homepage is TASK-003).
- `app/not-found.tsx`: display-l "404" treatment, one honest line, links to Home and Work.
- Playwright smoke (Chromium + WebKit): every route responds with its `h1`; unknown route renders the 404; nav links navigate; **mobile viewport: MENU trigger opens the panel, panel links navigate, Escape closes and returns focus to the trigger**; skip link exists and targets `#main`; external links have `rel="noopener noreferrer"`.

## Out of scope

- Homepage sections (TASK-003, which follows TASK-004). Content schemas/MDX (TASK-004). `/work/[slug]` route (TASK-004).
- Any Client Component beyond `MobileNav`. Any animation (the panel may appear/disappear without motion in this task). Active-nav-state logic.
- Real About/Notes/Lab content. OG images, sitemap, robots, JSON-LD (TASK-008).

## Dependencies

- TASK-001 approved. Revised D-005 (desktop inline nav + mobile MENU panel) and D-009 (pending copy) — both resolved 2026-07-17.

## Exact files expected to be created or changed

```text
Created: data/site.ts, data/copy.ts,
  components/layout/SkipLink.tsx, components/layout/SiteHeader.tsx,
  components/layout/MobileNav.tsx ("use client" — revised D-005),
  components/layout/SiteFooter.tsx,
  components/ui/Container.tsx, components/ui/SectionHeading.tsx,
  components/ui/MonoLabel.tsx, components/ui/TextLink.tsx,
  components/ui/ButtonLink.tsx,
  lib/seo/metadata.ts,
  app/work/page.tsx, app/notes/page.tsx, app/lab/page.tsx,
  app/about/page.tsx, app/not-found.tsx,
  tests/e2e/shell.spec.ts
Changed: app/layout.tsx, app/page.tsx, styles/globals.css (only if a token
  gap is found — report it), tests/e2e/smoke.spec.ts (extend)
```

## Implementation steps

1. Read required docs; report plan; `git status`.
2. Create `data/site.ts` and `data/copy.ts` with verified links and approved copy only.
3. Build `ui` primitives against DESIGN_SYSTEM (§7, §8, §10, §11). No raw hex values.
4. Build layout components; compose in `app/layout.tsx` with landmarks and skip link. Build `MobileNav` test-first for its keyboard contract (open, Escape-close, focus management).
5. Implement `buildMetadata`; apply to every route.
6. Create route stubs and 404 with honest one-liners.
7. Extend Playwright smoke coverage; run all gates; `git status`; report.

## Acceptance criteria

- [ ] All verification commands pass (Playwright on Chromium + WebKit).
- [ ] Every MVP route (`/`, `/work`, `/notes`, `/lab`, `/about`) renders with a unique title and single `h1`; unknown routes show the custom 404.
- [ ] Exactly one `"use client"` component in the diff: `components/layout/MobileNav.tsx`.
- [ ] Header/footer match DESIGN_SYSTEM §15: inline nav on desktop; visible MENU trigger on mobile opening the accessible panel (keyboard, Escape-to-close, managed focus, visible focus states); all links reachable without JavaScript.
- [ ] Social links are exactly the three verified URLs; no email/CV appears anywhere.
- [ ] All strings come from `data/copy.ts` / `data/site.ts` — none hard-coded in components.
- [ ] No new dependencies.

## Required verification commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
```

## Manual browser checks

- All routes at 375/768/1024/1440px: no overflow; at mobile widths the MENU trigger is visible and the panel opens/closes correctly.
- Footer CTA typography matches display-l spec; hairline rules render 1px.
- JavaScript disabled: every page fully rendered and navigable — all nav links reachable without the panel.

## Accessibility checks

- First Tab reveals skip link; activating it moves focus/scroll to `#main`.
- Keyboard pass across header and footer links; visible focus everywhere.
- MobileNav: trigger operable by keyboard; on open, focus moves into the panel; Tab stays within reach of panel links; Escape closes and returns focus to the trigger; `aria-expanded` reflects state.
- Landmarks: banner, nav, main, contentinfo present once each. External links announce new-tab.

## Content verification checks

- Stub texts use only approved pending copy (D-009) or approved seed copy — no invented facts, no `[CONTENT REQUIRED]` rendered.
- Word mark and positioning line match CLAUDE.md §4 exactly.

## Rollback notes

All changes are additive files plus `app/layout.tsx`/`app/page.tsx` edits; `git checkout . && git clean -fd` restores TASK-001 state. Report before rollback.

## Completion report template

```markdown
### TASK-002 report — <date>
- Files created/changed: <list>
- Commands run and results: <...>
- Manual checks (widths, no-JS, keyboard): <results>
- QA_CHECKLIST sections run: 1, 2, 3, 5, 6, 7 — <results>
- Deviations: <none | list>
- Unresolved issues: <none | list>
- Git status after: <...>
STOPPED. Awaiting review for Phase 2.
```
