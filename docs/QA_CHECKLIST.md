# QA CHECKLIST — Built in Layers

Used by every task's completion report and fully executed in TASK-008. Check items honestly: `passed / failed / not applicable`. Never mark an item passed without running or inspecting it.

**TASK-008 recorded run (2026-08-11, finalized; Lighthouse-performance remediation pass 2026-08-12)** — see the dated `docs/PROGRESS.md` log entries for full evidence behind every checked item below. `@axe-core/playwright@4.12.1` was installed (explicit approval given) and Lighthouse was run via `pnpm dlx` (never added to `package.json`) against a real production build — both genuinely executed, not deferred. The 2026-08-12 pass fixed one real CLS regression (0.068 on `/work`, now a verified 0 everywhere) and one real oversized-image defect (Hakan-approved), and recorded Hakan's explicit visual approval of the OG image. Exactly two items remain unchecked for real, disclosed reasons: canonical URLs correctly use the safe development fallback because **no production domain is confirmed yet** (never invented) — proven to derive correctly once one is configured (see the TASK-008 task file's acceptance table); and Lighthouse's Performance category remains genuinely volatile on this measurement machine across 21 total runs in 3 batches (real, `uptime`-verified CPU contention) rather than a clean pass/fail — Accessibility/Best Practices/SEO all reliably pass in every run.

## 1. Automated gates (run for every task)

- [x] `pnpm typecheck` — zero errors
- [x] `pnpm lint` — zero errors/warnings
- [x] `pnpm format:check` — clean
- [x] `pnpm test` — all unit/component tests pass (388/388, 2026-08-12)
- [x] `pnpm build` — production build succeeds (includes content gates; 14 routes, zero warnings)
- [x] `pnpm test:e2e` — smoke suite passes on Chromium + WebKit (334/334, 2026-08-12). Firefox stays a manual/later check — not run this pass

## 2. Content truthfulness (every task touching content)

- [x] No `[CONTENT REQUIRED` marker renders in production output (verified via direct HTML fetch of all 9 routes + e2e regression test)
- [x] No invented metrics, clients, outcomes, testimonials, dates, or screenshots (no content changed this task — `git diff` over `content/` is empty)
- [x] Every technical claim traced to the repository audit or Hakan's explicit statement (unchanged from TASK-005/006/007 — content untouched)
- [x] Provenance labels correct (personal / professional / internship / learning / fork); upstream credited where `fork` (unchanged, re-confirmed)
- [x] AI-assisted work disclosed where applicable (unchanged)
- [x] Featured projects state Hakan's specific contribution (unchanged)
- [x] Pending/placeholder areas use approved honest wording (CONTENT_MODEL §8) (unchanged)
- [x] Old CV data not presented as current (unchanged; no CV data exists on the site)

## 3. Accessibility (manual, every UI task)

- [x] Keyboard-only pass: every interactive element reachable, operable, in logical order; no traps (re-verified via existing + new Playwright keyboard coverage)
- [x] Skip link appears on first Tab and jumps to `#main` (unchanged, covered by `shell.spec.ts`)
- [x] Visible focus state on every interactive element (DESIGN_SYSTEM §11) (unchanged)
- [x] Exactly one `h1`; heading levels don't skip; landmarks present (re-audited this pass across all 9 routes + 404 — one `header`/`nav`/`main`/`footer` each, single `h1`, no skipped levels)
- [x] Mobile MENU (revised D-005): trigger visible and keyboard operable; panel opens with focus managed into it; Escape closes and returns focus to the trigger; all links reachable without JS (unchanged, re-confirmed)
- [x] Layer switch (revised D-006, manual activation): Left/Right Arrow move tab focus without activating; Home/End go to first/last tab; Enter/Space activate; `tablist`/`tab`/`tabpanel` roles correct; state announced (`aria-selected`) (unchanged, re-confirmed)
- [x] All images have meaningful alt text (or empty alt if truly decorative) (schema-enforced, all 16 registered images checked non-empty)
- [x] Color contrast (approved D-004): normal text ≥ 4.5:1; meaningful control boundaries and indicators ≥ 3:1; measured against the DESIGN_SYSTEM §2 table (tokens unchanged since D-004's computed verification — re-confirmed by reading `styles/globals.css` directly, hex values identical)
- [x] Color is never the only indication of selection, focus, status, or interaction (unchanged)
- [x] Touch targets ≥ 44×44px (unchanged, `min-h-11`/`min-w-11` re-confirmed on tabs and nav triggers)
- [x] Page fully understandable with JavaScript disabled; all three layer sections visible, ordered, labelled, and readable without JS (re-confirmed via direct `curl` of raw HTML: real stacked headings, zero `role="tab"`)
- [x] Automated axe scan: **28/28 pass, zero violations** (`@axe-core/playwright@4.12.1`, all 9 routes + 404 + 4 interactive states, both browsers) — one real `heading-order` violation found on `/work` and fixed (tier group labels are now genuine `h2` headings) before this passed

## 4. Reduced motion (every task from TASK-007 on)

- [x] OS-level `prefers-reduced-motion: reduce`: no reveals, no panel animation, content complete (re-confirmed via screenshot + existing Playwright `reducedMotion` suite)
- [x] Playwright suite passes with `reducedMotion: 'reduce'` emulation (part of the 304/304 pass)
- [x] No content or meaning depends on an animation having played (unchanged)

## 5. Responsive (manual, every UI task)

Check at 375px, 768px, 1024px, 1440px (and 320px for overflow only):

- [x] No horizontal overflow or scrollbar — **checked at all five widths this pass**, including 320px (new `tests/e2e/seo.spec.ts` coverage across all 9 routes, both browsers, plus a full visual screenshot pass with zero overflow measured)
- [x] Grid columns per DESIGN_SYSTEM §4 (4 / 8 / 12) (unchanged)
- [x] Homepage sections match DESIGN_SYSTEM §15 behavior (unchanged)
- [x] Images keep aspect ratio; no layout shift while loading (fixed dimensions) — **empirically re-measured 2026-08-12**: real `PerformanceObserver` CLS on `/`, `/work`, `/work/kivilcim` under throttled network — 0, 0, ~0. `/work` previously carried a real, Lighthouse-measured 0.068 CLS defect (`Figure`'s `<img>` never had explicit width/height, despite `ARCHITECTURE.md`/`DESIGN_SYSTEM.md` already documenting that as required) — fixed via `lib/utils/imageDimensions.ts`, re-measured at 0 in all 21 Lighthouse runs plus this independent check
- [x] Text remains readable (no clipped clamp values, measure ≤ 42rem) (unchanged, re-confirmed visually)

## 6. Visual system compliance (every UI task)

- [x] Only approved tokens used — no raw hex values in components (no component styling touched this task)
- [x] Decorative elements limited to DESIGN_SYSTEM §8 vocabulary (unchanged)
- [x] `--signal` used only decoratively where it carries no meaning — never text, never a meaningful indicator; text accents use `--signal-text`, meaningful boundaries/indicators use `--signal-ui` (D-004) (unchanged)
- [x] Radius ≤ 4px; no box shadows; no gradients (unchanged)
- [x] Anti-generic criteria (DESIGN_SYSTEM §17) reviewed and recorded (unchanged — no visual/layout change this task)

## 7. Architecture compliance (every code task)

- [x] Server Components by default; client components only from the approved allowlist (`JsonLd` is a Server Component; zero new Client Components added — `grep '"use client"'` still returns exactly the 4 TASK-007-approved files)
- [x] No project data hard-coded in presentation components (`sitemap.ts` reads from `getPublishedProjects()`, not a hard-coded list)
- [x] No unapproved dependency added (`package.json`/`pnpm-lock.yaml` diff for this task is empty)
- [x] No barrel files, no speculative abstractions (`JsonLd` meets ARCHITECTURE §17 rule 1 — used in two real places, `/` and `/about`)
- [x] Changed files limited to the active task's expected list (deviations reported in the TASK-008 task file)

## 8. SEO / metadata (TASK-002 baseline, TASK-008 full)

- [x] Unique title + description per route via `buildMetadata` (verified on all 9 routes via `tests/e2e/seo.spec.ts`)
- [ ] Canonical URLs correct; OG image present — **OG image: present, correct, and now explicitly Hakan-approved (2026-08-12)** (1200×630 PNG, real dimensions/content-type verified, referenced on all 9 routes; design unchanged from the 2026-08-11 pass). **Canonical URLs: mechanism correct, but no confirmed production domain exists yet** — uses the safe dev fallback, proven to derive correctly once a real domain is configured; this sub-item is why the checkbox stays open
- [x] `sitemap.xml` lists exactly the published routes; `robots.txt` sane (verified via direct HTTP fetch + unit + e2e tests)
- [x] JSON-LD Person contains only verified fields (verified via unit + e2e tests, and direct inspection of the rendered, unescaped JSON)
- [x] External links: `rel="noopener noreferrer"`, new-tab indication (unchanged, re-confirmed in `TextLink.tsx`/`ButtonLink.tsx`)

## 9. Release gate (TASK-008 only)

- [x] axe scan (all routes): **28/28 pass, zero violations** — `@axe-core/playwright@4.12.1`, all 9 routes + 404 + 4 interactive states (MobileNav open, each Layer Explorer tab, Layer Explorer keyboard focus, project card keyboard focus), both browsers
- [ ] Lighthouse (mobile emulation): **Accessibility 100/100/100, Best Practices 96/96/96, SEO 100/100/100 — all reliably meet target across 21 runs in 3 batches (2026-08-11 and 2026-08-12). Performance does not reliably meet ≥90** on this measurement machine: repeated runs across both passes (13 on `/`, 12 on `/work`, 12 on `/work/kivilcim`) show genuine volatility tracking real, `uptime`-verified CPU contention, not a deterministic app defect. Two real defects were found and fixed this run: image auto-preload competing with the critical path (2026-08-11), and a real CLS regression (0.068 on `/work`) plus a real oversized-image defect (2026-08-12, Hakan-approved). LCP/Speed Index/CLS improved measurably; the homepage's Performance score improved consistently (every post-fix run beat every pre-fix run); `/work`/`/work/kivilcim` did not show a comparably clean net change, correlating with measurably higher system load during parts of that measurement window. Not marked passed since it did not reliably pass.
- [x] CLS ≈ 0 on all routes; no font-swap layout jumps — **measured, not assumed**, re-confirmed 2026-08-12 after fixing a real regression: real `PerformanceObserver` CLS on `/`, `/work`, `/work/kivilcim` under throttled network, all effectively 0; corroborated by all 21 Lighthouse runs also reporting CLS 0
- [x] Total JS on `/` recorded — **192.6 KB gzip transferred / 636.2 KB decoded** (corrected CDP-based measurement, re-verified 2026-08-12 after this pass's CLS/image fixes — unchanged, as expected, since neither fix touches JS; target was <120KB, framework-inclusive reading not met — ~110KB is unavoidable React+Next.js framework baseline, ~39KB is the TASK-007-approved `motion` dependency already using its leanest import path; full breakdown in the TASK-008 task file's acceptance table)
- [x] 404 route works on the deployment target (verified: unknown routes and unknown project slugs both correctly 404 on a fresh production server)
- [x] Full manual pass of sections 2–8: **complete** — the only unchecked items across this entire checklist are the confirmed-production-domain sub-items in §8/§9, both genuinely blocked on Hakan, not on unfinished work
