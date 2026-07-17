# TASK-008 — Accessibility, performance, SEO

Status: NOT STARTED — requires Phases 2–7 approved; routes and published content stable (ROADMAP Phase 8 entry)

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

- Phases 2–7 approved. Blocking inputs: production domain; OG image approval; (optional) confirmed email/location for JSON-LD/footer.

## Exact files expected to be created or changed

```text
Created: app/sitemap.ts, app/robots.ts, app/opengraph-image.png,
  tests/e2e/a11y.spec.ts
Changed: lib/seo/metadata.ts (finalization), affected page metadata exports,
  package.json/pnpm-lock.yaml (@axe-core/playwright),
  next.config.ts (only if a measured perf fix requires it — report),
  docs/PROGRESS.md, docs/QA_CHECKLIST.md (recorded results)
```

Perf fixes may touch image/font usage in existing components — every such file listed in the report.

## Implementation steps

1. Read docs; report plan; confirm blocking inputs exist (STOP if domain/OG approval missing); `git status`.
2. Add axe spec; fix mechanical findings (labels, names, contrast tokens misuse) — anything structural goes to the report instead.
3. Complete metadata, sitemap, robots, JSON-LD; validate OG with a link-preview debugger locally.
4. Build production; run Lighthouse ×3 routes; record numbers; apply in-architecture fixes; re-measure.
5. Execute the full QA_CHECKLIST manually; record every item honestly.
6. Final gate run; `git status`; final report + release recommendation.

## Acceptance criteria

- [ ] All verification commands pass; axe: zero violations across all routes.
- [ ] Lighthouse targets met on all three measured routes (numbers in report, before/after where fixes applied).
- [ ] Sitemap lists exactly the published routes; robots sane; canonical URLs use the confirmed domain.
- [ ] OG image approved by Hakan and rendering in link-preview checks.
- [ ] JSON-LD contains only verified fields (validated with a structured-data linter).
- [ ] QA_CHECKLIST 100% executed with recorded outcomes; zero unexplained failures.
- [ ] Only `@axe-core/playwright` added.
- [ ] Client JS on `/` recorded; within target or justified in the report.

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
