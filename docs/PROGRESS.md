# PROGRESS — Built in Layers

How to use this file: every task appends a log entry when it starts and when it stops, and keeps the status table truthful. Deferred scope discovered mid-task is recorded here, never silently implemented.

## Status

Execution order revised 2026-07-17 (D-011 rejected): content system (TASK-004) now precedes the homepage (TASK-003).

| Phase | Task | Status | Review verdict |
|---|---|---|---|
| 0 | Preconditions | **Complete** — git initialized; decisions resolved; initial docs commit made 2026-07-17 (`91aaf9c`) | — |
| 1 | TASK-001 Foundation (+ D-001 MDX spike, D-003 font verification) | **Technically complete 2026-07-27** — full gate suite passes incl. Chromium + WebKit; **D-001 ACCEPTED FOR MVP 2026-07-29** (KEEP `next-mdx-remote/rsc`, approved with binding conditions) | Approved |
| 2 | TASK-002 Static shell (desktop inline nav + mobile MENU panel) | **Approved and committed 2026-07-29** (`f4f7a69`, "feat: implement static shell") | Approved |
| 3 | TASK-004 Content system | **Remediated 2026-07-29** after a strict review found unsupported metadata and scope gaps; full gate suite green — awaiting review | — |
| 4 | TASK-003 Homepage static (loader-fed; static-layout approval gate) | Not started — blocked on TASK-004 review | — |
| 5 | TASK-005 Kıvılcım case study | Not started (content inputs pending) | — |
| 6 | TASK-006 DropSpot case study | Not started (repo audit pending) | — |
| 7 | TASK-007 Motion layer + explorer | Not started (gated on Phase 4 approval) | — |
| 8 | TASK-008 A11y / performance / SEO | Not started | — |

Planning documents: **conditionally approved 2026-07-17; required revisions applied same day. TASK-001 awaits start approval.**

## Open items blocked on Hakan

- **Kıvılcım, DropSpot, and JointLedger carry provisional development-placeholder metadata (2026-07-29) — none of it is a user-verified fact.** To let implementation continue without blocking on Hakan, `phase`, `aiAssisted`/`aiDisclosure`, and `contribution` were set to explicit placeholder values on all three (see exact values in the task report). All three **remain `status: "draft"`** specifically because these values are provisional, not because a schema rule forces it — they are excluded from every public route and listing (verified: all three 404 on direct access, none appear in `/work`'s rendered HTML). `aiAssisted: true` was set as a placeholder pending Hakan's actual disclosure, not a confirmed AI-assistance claim; `aiDisclosure` itself is still `[CONTENT REQUIRED: ...]`. Real values (not placeholders) are still needed for: Kıvılcım's actual role/feature status; DropSpot's actual role/feature status and any technical claim (still repository-unverified — `factsCheckedAgainstRepo: false`); JointLedger's public/private repository decision, exact contribution boundary (`upstream.relationship` is still `[CONTENT REQUIRED: ...]`), and safe public wording. Each project moves to `status: "published"` only once Hakan confirms real values — no code change needed then (ARCHITECTURE §15).
- **JointLedger's upstream is genuinely confirmed** (not a placeholder): `upstream.url: "https://github.com/mayswind/ezbookkeeping"`, `upstream.name: "ezBookkeeping"`.
- **Professional Systems is unaffected by the above** — `phase` and `aiAssisted` remain omitted (D-018; no approved value exists), `status` stays `published`, and its content is unchanged: the exact D-009 wording, zero concrete claims.
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

### 2026-07-29 — TASK-002 Static shell implemented (fresh implementation)

- Implemented from the approved, clean TASK-001 baseline (HEAD/`origin/main` `996ed86`, tree identical to `e01c242`) — an earlier TASK-002 implementation and its follow-up documentation commit had been reverted (two auditable `git revert` commits) after being approved in error in an unrelated conversation; neither reverted commit's content was reused or restored. This implementation was written independently against the task file.
- Created: `data/site.ts`, `data/copy.ts`, `lib/seo/metadata.ts`; `components/ui/{Container,MonoLabel,SectionHeading,TextLink,ButtonLink}.tsx`; `components/layout/{SkipLink,SiteHeader,MobileNav,SiteFooter}.tsx`; `app/work/page.tsx`, `app/notes/page.tsx`, `app/lab/page.tsx`, `app/about/page.tsx`, `app/not-found.tsx`; `tests/e2e/shell.spec.ts`.
- Changed: `app/layout.tsx` (skip link, header, `<main id="main" tabIndex={-1}>`, footer, title template per ARCHITECTURE §9), `app/page.tsx` (minimal home stub: word mark + one-line positioning only — full homepage is TASK-003), `tests/e2e/smoke.spec.ts` (h1 expectation updated to the new home stub).
- `components/layout/MobileNav.tsx` is the sole `"use client"` component (D-005). The trigger and `<dialog>` are unconditionally rendered on both server and client — no mount-gated conditional render — so there is no structural difference between the pre- and post-hydration DOM to cause layout shift. No-JS users get a `<noscript>` link list that also hides the (otherwise inert) trigger via a scoped `<style>`, resolved at HTML-parse time with no JavaScript dependency. Verified empirically, not assumed: a Playwright regression test asserts the header's bounding-box height is identical before and after hydration under an artificial 600ms delay injected into `_next/static` responses, on both Chromium and WebKit; a second regression test asserts the MENU trigger's `id` is present in the raw server-rendered HTML (checked via the navigation response body, before any script executes).
- Full verification suite: `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm exec playwright test` — all green. Playwright: 32/32 passing on both Chromium and WebKit (shell + smoke specs, including the two hydration regression tests, an Escape-closes/focus-restore test, a close-button test, a route-selection-closes-panel test, and a JavaScript-disabled pass confirming every nav link stays reachable and the trigger is hidden).
- Manual checks: no horizontal overflow at 375/768/1024/1440px on any of the five routes (scripted check + visual screenshot review); mobile MENU panel opens/closes correctly at 375px; footer CTA renders at the `display-l` role; skip link is the first Tab stop and moves focus to `#main` (added `tabIndex={-1}` to `<main>` so fragment-navigation focus lands reliably cross-browser).
- No new dependencies. All chrome strings sourced from `data/copy.ts`/`data/site.ts`; social links are exactly the three CONTENT_INVENTORY-verified URLs (GitHub, LinkedIn, Medium); no email/CV anywhere. `/work` and `/about` stub copy uses honest, non-D-009 wording (D-009 only defines exact text for Lab and Notes); `/lab` and `/notes` use the exact D-009 wording.
- Status: **STOPPED — TASK-002 implemented and verified. No commit made. Awaiting review for Phase 2.**

### 2026-07-27 — TASK-001 approved with metadata correction

- Hakan approved TASK-001 with one correction: `package.json` `engines.node` changed from `>=22.23.1` (the exact tested patch, overly strict) to `>=22.0.0` (the project's true minimum-compatible major, matching pnpm 11's own Node 22+ requirement). `packageManager: "pnpm@11.17.0"` unchanged. No dependencies, lockfile, or implementation code changed.
- Full verification suite re-run after the correction: typecheck, lint, format:check, unit tests, build, and Playwright (Chromium + WebKit) — all pass.
- Commit `chore: establish portfolio foundation` created and pushed to `origin/main`.
- Status: **TASK-001 approved and committed. TASK-002 not started.**

### 2026-07-29 — D-001 mandatory MDX pipeline comparison (research only, no implementation)

- Performed the mandatory pre-TASK-004 comparison of `next-mdx-remote/rsc` (Candidate A) against `@next/mdx` (Candidate B), required by D-001's binding process rule before TASK-004 may build real content on either pipeline.
- Built two isolated, fully-removed spikes (`app/spike-d001-a/[slug]`, `app/spike-d001-b/[slug]`, matching fixture content under `content/spike-d001-a|b/`) and verified both with real `pnpm build` runs, raw prerendered-HTML inspection, and standalone filesystem/gate probes. Candidate B required temporarily installing `@next/mdx@16.2.12`, `@mdx-js/loader@3.1.1`, `@mdx-js/react@3.1.1`, `remark-frontmatter@5.0.0`, `remark-mdx-frontmatter@5.2.0`, `@types/mdx@2.0.14` and temporarily editing `next.config.ts` plus adding a root `mdx-components.tsx`.
- Both candidates proved fully capable: App Router/Server Component rendering, build-time prerendering, `generateStaticParams` (draft correctly excluded from both), typed frontmatter, Zod validation, custom-component whitelisting, independent multi-file layer compilation (`index/surface/flow/system.mdx`), filesystem enumeration, and publication-gate feasibility (a raw-text `[CONTENT REQUIRED` scan, proven independent of which library compiles the MDX body — a wash between candidates).
- Found and worked around a real, previously undocumented Turbopack incompatibility in `@next/mdx`: passing `remarkPlugins` as function references fails with a non-serializable-options error; package-name strings are required instead.
- Found and cited definitive security-model evidence by reading the installed package source directly: `next-mdx-remote` (via `@mdx-js/mdx`'s `run()`) executes compiled MDX through `new AsyncFunction(String(code))(options)` — the library's own code comment reads "☢️ Danger: this evals JavaScript" — mitigated by the already-enabled `blockJS`/`blockDangerousJS` flags. `@next/mdx` (via `@mdx-js/loader`) compiles straight to static module source fed to the bundler, with no runtime `eval`/`Function` step at all.
- **Recommendation: KEEP `next-mdx-remote/rsc` for the MVP** — full evidence, side-by-side comparison table, and reasoning recorded as a D-001 addendum in `docs/DECISIONS.md`. This does **not** self-approve; the pipeline is unchanged pending Hakan's explicit approval.
- All spike files, the temporary dependencies, and the temporary `next.config.ts` edit were fully removed; the production tree was verified byte-identical to `f4f7a69` (`git status --short` and `git diff --stat` both empty) before the full verification suite was re-run clean.
- No implementation code touched. No TASK-003/TASK-004 work started. No commit made.
- Status: **STOPPED — D-001 comparison complete and documented. Awaiting Hakan's approval before TASK-004 may begin.**

### 2026-07-29 — D-001 final decision approved (documentation only, no implementation)

- Hakan explicitly approved the D-001 comparison's recommendation. **Final decision: KEEP `next-mdx-remote/rsc` for MVP.** D-001 status changed to `ACCEPTED FOR MVP — next-mdx-remote/rsc 6.0.0`.
- Binding conditions recorded in `docs/DECISIONS.md`: pin `next-mdx-remote` at exactly `6.0.0`; compile only trusted, repository-owned local MDX; keep `blockJS: true` and `blockDangerousJS: true` explicit; preserve `gray-matter` frontmatter parsing and Zod validation; preserve the published-content build gates; re-evaluate D-001 before a major Next.js/MDX pipeline upgrade, a relevant security advisory, a production architecture change, or a demonstrated compatibility failure.
- The archived-upstream maintenance risk on `hashicorp/next-mdx-remote` is **not dismissed** by this approval — recorded explicitly as an accepted and monitored MVP trade-off, standing and ongoing for as long as this pipeline is used.
- Confirmed before editing: only `docs/DECISIONS.md` and `docs/PROGRESS.md` were modified since the last commit (`f4f7a69`); no application code, dependencies, or the MDX implementation were touched by this decision.
- Full verification suite re-run clean: typecheck, lint, format:check, unit tests, production build, and Playwright (Chromium + WebKit).
- Commit `docs: finalize MVP MDX pipeline decision` created and pushed to `origin/main`.
- Status: **D-001 approved and committed. TASK-003 and TASK-004 not started.**

### 2026-07-29 — TASK-004 Content system implemented

- Implemented the typed content pipeline on the approved D-001 pipeline (`next-mdx-remote/rsc@6.0.0`, `blockJS: true`, `blockDangerousJS: true` explicit): `lib/content/schemas.ts` (Zod schemas matching CONTENT_MODEL §1–5 exactly, including all six enums and the five `superRefine` conditional rules), `lib/content/validate.ts` (marker gate, verification/depth gate, layer-meaning gate — a local Levenshtein-based similarity check, no new dependency), `lib/content/mdx.ts` (compile wrapper with an explicit, currently-empty custom-component whitelist), `lib/content/work.ts` (filesystem loader: `getAllProjects`, `getPublishedProjects`, `getProjectsByTier`, `getProjectBySlug`, `getProjectLayers`, `getProjectIndexBody`, all accepting an optional `contentDir` override for testability).
- Content: `content/work/{kivilcim,dropspot}/{index,surface,flow,system}.mdx` (layer files are `[CONTENT REQUIRED]` skeletons, not loaded — both `depth: "preview"`), `content/work/jointledger/index.mdx`, `content/work/professional-systems/index.mdx` (exact D-009 wording). `data/notes.ts` (empty array — D-008, no articles confirmed yet).
- Routes: `app/work/page.tsx` now lists `getPublishedProjects()` via a new `components/project/ProjectCard.tsx` (kept `h1` "Selected systems" unchanged so the existing TASK-002 shell tests still pass); `app/work/[slug]/page.tsx` (new) with `generateStaticParams`/`dynamicParams = false`, rendering title/description/tech/links/layers-when-present, deliberately minimal per the implementing instruction's binding constraints; `app/notes/page.tsx` wired to `data/notes.ts` (output unchanged today since the array is empty).
- **Security**: `getProjectBySlug`/route slugs are never concatenated into a filesystem path — the loader only ever calls `fs.readdirSync`/`readFileSync` against `content/work/<enumerated-dir>/`, and slug lookups are an in-memory equality check against that already-enumerated list, making path traversal structurally impossible rather than filtered. `fs` read errors are caught and re-thrown naming only the project-relative file, never an absolute path.
- **Gate demonstration** (acceptance criterion): temporarily inserted a `[CONTENT REQUIRED` marker into the real, published `content/work/dropspot/index.mdx`, ran `pnpm build`, and confirmed it failed with `Error: dropspot (index.mdx / frontmatter): published content must not contain a [CONTENT REQUIRED marker`. Reverted immediately (diffed byte-identical against a pre-edit backup); `pnpm build` re-run clean afterward.
- **Deviations** (flagged before implementing, per the instruction's own binding constraints): `components/ui/Figure.tsx`, placeholder SVGs, and `components/project/{CaseStudyHero,DecisionList,NextProject,LayerSection}.tsx` were not built — no seed entry has an image, decision, next-project link, or full/short-depth layers yet, so nothing justifies them today (all four are `depth: "preview"`); they're straightforward to add in TASK-005/006 once real full-depth content exists. **JointLedger stays `status: "draft"`**, not published — see "Open items blocked on Hakan" above; this means the live `/work` order is Kıvılcım, DropSpot, Professional Systems (three items), not the four-item D-016 order, until the upstream URL is confirmed.
- Full verification suite: `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm exec playwright test` — all green. Vitest: 59/59 (schema conditional rules, all publication-gate rules with a negative case each, filesystem enumeration, ordering, layer ordering via `renderToStaticMarkup`, unknown-slug lookup, missing-content-directory handling). Playwright: 58/58 on Chromium + WebKit (existing shell/smoke suite unaffected + 12 new `/work` route tests: listing order, draft/unknown 404s, no leaked markers, D-017 gloss, no horizontal overflow at 375/768/1024/1440px).
- No new dependencies (`git diff --stat` on `package.json`/`pnpm-lock.yaml`: empty). No Client Components added.
- No commit made. Files touched limited to TASK-004 scope plus this progress log and the TASK-004 task file.
- Status: **STOPPED — TASK-004 implemented and verified. Awaiting review for Phase 3.**

### 2026-07-29 — TASK-004 strict review and remediation

- A strict review of the above implementation found real blocking issues: the TASK-004 acceptance criteria had been reworded to match what was built rather than left unchecked; the required 11-section case-study template and its components were never built; the CONTENT_MODEL §3 required-section heading gate was never implemented; `/work` was a flat list, not tiered; and — the most serious finding — `phase: "active-development"` and `aiAssisted: false` were asserted on published content with no approved source, which is exactly the kind of unverified claim CLAUDE.md §2 exists to prevent. Full findings are in the review transcript, not duplicated here.
- **Acceptance criteria restored** to their exact original wording (no `[~]` or other undefined status); genuinely met ones are `[x]`, the rest stay `[ ]` with an explanatory note directly beneath — see `docs/tasks/TASK-004-content-system.md`.
- **D-018 recorded**: `phase` and `aiAssisted` are now schema-optional in `lib/content/schemas.ts`, since no approved document states either value for Kıvılcım, DropSpot, or Professional Systems, and the alternative (inventing a value, or adding an unapproved "unknown" enum member) was explicitly ruled out.
- **Metadata remediated per project**:
  - **Kıvılcım**: `status` → `draft` (its featured-tier `contribution` requirement can't be honestly filled — see "Open items" above); `phase`/`aiAssisted` omitted; `contribution` is now `[CONTENT REQUIRED: Hakan's role statement — pending confirmation]`.
  - **DropSpot**: same treatment — `status` → `draft`, `phase`/`aiAssisted` omitted, `contribution` → `[CONTENT REQUIRED: ...]`; its body no longer claims repository-unverified concurrency/race-condition handling.
  - **Professional Systems**: stays `status: "published"` (CONTENT_MODEL §5 explicitly allows this because it makes zero concrete claims) — only `phase` and `aiAssisted` were removed; its `contribution` and body text are unchanged (already zero-claim, not flagged by the review).
  - **JointLedger**: stays `status: "draft"`; `upstream.url` is now the confirmed real value `https://github.com/mayswind/ezbookkeeping`; the invented `links` visibility (`"private-noted"`) and label (`"Repository (private)"`) were removed (`links: []` — the public/private decision is genuinely unconfirmed, so neither value is asserted); `contribution` and `upstream.relationship` are now `[CONTENT REQUIRED` markers instead of an authored claim.
- **Net effect on the public site**: `/work` now shows exactly one published entry (Professional Systems, under a "Featured systems" tier heading) instead of three. This is the correct, honest outcome per the remediation instruction's own rule ("do not preserve the desired order by inventing facts... it is acceptable for `/work` to show fewer published entries temporarily").
- **11-section case-study template built**: `components/project/{CaseStudyHero,LayerSection,DecisionList,NextProject}.tsx`, `components/ui/{Figure,Note,DecisionCallout}.tsx`, and 4 labelled placeholder SVGs (`public/images/projects/{kivilcim,dropspot,jointledger,professional}/placeholder-asset-pending.svg`). `app/work/[slug]/page.tsx` now composes all 11 PROJECT_SPEC §7 sections: hero (`CaseStudyHero`); one-minute summary/why it exists/constraints/evolution/reflection (authored as `##` headings in `index.mdx`, rendered as part of its compiled body — CONTENT_MODEL §3 marks these as index.mdx's own sections, needing no separate component); surface/flow/system (`LayerSection` ×3); decisions (`DecisionList`, from frontmatter); next project (`NextProject`). None of the current seed content is full/short depth, so sections 2–11 don't render on any live page today — proven structurally instead via a fixture (`tests/fixtures/content/work/delta-full`, extended with real headings, a `nextSlug`, and live `<Figure>`/`<Note>`/`<DecisionCallout>` usage inside its layer files) and a dedicated Vitest test (`tests/unit/work-loader.test.tsx`) that renders the real components via `renderToStaticMarkup` and asserts all 11 sections appear. This satisfies "renders... in dev" via the exact method this remediation instruction itself specified, without publishing invented project content.
- **MDX component whitelist populated**: `Figure`, `Note`, `DecisionCallout` — exactly the three named in ARCHITECTURE §6, no others. `blockJS`/`blockDangerousJS` remain explicit `true`.
- **Required-section heading gate implemented**: `checkRequiredSectionHeadings` in `lib/content/validate.ts`, applied per depth (full: one-minute summary/why it exists/constraints/evolution/reflection; short: one-minute summary/why it exists/reflection; preview/none: nothing required, matching CONTENT_MODEL §3's "description field only"). Identifies project, file, missing heading, and depth. 8 new unit tests (positive + negative for both full and short depth, plus the preview/none no-op cases).
- **`/work` is now tiered**: `getProjectsByTier` drives four groups in PROJECT_SPEC §9 order (Featured systems / Built for real life / Selected archive / Origins), each rendered only when non-empty — currently only "Featured systems" (1 entry) shows.
- **Gate demonstration, redone on real content**: temporarily bumped the real, published `professional-systems/index.mdx` to `depth: "short"` with a body missing the required "Reflection" heading (plus temporary valid layer files, to isolate the heading gate from the layer-existence/layer-meaning gates). `pnpm build` failed with exactly `Error: professional-systems (index.mdx): required section heading "Reflection" is missing (depth: short)` — a single, cleanly isolated failure. Reverted `index.mdx` (diffed byte-identical against a pre-edit backup) and deleted the three temporary layer files; `pnpm build` re-run clean.
- **Publication-model conflict closed**: confirmed Model B (`status: draft|published`; `depth: none|preview|short|full`, with "preview" a depth value, not a third status) is what CONTENT_MODEL §1 already specifies and what `lib/content/schemas.ts` already implements — no schema change was needed for this, only the documentation-level confusion in an earlier instruction's phrasing. No DECISIONS.md entry added for this specifically, since CONTENT_MODEL already correctly documents it.
- Full verification suite re-run clean after all changes: `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm exec playwright test`. Vitest: 76/76. Playwright: 58/58 on Chromium + WebKit.
- No new dependencies. No Client Components added. No commit made.
- Status: **STOPPED — TASK-004 remediated and re-verified. Awaiting review.**

### 2026-07-29 — Provisional development-placeholder metadata applied (Kıvılcım, DropSpot, JointLedger)

- **These are explicitly provisional development placeholders, not user-verified portfolio facts** — recorded here as instructed, so this is never mistaken for confirmed content later. Applied to unblock further implementation work without waiting on Hakan's input.
- Kıvılcım: `phase: "active-development"`, `aiAssisted: true` (+ placeholder `aiDisclosure`), `contribution: "I conceived, designed, and am developing Kıvılcım as a local-first personal planning, focus, and growth system."`. `status` stays `draft`, `depth` stays `preview`.
- DropSpot: `phase: "paused"`, `aiAssisted: true` (+ placeholder `aiDisclosure`), `contribution: "I designed DropSpot's core user flows and developed its frontend and backend foundation."`. `status` stays `draft`, `depth` stays `preview`. No concurrency/race-condition/scale/performance/user/outcome/production claim was added or restored.
- JointLedger: `phase: "active-development"`, `aiAssisted: true` (+ placeholder `aiDisclosure`), `contribution: "I extended ezBookkeeping with shared books, membership roles, invitation foundations, and BookId migration and backfill support."`. `upstream.url`/`upstream.name` confirmed (not placeholders, see above). No link or visibility value added for JointLedger's own repository — `links` stays empty. `status` stays `draft`, `depth` stays `preview`.
- Professional Systems: unchanged — `status: "published"`, `depth: "preview"`, `phase`/`aiAssisted` omitted, exact D-009 wording.
- `aiDisclosure` note: the schema (preserved as-is, no new enum or rule added) requires `aiDisclosure` whenever `aiAssisted` is `true`. Since the instruction specified `aiAssisted: true` without an aiDisclosure value, a `[CONTENT REQUIRED: AI-assistance disclosure details — pending confirmation]` marker was used — the same marker convention already used elsewhere for unconfirmed fields, not an invented disclosure statement.
- Body MDX text was left unchanged for all three drafts — only frontmatter metadata was in scope for this change. (Kıvılcım's and DropSpot's bodies still list "role statement"/"Hakan's specific contribution" among pending items, which is now slightly stale since `contribution` has a placeholder value; noted here rather than silently edited, since body copy wasn't part of this instruction's scope.)
- Verified empirically: all three draft projects 404 on direct access and are absent from `/work`'s rendered HTML; none of the new placeholder values (`active-development`, `paused`, AI-assistance text, the new contribution strings) appear anywhere in `/work` or `/work/professional-systems`'s rendered HTML. Professional Systems remains the only entry in `generateStaticParams`/the production build output.
- No new schema enum added. No new DECISIONS.md entry added (none was needed — D-018's existing optional-field behavior already covers this; nothing architectural changed). The TASK-004 acceptance criterion for the four-item D-016 public order remains unchecked, unmodified from the prior remediation pass.
- Full verification suite re-run clean: `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm exec playwright test`. Vitest: 76/76. Playwright: 58/58 on Chromium + WebKit.
- No new dependencies. No commit made.
- Status: **STOPPED — provisional metadata applied and verified. Still awaiting Hakan's real-fact confirmation before any of the three can publish.**
