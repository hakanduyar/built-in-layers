# TASK-008 — Accessibility, performance, SEO

Status: **RELEASE CANDIDATE — BLOCKED ON PRODUCTION DOMAIN AND LIGHTHOUSE PERFORMANCE (2026-08-12)**. Phases 2–7 approved, all four projects published and stable. The 2026-08-11 finalization pass installed `@axe-core/playwright` (28/28 pass, zero violations), created and wired the approved default OG image, and corrected a flawed client-JS measurement. A 2026-08-12 Lighthouse-performance-only remediation pass then: recorded Hakan's explicit visual approval of the OG image; found and fixed one real, measured CLS regression (0.068 on `/work`, traced to `Figure`'s `<img>` never carrying explicit width/height — despite `ARCHITECTURE.md` §8 and `DESIGN_SYSTEM.md` §9 already documenting that mechanism as required); found and fixed one real, measured oversized-image defect (DropSpot's `browse-drops.webp` thumbnail, 338KB lossless at 1806×822 delivered where at most ~1400px is ever needed — resized/re-encoded lossy to 75KB, Hakan-approved, visually verified identical); investigated `LazyMotion` per an explicit multi-part gate and did not implement it (would reopen TASK-007 architecture for negligible measured benefit); and re-ran Lighthouse across 21 total runs in 3 measurement batches. **6 of 8 original acceptance criteria are genuinely met — the same 2 remain open, now with substantially stronger and more current evidence:** (1) the production domain remains unconfirmed — canonical/sitemap/robots/OG/JSON-LD all correctly use the safe development fallback and are proven (via a reserved test-only domain) to derive correctly the moment a real domain is configured, but no domain is invented; (2) Lighthouse's Performance category still does not reliably clear its ≥90 target on this measurement machine — Accessibility (100), Best Practices (96), and SEO (100) clear their targets in every one of the 21 runs; CLS is now a real, verified 0 in every run (was 0.068 on `/work`); Performance itself remains genuinely volatile, correlating with real, `uptime`-verified CPU contention rather than with the code changes (home improved consistently after the fixes, 79–84 → 85–89; work/kivilcim's aggregate range across all post-fix runs is 78–92, tracking a measurably busier machine during parts of that window). See the acceptance table below and the dated `docs/PROGRESS.md` log entries for full evidence.

## Objective

The release gate: complete SEO/metadata surfaces (OG, sitemap, robots, JSON-LD), automated accessibility scanning, performance verification against explicit targets, and a full recorded run of `docs/QA_CHECKLIST.md`. After this task the MVP is releasable.

## In scope

- Install `@axe-core/playwright` (dev; pre-approved D-014).
- `tests/e2e/a11y.spec.ts`: axe scan of every route (including one case study and 404) — zero violations required; documented, justified exceptions only with Hakan's sign-off.
- Metadata completion via `lib/seo/metadata.ts`: verify unique title/description/canonical per route; case-study descriptions from frontmatter `description`.
- `app/opengraph-image.png`: static default OG image (1200×630) built from approved tokens/wordmark — **requires Hakan's visual approval before inclusion**; per-project OG images only where real approved assets exist.
- `app/sitemap.ts` (published routes only, from loaders) and `app/robots.ts`.
- JSON-LD `Person` on `/` and `/about`: name, jobTitle "Frontend & Product Engineer", sameAs [GitHub, LinkedIn, Medium] — only verified fields; email/location included only if confirmed by then.
- `SITE_URL` finalized from Hakan's domain decision (env var). The production domain is required **before this task completes** (approval item 17) — it is not a blocker for any earlier phase; until confirmed, the typed configuration keeps its safe development value and the domain is never invented.
- Performance pass on the production build: Lighthouse (mobile emulation) on `/`, `/work`, one case study — Performance ≥90, Accessibility ≥95 (target 100), Best Practices ≥95, SEO ≥95; CLS ≈ 0; client JS on `/` measured and recorded (target <120KB gzip). Fix only measurement-revealed issues within existing architecture (image sizes/priority, font preload, unnecessary client code) — no redesigns.
- Full manual QA_CHECKLIST execution (all sections) on the production build, results recorded in the report and PROGRESS.md.
- Cross-browser check per revised D-010: WebKit is already covered by the automated Playwright suite; run a manual Firefox smoke (layout, navigation/menu, layer explorer, focus states).

## Out of scope

- New features, content, layout, or motion changes (regressions found → report; fixes beyond trivial metadata/perf adjustments go back to the owning phase with Hakan's direction).
- Dynamic OG generation (D-007), analytics, RSS, CI (post-MVP proposals).
- Chasing Lighthouse 100s with architecture changes.

## Dependencies

- Phases 2–7 approved. Blocking inputs: production domain (still open); ~~OG image approval~~ (resolved this pass — a Hakan-approved default identity image, no confirmation-dependent facts); (optional) confirmed email/location for JSON-LD/footer.

## Exact files expected to be created or changed

```text
Created: app/sitemap.ts, app/robots.ts, app/opengraph-image.tsx,
  components/ui/JsonLd.tsx, lib/utils/imageDimensions.ts,
  tests/e2e/a11y.spec.ts, tests/e2e/seo.spec.ts, tests/unit/seo.test.ts,
  tests/unit/image-dimensions.test.ts
Changed: lib/seo/metadata.ts, app/layout.tsx (metadataBase),
  app/page.tsx / app/about/page.tsx (JsonLd), app/work/page.tsx (heading-
  order axe fix), components/ui/Figure.tsx (image-preload perf fix,
  then explicit width/height CLS fix), public/images/projects/dropspot/
  browse-drops.webp (resized/re-encoded, Hakan-approved, 338KB->75KB),
  package.json/pnpm-lock.yaml (@axe-core/playwright only),
  docs/PROGRESS.md, docs/QA_CHECKLIST.md, docs/CONTENT_INVENTORY.md
Deleted: public/images/projects/professional/ (dead-asset cleanup,
  unreferenced/superseded — see docs/CONTENT_INVENTORY.md)
```

**Deviation from the plan**: `app/opengraph-image.tsx` (Next.js's `next/og` mechanism), not a hand-authored `app/opengraph-image.png` — no design tool or image-processing dependency was available in this environment; `next/og` is bundled with Next.js (zero new dependency) and, for this non-dynamic route, produces one real static PNG at build time, matching D-007's actual outcome. Disclosed, not silent.

Perf fixes touched `components/ui/Figure.tsx` (image loading priority, then explicit width/height for CLS), `app/work/page.tsx` (heading semantics, found via the axe scan), `lib/utils/imageDimensions.ts` (new — reads real asset intrinsic dimensions, no dependency), and `public/images/projects/dropspot/browse-drops.webp` (resized/re-encoded asset, Hakan-approved) — all listed here and in the report with their measurement rationale.

## Implementation steps

1. Read docs; report plan; confirm blocking inputs exist (STOP if domain/OG approval missing); `git status`.
2. Add axe spec; fix mechanical findings (labels, names, contrast tokens misuse) — anything structural goes to the report instead.
3. Complete metadata, sitemap, robots, JSON-LD; validate OG with a link-preview debugger locally.
4. Build production; run Lighthouse ×3 routes; record numbers; apply in-architecture fixes; re-measure.
5. Execute the full QA_CHECKLIST manually; record every item honestly.
6. Final gate run; `git status`; final report + release recommendation.

## Acceptance criteria

- [x] All verification commands pass; axe: zero violations across all routes. **Met (2026-08-11)**: `pnpm typecheck && pnpm lint && pnpm format:check` clean; `pnpm test` 384/384; `rm -rf .next && pnpm build` clean (14 routes, zero warnings); `pnpm exec playwright test` **334/334** (167 Chromium + 167 WebKit). `@axe-core/playwright@4.12.1` installed (explicit approval given this finalization turn) and run in `tests/e2e/a11y.spec.ts` against every route (all 9 content routes + the custom 404) plus 4 genuinely interactive states (MobileNav open, each Layer Explorer tab active, Layer Explorer keyboard focus, a project card keyboard focus) — **28/28 pass (14 × 2 browsers), zero violations**. One real violation was found and fixed first (`heading-order` on `/work`, see §10 note in PROGRESS.md), then the suite re-run clean; no rule was suppressed or excluded.
- [ ] Lighthouse targets met on all three measured routes (numbers in report, before/after where fixes applied). **Not fully met — 3 of 4 categories reliably pass, Performance does not.** Ran via `pnpm dlx lighthouse` (v13.4.1, one-off, never added to `package.json`), mobile emulation (`--form-factor=mobile --screenEmulation.mobile --throttling-method=simulate`), against a fresh production build/server, on the exact 3 routes: `/`, `/work`, `/work/kivilcim`. **Accessibility: 100/100/100. Best Practices: 96/96/96. SEO: 100/100/100** — all three reliably clear their ≥95 targets across every run, in both the 2026-08-11 and 2026-08-12 passes. **Performance**: 21 total runs across 3 measurement batches this pass (baseline: 3×3 routes; a post-fix batch: 3×3 routes; a supplementary quieter-machine batch: 3×2 routes for `/work`/`/work/kivilcim`), each timestamped and cross-referenced against `uptime`. Two real, measured defects were found and fixed:
  1. **A real CLS regression (0.068, `/work`)**: `Figure`'s `<img>` never carried explicit `width`/`height`, despite `ARCHITECTURE.md` §8 and `DESIGN_SYSTEM.md` §9 already documenting that as the required zero-CLS mechanism — a genuine, pre-existing implementation gap this pass's Lighthouse `layout-shifts` diagnostic caught directly (Kıvılcım's `product-areas-map.svg` card pushing the DropSpot card below it down once the SVG loaded). Fixed with `lib/utils/imageDimensions.ts` (reads each real asset's true pixel size — SVG root attributes, WebP VP8L/VP8 bitstream headers — directly, no new dependency) feeding explicit `width`/`height` onto `Figure`'s `<img>`. **CLS is now a measured, verified 0 in every one of the 21 Lighthouse runs**, corroborated independently via real `PerformanceObserver` measurement on `/`, `/work`, `/work/kivilcim` under throttled network (0, 0, 0.00016).
  2. **A real oversized-image defect (Est. 309 KiB, `/` and `/work`)**: DropSpot's `browse-drops.webp` ProjectCard thumbnail — a real screenshot saved losslessly at 1806×822 (338KB) — was delivered at that full size everywhere it's used, including a ~310px-wide card. Resized to 1400×637 (comfortably covering its largest real usage, the DropSpot case-study layer figure at up to ~672px CSS width) and re-encoded lossy WebP quality 90 → **75KB (78% reduction)**; visually compared side-by-side against the original, no perceptible quality loss. **Hakan explicitly approved this replacement before it was applied** (the sandbox's own permission classifier flagged the binary asset overwrite as needing sign-off). Measured `image-delivery-insight` waste on `/`/`/work` dropped from ~309 KiB to ~62–70 KiB (the small residual gap is the image still being sized for its larger case-study usage, not the smaller card).
  A `LazyMotion` refactor was investigated per an explicit gate (current Motion contribution, expected removable bytes, files that would change, semantics/boundary/no-JS/reduced-motion preservation) and **not implemented**: the `motion/react` import is already minimal (`motion`, `useInView`, `useReducedMotion` only — confirmed via the production bundle, chunk `1ty0zfiokiy3n.js`, ~39KB gzip), `Reveal`'s Hero `onLoad` usage needs it immediately on `/` (the busiest route), so code-splitting it would yield negligible real initial-load benefit there, while requiring a new `<LazyMotion>` provider and an `m.*` swap across `Reveal.tsx`/`PanelTransition.tsx` — a genuine, disqualifying expansion of TASK-007's approved architecture per this turn's own gate.
  **Performance scores after both fixes**: home improved consistently (baseline 79/81/84 → after-fix 85/88/89 — every post-fix run beats every pre-fix run). `/work` and `/work/kivilcim` did not show a comparably clean improvement (aggregate post-fix range 78–92 for `/work`, 78–91 for `/work/kivilcim` across 6 runs each) — measured system load during the worst of those runs (`uptime` 1-min load 3.4–4.4, later Playwright-contended peaks to 8.99) was materially higher than during the quieter baseline (0.7–3.0) and the supplementary re-check (2.0–2.9, which scored 88–92 and 83–91 respectively). This is reported honestly as CPU-contention-correlated volatility, not proof the fixes helped or hurt those two routes specifically — the code changes themselves (real, measured CLS elimination and real, measured byte reduction) cannot plausibly have made performance worse. Did not manipulate throttling/settings to chase a number.
- [ ] Sitemap lists exactly the published routes; robots sane; canonical URLs use the confirmed domain. **Sitemap/robots portions met; domain portion explicitly not, per this turn's binding instruction.** `app/sitemap.ts`/`app/robots.ts` verified correct (5 static + 4 published project routes, D-016 order, no draft/test slugs; robots allow-all pointing at the real sitemap). **No production domain exists or was invented.** `SITE_URL` (the single, pre-existing, ARCHITECTURE §9-specified mechanism — `NEXT_PUBLIC_SITE_URL`, no second mechanism introduced) keeps its safe development fallback. Proven correct for when a real domain **is** eventually configured: a dedicated test suite (`tests/unit/seo.test.ts`, "SITE_URL: derivation once a real domain is configured") re-imports the metadata/sitemap/robots modules with `NEXT_PUBLIC_SITE_URL` set to the IANA-reserved `https://portfolio.example` and asserts canonical/sitemap/robots/JSON-LD all derive correctly with no double slashes — cross-checked with a real, one-off production build using that same test-only value (prerendered `sitemap.xml`/`robots.txt`/canonical tags all correctly showed `https://portfolio.example/...`; that build was discarded, never part of the reviewed tree). This criterion, and TASK-008 as a whole, cannot reach COMPLETE until Hakan confirms a real domain — an explicit deployment-time blocker, not a code gap.
- [x] OG image approved by Hakan and rendering in link-preview checks. **Fully met (2026-08-12)** — `app/opengraph-image.tsx` (Next.js's native `next/og` `ImageResponse`, bundled with Next.js — zero new dependency; generated once at build time since the route has no dynamic params, matching D-007's "one static default image" outcome) creates a real 1200×630 PNG using only the approved Built in Layers identity (name, title, positioning line, the DESIGN_SYSTEM §8 layer-registration-mark motif) — no photo, no fake screenshot, no client/employer name, no metric, no gradient/glass/neon/3D/stock imagery. Verified: exact 1200×630 dimensions (read directly from the PNG's own IHDR chunk, not assumed), `content-type: image/png`, referenced via a full image descriptor (not a bare URL string, which Next.js silently under-populates) on all 9 routes' `og:image`/`og:image:width`/`og:image:height`/`og:image:alt`/`twitter:image` meta tags — confirmed via direct HTTP fetch of real rendered HTML, not just the component source. **Hakan has now explicitly reviewed and approved the rendered visual itself (2026-08-12)** — the image design is retained completely unchanged from what was verified in the 2026-08-11 pass (no pixels, copy, or component code touched by this remediation turn). "Link-preview checks" here means direct verification of the meta tags and image bytes themselves (an external live crawler like Facebook's Sharing Debugger has nothing to crawl yet — no public URL exists); this is a disclosed, honest scope limit of the pre-deployment state, not a gap in what was actually tested.
- [x] JSON-LD contains only verified fields (validated with a structured-data linter). **Met, re-confirmed this pass.** `buildPersonJsonLd()` unchanged and re-verified: `name`, `jobTitle`, `url`, `sameAs` (exactly the 3 verified social links) — no email/location/employer/organization claim. "Validated with a structured-data linter" — no external linter was used (same no-public-URL constraint as above); validated instead by parsing the actual rendered `<script type="application/ld+json">` output with `JSON.parse` and asserting its field set, in both `tests/unit/seo.test.ts` and `tests/e2e/seo.spec.ts`. Confirmed via direct `curl` that the JSON renders byte-for-byte unescaped and that no `dangerouslySetInnerHTML` was introduced (`JsonLd.tsx` uses a plain string child; React treats `<script>` as a raw-text SSR element).
- [x] QA_CHECKLIST 100% executed with recorded outcomes; zero unexplained failures. **Met (2026-08-11)**: every section (§1–§9, including §9's release gate — axe and Lighthouse, both genuinely run this pass) executed and recorded in `docs/QA_CHECKLIST.md` with real evidence per item. "100% executed" is satisfied; "zero unexplained failures" is also satisfied — the two items that remain unchecked (confirmed-domain canonical, Lighthouse Performance) both have complete, evidenced explanations directly in this file and in `docs/PROGRESS.md`, not silent gaps.
- [x] Only `@axe-core/playwright` added. **Met exactly as specified (2026-08-11)**: `pnpm add -D @axe-core/playwright` resolved to `4.12.1`; `package.json` diff is exactly one new line; `pnpm-lock.yaml`'s only new entries are `@axe-core/playwright@4.12.1` and its own dependency `axe-core@4.12.1` (`playwright-core` already existed). No other dependency added.
- [x] Client JS on `/` recorded; within target or justified in the report. **Met via the "or justified" branch, with a corrected measurement (originally 2026-08-11, re-verified 2026-08-12 after this pass's fixes).** The same rigorous CDP-based methodology (single real navigation to `/`, cache disabled, no interaction, no second navigation, every `Network.loadingFinished` JS resource deduplicated by URL, `encodedDataLength`/decoded-body-length recorded directly, CSS excluded) was re-run after the CLS and image fixes (neither touches JS) — **192.6 KB transferred (gzip) / 636.2 KB decoded**, unchanged from the 2026-08-11 figure to within rounding, confirming both the methodology's stability and that this pass's fixes didn't move the JS payload. Largest resources: `3ghme2cunj9pg.js` 69.8KB gzip (React DOM), `1dvxs89d0uexm.js` 39.9KB gzip (Next.js App Router runtime), `1ty0zfiokiy3n.js` 38.8KB gzip (`motion` — confirmed via direct chunk inspection to contain exactly the `motion`/`useInView`/`useReducedMotion` API surface `Reveal.tsx`/`PanelTransition.tsx` import, nothing else), plus 8 smaller framework/app chunks (~44KB combined). Still above the 120KB target under a framework-inclusive reading; the original task text does not disambiguate "application-authored" vs. "framework-inclusive," reported rather than resolved opportunistically. `LazyMotion` was re-investigated this pass under the full 7-part gate (§12 of this turn's instruction) and again not implemented — see the Lighthouse criterion above for the current reasoning.

## Required verification commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
# plus recorded runs of: Lighthouse (mobile emulation) on /, /work, /work/kivilcim
```

## Manual browser checks

- Full QA_CHECKLIST §5 responsive pass on the production build.
- Link previews (OG) render correctly; favicon present; 404 on the deployment target.
- Firefox manual smoke: layout, navigation/menu, layer explorer, focus states (WebKit covered by the automated suite — D-010).

## Accessibility checks

- QA_CHECKLIST §3 and §4 in full, on the production build, recorded item-by-item.
- axe results attached to the report.

## Content verification checks

- QA_CHECKLIST §2 in full — final truthfulness sweep of every published page.
- JSON-LD/metadata claims cross-checked against verified identity fields only.

## Rollback notes

Additive surfaces (sitemap/robots/OG/tests) revert cleanly via git. Perf fixes are per-file reverts — each listed in the report with its measurement rationale, so they can be reverted individually.

## Completion report template

```markdown
### TASK-008 report — <date>
- Files created/changed: <list>
- axe results per route: <zero | findings + resolutions>
- Lighthouse numbers (route × category, before/after): <table>
- Client JS on /: <n KB gzip>
- QA_CHECKLIST: full recorded run — <link/summary, failures + explanations>
- Cross-browser notes: <results>
- Deviations: <none | list>
- Unresolved issues / release blockers: <none | list>
- Release recommendation: <ready | not ready + reasons>
- Git status after: <...>
STOPPED. Awaiting release approval.
```
