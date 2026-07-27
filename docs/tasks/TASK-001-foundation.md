# TASK-001 — Foundation

Status: TECHNICALLY COMPLETE (2026-07-27) — full verification suite passes including Chromium + WebKit; D-001 remains PROVISIONAL FOR MVP FOUNDATION — REVIEW REQUIRED BEFORE TASK-004 (see `docs/DECISIONS.md`). Awaiting Hakan's review approval before TASK-002 begins.

## Objective

A verified, empty Next.js workspace: strict TypeScript, Tailwind v4 with the approved design tokens, the three approved fonts, all tooling (ESLint, Prettier, Vitest+RTL, Playwright Chromium + WebKit), every canonical quality-gate script green — plus the **mandatory D-001 MDX compatibility spike** and the **D-003 font compile/variant verification**.

## In scope

- Scaffold Next.js App Router project with pnpm in the repository root (no `src/` dir, import alias `@/*`).
- Strict TypeScript configuration.
- Tailwind v4 setup; `styles/globals.css` with all DESIGN_SYSTEM §2–§7 tokens under `@theme` (including approved `--ink-muted`, `--signal-text`, `--signal-ui`) and base styles (background `--paper`, text `--ink`, global `:focus-visible`, reduced-motion CSS clamp from ARCHITECTURE §13).
- Fonts via `next/font/google`: Archivo, Newsreader (italic), IBM Plex Mono; subsets `latin`, `latin-ext`. **Verify that the actual `next/font` imports compile successfully and that the selected variants and subsets are available** (including the Newsreader italic axis); verify OFL licensing; record both confirmations in the completion report. Do not add another font family without approval (D-003).
- **D-001 MDX compatibility spike (mandatory).** Install the pre-approved content deps (`zod`, `gray-matter`, `next-mdx-remote` — pinned to a compatible version with its JavaScript-blocking security options explicitly enabled) and prove, end-to-end:
  1. one local MDX file (repository-owned, trusted — the only kind ever compiled),
  2. frontmatter parsing (`gray-matter`),
  3. Zod validation of that frontmatter,
  4. rendering in a Server Component (`next-mdx-remote/rsc`),
  5. at least one custom MDX component in a restricted component map,
  6. `generateStaticParams` on a spike route,
  7. a passing production build,
  8. Vercel-compatible pre-rendering (route appears in the build output as prerendered).
  Record the outcome in the report and update DECISIONS D-001. **If the spike fails, adopt the documented fallback (`@next/mdx`)**, remove `next-mdx-remote`, and record the switch in D-001. Spike artifacts (route + sample MDX) are temporary: after the outcome is recorded, remove them and re-run the gates — TASK-004 rebuilds the real pipeline on the proven approach. User-submitted or remotely supplied MDX is never supported.
- `lib/utils/cn.ts` (local class-join helper, no dependency).
- Tooling config: ESLint (`eslint-config-next`), Prettier, Vitest (+ jsdom + RTL setup file), Playwright (**Chromium + WebKit** projects per revised D-010, `tests/e2e/`).
- Canonical scripts in `package.json`: `dev`, `build`, `typecheck`, `lint`, `format:check`, `format`, `test`, `test:e2e` (ARCHITECTURE §10).
- Replace boilerplate homepage with a minimal token-proof page: the word mark "BUILT IN LAYERS", one line per font role (display / statement / mono-label), on `--paper`. Explicitly temporary; replaced in TASK-002/003.
- One trivial Vitest test (e.g. `cn` util) and one Playwright smoke test (`/` renders, h1 present) so both harnesses are proven.
- Directory skeleton per ARCHITECTURE §2 (empty dirs with `.gitkeep` where needed): `components/{layout,sections,project,ui}`, `content/work`, `content/notes`, `content/lab`, `data`, `lib/{content,seo,utils}`, `public/images/projects/{kivilcim,dropspot,jointledger,professional,archive}`, `tests/{unit,e2e}`.
- `.gitignore` appropriate for Next.js/pnpm/Playwright.

## Out of scope

- Any real page, section, or layout component (TASK-002/003).
- The real content pipeline — production schemas, loaders, publication gates (TASK-004). The spike only proves compatibility; its artifacts do not survive this task.
- `motion` package (TASK-007). `@axe-core/playwright` (TASK-008).
- SEO beyond Next defaults. Any copy beyond the token-proof page.
- Committing (only if Hakan explicitly asks).

## Dependencies

- Phase 0 complete: git repository exists (initialized 2026-07-17); DECISIONS D-001 (provisional — this task runs its spike), D-002, D-003, D-004 resolved 2026-07-17.

## Exact files expected to be created or changed

Created by scaffold + this task (key files; scaffold lockfile/config included):

```text
package.json, pnpm-lock.yaml, tsconfig.json, next.config.ts,
postcss.config.mjs, eslint config, .prettierrc, .prettierignore, .gitignore,
vitest.config.ts, tests/setup.ts, playwright.config.ts,
styles/globals.css, app/layout.tsx, app/page.tsx (token-proof),
lib/utils/cn.ts, tests/unit/cn.test.ts, tests/e2e/smoke.spec.ts,
directory skeleton with .gitkeep files
```

Temporary (created for the D-001 spike, removed before completion after the outcome is recorded):

```text
app/spike-mdx/[slug]/page.tsx, content/spike/*.mdx,
lib/spike/* (frontmatter parse + Zod schema + component map for the spike)
```

No other files.

## Implementation steps

1. Report plan (files, risks, assumptions) per `CLAUDE.md §3`. Verify git repo exists; run `git status`.
2. Scaffold: `pnpm create next-app@latest .` with TypeScript, App Router, ESLint, Tailwind, no `src/`, alias `@/*`. Review generated versions; record them.
3. Harden `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
4. Move global CSS to `styles/globals.css`; define all tokens from DESIGN_SYSTEM §2–§7 and §13 (colors, type roles, spacing, radius, durations/easings) via `@theme` / custom properties; add base styles + focus style + reduced-motion clamp.
5. Configure fonts in `app/layout.tsx` with CSS variables (`--font-display`, `--font-serif`, `--font-mono`); verify the imports compile and the selected variants/subsets are available (D-003); verify OFL licenses.
6. Replace boilerplate `app/page.tsx` with the token-proof page (no design work — plain stacked samples).
7. Add Prettier, Vitest (+jsdom, RTL, setup file), Playwright (Chromium + WebKit projects, baseURL against `next start`).
8. Create directory skeleton and `lib/utils/cn.ts` + its test; write the Playwright smoke test.
9. **Run the D-001 MDX compatibility spike**: install `zod`, `gray-matter`, pinned `next-mdx-remote` (security options enabled); build the temporary spike route covering all eight checks; run `pnpm build` and confirm the spike route is pre-rendered. Record pass/fail evidence. On failure: switch to `@next/mdx`, repeat, record. Then remove the spike artifacts and re-run the gates.
10. Update DECISIONS D-001 with the spike outcome (confirmed or fallback adopted).
11. Wire canonical scripts. Run all verification commands. Run `git status`; report the full file list.

## Acceptance criteria

- [x] All verification commands below pass with zero errors/warnings (Playwright on Chromium + WebKit). **Re-confirmed 2026-07-27 with a fresh run of every command; both Chromium and WebKit genuinely pass (see report).**
- [x] `package.json` dependencies match ARCHITECTURE §14 TASK-001 rows exactly — nothing extra; `next-mdx-remote` pinned (exact version recorded) with JavaScript-blocking security options enabled, or removed if the fallback was adopted. **`next-mdx-remote@6.0.0` pinned; `blockJS`/`blockDangerousJS` enabled explicitly in the spike; fallback not needed.**
- [x] **D-001 spike executed with all eight checks; outcome (pass, or fallback adopted) recorded in the report and in DECISIONS D-001; spike artifacts removed and gates re-run.** **Spike passed all 8 checks. Status recorded as `PROVISIONAL FOR MVP FOUNDATION — REVIEW REQUIRED BEFORE TASK-004` (2026-07-27) — a passing spike alone does not close D-001 given the archived-upstream finding; a comparison against `@next/mdx` is now a mandatory precondition before TASK-004.**
- [x] Tokens in `globals.css` match DESIGN_SYSTEM values verbatim (including `--signal-ui`); no other colors defined.
- [x] Three fonts load via `next/font` with `latin-ext`; compile + variant/subset availability verified (D-003); licensing confirmation recorded.
- [x] `tsconfig` strict flags set as listed.
- [x] Token-proof page renders paper background, ink text, all three families visibly distinct.
- [x] Directory skeleton matches ARCHITECTURE §2.
- [x] No commit made (unless explicitly requested). **No commit made in this remediation pass either.**

## Required verification commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
```

## Manual browser checks

- `pnpm dev`: `/` shows the token-proof page; background `#f1efe8`; fonts correct (inspect computed styles).
- No console errors or 404s in the network tab (fonts self-hosted).
- Widths 375/768/1024/1440px: no horizontal overflow.

## Accessibility checks

- Tab reaches nothing unexpected (page has no interactive elements yet); `:focus-visible` style demonstrably present (temporarily focus the `html` link if none — otherwise verify via the style sheet).
- Page has one `h1`; `lang="en"` on `<html>`.

## Content verification checks

- Token-proof page contains only the word mark and font samples — no claims, no copy from the seed, no placeholder facts.

## Rollback notes

Pre-code state is the docs-only tree. Rollback = `git clean -fd && git checkout .` back to the initial docs commit (safe because nothing else exists). Report before doing so.

## Completion report template

```markdown
### TASK-001 report — <date>
- Files created/changed: <list>
- Package versions installed: <next/react/ts/tailwind/... + pinned next-mdx-remote or fallback note>
- D-001 spike outcome: <pass with evidence per check | fallback @next/mdx adopted + reason>
- Font licensing check: <result + source>
- Font compile/variant verification (D-003): <result>
- Commands run and results: <each command, pass/fail>
- Manual checks: <summary>
- QA_CHECKLIST sections run: 1, 3 (partial), 5, 6, 7 — <results>
- Deviations from task: <none | list>
- Unresolved issues: <none | list>
- Git status after: <clean/dirty + file list>
STOPPED. Awaiting review for Phase 1.
```
