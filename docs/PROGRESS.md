# PROGRESS — Built in Layers

How to use this file: every task appends a log entry when it starts and when it stops, and keeps the status table truthful. Deferred scope discovered mid-task is recorded here, never silently implemented.

## Status

Execution order revised 2026-07-17 (D-011 rejected): content system (TASK-004) now precedes the homepage (TASK-003).

| Phase | Task | Status | Review verdict |
|---|---|---|---|
| 0 | Preconditions | **Complete** — git initialized; decisions resolved; initial docs commit made 2026-07-17 (`91aaf9c`) | — |
| 1 | TASK-001 Foundation (+ D-001 MDX spike, D-003 font verification) | **Approved and committed** (`e01c242`) | Approved |
| 2 | TASK-002 Static shell (desktop inline nav + mobile MENU panel) | **Approved 2026-07-28** — implemented, hydration flash/CLS remediation reviewed and approved | Approved |
| 3 | TASK-004 Content system | Not started | — |
| 4 | TASK-003 Homepage static (loader-fed; static-layout approval gate) | Not started | — |
| 5 | TASK-005 Kıvılcım case study | Not started (content inputs pending) | — |
| 6 | TASK-006 DropSpot case study | Not started (repo audit pending) | — |
| 7 | TASK-007 Motion layer + explorer | Not started (gated on Phase 4 approval) | — |
| 8 | TASK-008 A11y / performance / SEO | Not started | — |

Planning documents: **conditionally approved 2026-07-17; required revisions applied same day. TASK-001 awaits start approval.**

## Open items blocked on Hakan

- **D-001 (MDX pipeline) is provisional, not accepted**: `next-mdx-remote@6.0.0` passed the full TASK-001 spike, but its upstream GitHub repo is archived. Before TASK-004 starts, a focused written comparison against the official `@next/mdx` pipeline is mandatory (see `docs/DECISIONS.md` D-001). The current pipeline is not replaced automatically — any migration needs that comparison plus Hakan's explicit approval.
- `/work` and `/about` body copy is provisional shell text (approved 2026-07-28 as a non-blocking placeholder only); real content is TASK-004+ work.
- Public email, current CV, current location: remain unpublished until explicitly confirmed (never taken from old CV files).
- Notes: selection of three Medium articles (title + URL).
- Assets: real screenshots for Kıvılcım/DropSpot; OG default image direction (needed by TASK-008).
- Production domain (required before TASK-008 completion — not a blocker for earlier phases).

## Resolved 2026-07-17 (conditional approval batch)

- Git repository initialized (removes the "not a git repository" conflict with `CLAUDE.md §13`).
- Decision batch: D-001 provisional (spike in TASK-001, `@next/mdx` fallback), D-002 accepted, D-003 accepted provisionally, D-004 accepted with changes (`--signal-ui`/`--signal-text`), D-005 rejected → mobile MENU panel, D-006 accepted with manual activation, D-007/D-008 accepted, D-009 accepted with exact wording, D-010 revised (Chromium + WebKit), D-011 rejected → task reorder, D-016 accepted (Kıvılcım, DropSpot, JointLedger, Professional preview), D-017 Kıvılcım naming.
- Kıvılcım display name: **Kıvılcım** (first English introduction may gloss: Kıvılcım — “Spark”); slug `/work/kivilcim`.
- Homepage featured order and its promotion condition (D-016).
- Email/CV/location policy for MVP: omitted until confirmed.

## Deferred scope

*(empty)*

## Log

### 2026-07-17 — Planning phase (documentation only)

- Created: `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `CONTENT_MODEL.md`, `ROADMAP.md`, `DECISIONS.md`, `PROGRESS.md`, `QA_CHECKLIST.md`, `tasks/TASK-001`–`TASK-008`.
- No production code written, no packages installed, no commits made (not a git repository yet at that time).
- Conflicts found and reported in the planning summary: missing git repo vs CLAUDE.md §13; PROJECT_SPEC §8 featured order vs Professional Systems `REQUIRES USER` status (→ D-016); duplicate `medyanes-smartboard-app` / `medyanes-smatboard-app` entries in CONTENT_INVENTORY.
- Status: **STOPPED — awaiting approval. TASK-001 not started.**

### 2026-07-17 — Planning revision (documentation only, per conditional approval)

- Applied Hakan's 18 approval decisions across: `PROJECT_SPEC.md`, `CONTENT_INVENTORY.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `CONTENT_MODEL.md`, `ROADMAP.md`, `DECISIONS.md`, `QA_CHECKLIST.md`, `PROGRESS.md`, all eight task files.
- Key changes: D-001 provisional with a mandatory TASK-001 MDX compatibility spike; D-005 replaced with desktop-inline / mobile-MENU navigation (fixed client-component count removed); D-006 manual activation; D-011 rejected — execution order now 001 → 002 → 004 → 003 → 005 → 006 → 007 → 008; build-gate language honest ("reduce the risk", not "structurally impossible"); `verificationStatus` field made explicit; `--signal-ui` token added; Playwright Chromium + WebKit; Kıvılcım naming fixed (D-017).
- Git repository initialized (no commit). No production code written, no packages installed, TASK-001 not started.
- Status: **STOPPED — revisions complete, awaiting approval to begin TASK-001.**

### 2026-07-27 — Documentation baseline commit

- Committed the approved planning/governance file set only (`CLAUDE.md`, the four root prompt files, all of `docs/`) as `91aaf9c` "docs: establish portfolio project plan". Remote `origin` set to `https://github.com/hakanduyar/portfolio.git`; push attempted but blocked by missing git credentials in the sandbox (reported separately; not resolved in this session).

### 2026-07-27 — TASK-001 Foundation implemented

- Scaffolded Next.js 16.2.12 / React 19.2.4 / TypeScript 5.9.3 / Tailwind v4.3.3 workspace (via an isolated temp-dir `create-next-app` run, then hand-ported into the repo root, since the repo's existing root files fail create-next-app's own empty-directory check).
- Environment fix (not a project file): global `~/.npmrc` pointed at an unreachable private registry (`registry.hmb.gov.tr`); added a project-local `.npmrc` pinning `https://registry.npmjs.org/` without touching the global config.
- Implemented full `styles/globals.css` token set (colors, type roles, tracking, radius, motion durations/easings, container width, focus style, reduced-motion CSS) per DESIGN_SYSTEM §2–§7, §13. Verified precise WCAG contrast ratios by computation (see D-004 addendum) rather than relying on the docs' approximations.
- Configured and verified all three fonts (Archivo, Newsreader italic, IBM Plex Mono) via a real production build, not just typechecking; confirmed self-hosted `.woff2` delivery and correct CSS variable wiring in the generated output. Licensing re-verified against the canonical `google/fonts` source repo. See D-003.
- Ran the mandatory D-001 MDX compatibility spike: all 8 required checks passed against the real toolchain; evidence recorded in `docs/DECISIONS.md`; spike artifacts removed after recording, gates re-run clean. Surfaced one new risk not previously known: the `next-mdx-remote` GitHub repo is archived upstream (does not block the decision; flagged for awareness).
- Full gate suite: typecheck, lint, format:check, unit tests, and production build all pass. Playwright e2e: Chromium passes; WebKit cannot launch in this sandbox due to missing root-only system libraries (see "Open items blocked on Hakan").
- No commit made. No files outside TASK-001's scope touched.
- Status: **STOPPED — TASK-001 implemented and verified (WebKit e2e excepted, environment-blocked). Awaiting review for Phase 1.**

### 2026-07-27 — TASK-001 final remediation and documentation update

- Re-ran the full verification suite fresh on the real development machine: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` (3/3), `pnpm build`, and `pnpm exec playwright test` — **all pass, including both Chromium and WebKit** (the earlier sandbox-only WebKit blocker is resolved; confirmed by an actual run, not assumed).
- Audited `.npmrc`: single line, `registry=https://registry.npmjs.org/` — no tokens, usernames, passwords, or secrets of any kind; scope confirmed limited to overriding the machine-global unreachable private registry for this project only.
- Audited `pnpm-workspace.yaml`: `allowBuilds` traced with `pnpm why` to confirm both entries are genuinely required — `sharp` is a direct dependency of `next` itself (image optimization), `unrs-resolver` is a transitive dependency of `eslint-config-next` (via `eslint-import-resolver-typescript`/`eslint-plugin-import`). No unrelated packages granted build permission. `minimumReleaseAgeExclude: [jsdom@30.0.0]` confirmed still technically necessary: jsdom 30.0.0 was published only ~6 hours before this audit — nowhere near old enough to clear any reasonable release-age policy. Not removed or broadened.
- Added the smallest reproducibility config to `package.json`: `packageManager: "pnpm@11.17.0"` and `engines.node: ">=22.23.1"` — both set to the actual tested versions on this machine, nothing broader claimed. Verified no scope creep in dependencies (no CMS/DB/auth/analytics/state/i18n/GSAP/Three.js/WebGL package; `motion` still absent, correctly deferred to TASK-007).
- **D-001 status changed to exactly `PROVISIONAL FOR MVP FOUNDATION — REVIEW REQUIRED BEFORE TASK-004`**: the passing spike confirms technical compatibility only; a focused comparison against `@next/mdx` is now a mandatory, documented precondition before TASK-004 builds real content on this pipeline. The pipeline is not to be swapped automatically on the archived-repo finding alone — migration requires comparison evidence and Hakan's explicit approval. No MDX implementation code was touched in this task.
- Status: **STOPPED — TASK-001 technically complete (full suite green, incl. WebKit). D-001 remains provisional pending the pre-TASK-004 comparison. Awaiting review for Phase 1.**

### 2026-07-27 — TASK-001 approved with metadata correction

- Hakan approved TASK-001 with one correction: `package.json` `engines.node` changed from `>=22.23.1` (the exact tested patch, overly strict) to `>=22.0.0` (the project's true minimum-compatible major, matching pnpm 11's own Node 22+ requirement). `packageManager: "pnpm@11.17.0"` unchanged. No dependencies, lockfile, or implementation code changed.
- Full verification suite re-run after the correction: typecheck, lint, format:check, unit tests, build, and Playwright (Chromium + WebKit) — all pass.
- Commit `chore: establish portfolio foundation` created and pushed to `origin/main`.
- Status: **TASK-001 approved and committed. TASK-002 not started.**

### 2026-07-28 — TASK-002 Static shell implemented

- Built the complete site chrome: `SkipLink`, `SiteHeader` (desktop inline nav), `MobileNav` (the one Client Component), `SiteFooter`, five `components/ui` primitives (`Container`, `SectionHeading`, `MonoLabel`, `TextLink`, `ButtonLink`), `lib/seo/metadata.ts`, and route stubs for `/`, `/work`, `/notes`, `/lab`, `/about` plus a custom `app/not-found.tsx`. No new dependencies.
- `MobileNav` design: native `<dialog>` + `showModal()` for the panel (focus containment, Escape-to-close, and background-inert behavior come from the browser itself in both Chromium and WebKit, rather than hand-rolled ARIA/focus-trap code) plus a `useSyncExternalStore`-based mount check so the component's pre-hydration server output — which is exactly what a no-JS browser sees — is a plain, always-reachable link list, not a non-functional trigger. Verified directly in the built SSR HTML: the plain fallback nav is present pre-hydration with no `<dialog>`/button in the markup at all.
- One lint fix along the way: the initial `useEffect(() => setState(true), [])` mount-detection pattern trips `react-hooks/set-state-in-effect`; replaced with `useSyncExternalStore`, which is React's own recommended pattern for this and avoids the cascading-render warning entirely.
- Added `--grid-columns` (4 → 8 → 12) to `styles/globals.css` as the DESIGN_SYSTEM §4 column-count foundation — flagged as required since TASK-001 hadn't encoded it; no page yet renders a literal multi-column grid since none of TASK-002's stub content needs one.
- Assumption flagged for review: the footer contact CTA links to the verified LinkedIn profile (email/CV are excluded per the task's own constraint, and CLAUDE.md §10 still requires some functional CTA).
- Full gate suite passes: typecheck, lint, format:check, unit tests, production build (all 6 routes + 404 prerendered as static content), and the full Playwright suite — 20/20 passing on both Chromium and WebKit, including keyboard open/close/Escape/focus-restoration and a dedicated JS-disabled context test proving the no-JS nav fallback.
- Manual checks: no horizontal overflow at 375/768/1024/1440px across all 5 routes (verified programmatically, not assumed); full keyboard Tab-order trace across the home page confirmed a logical order (skip link → wordmark → nav → footer CTA → footer social links) with a visible 2px ink focus outline on every stop, confirmed via computed styles after CSS-transition settle.
- No commit made. No files outside TASK-002's scope touched.
- Status: **STOPPED — TASK-002 implemented and verified. Awaiting review before TASK-004.**

### 2026-07-28 — TASK-002 remediation: mobile-nav hydration flash/CLS fixed

- Hakan's review correctly identified a risk in the `useSyncExternalStore`-based mount check described in the entry above (the earlier claim that this was safe was wrong). **Measured, confirmed bug**: pre-hydration, `MobileNav` rendered a full stacked link list (~317px tall); post-hydration it collapsed to a small MENU button (~77px) — a **240px layout shift** on every JS-enabled page load, reproduced identically on Chromium and WebKit via a delayed-JS test with screenshots (317px → 77px, pixel-visible, header briefly filling most of the viewport).
- **Fix**: removed the `mounted`/`useSyncExternalStore` gate entirely. The MENU trigger and its (closed, `display:none`-by-default) `<dialog>` are now unconditionally rendered from first paint — structurally identical before and after hydration, so there is nothing to collapse. The no-JS fallback moved into a `<noscript>` block containing the plain link list plus a scoped `<style>` that hides the now-inert trigger; browsers only parse/apply `<noscript>` content, including nested `<style>`, when scripting is disabled, so the correct variant is selected natively at parse time with zero JavaScript and zero dependency on hydration timing.
- **Re-verified after the fix**: same delayed-JS methodology (1.2s artificial JS-chunk delay), both browsers — header height identical pre/post-hydration (0px delta, pixel-identical screenshots), zero console errors/warnings from the `<noscript>`+`<style>` pattern. No-JS behavior re-confirmed: nav links remain fully reachable (existing test still passes) and the trigger is now correctly hidden rather than left as a dead control (new test).
- Two permanent regression tests added to `tests/e2e/shell.spec.ts`: the trigger is present in the raw server HTML before any script runs, and header height is stable pre/post-hydration under a simulated slow-JS load. One new no-JS test confirms the trigger is hidden without JS.
- No dependency added. Native `<dialog>`, Escape-to-close, focus containment/restoration, route-selection close, `aria-expanded`/`aria-controls`, and background-inert behavior are all unchanged from the original TASK-002 implementation.
- Full gate suite re-run clean: typecheck, lint, format:check, unit tests, build, and Playwright — 26/26 passing on both Chromium and WebKit.
- No commit made.
- Status: **STOPPED — hydration flash/CLS bug fixed and verified. Awaiting review.**

### 2026-07-28 — TASK-002 approved

- Hakan approved the hydration remediation and the current shell copy (footer CTA, `/work`, `/about`, `/notes`, `/lab`, home placeholder), noting `/work` and `/about` body copy is explicitly provisional and may be replaced during dedicated content work without blocking the shell.
- Reporting convention adopted per Hakan's note: "exact files changed" in a remediation report means files touched by that specific remediation; the full uncommitted working tree is reported separately via `git status --short`.
- Final pre-commit verification: `git diff --check` clean; full suite re-run (typecheck, lint, format:check, unit tests, build, Playwright) — all pass, 26/26 e2e on both Chromium and WebKit.
- Status: **TASK-002 approved. Proceeding to commit and push.**
