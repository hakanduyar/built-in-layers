# DECISIONS — Built in Layers

Format per entry: Decision / Reason / Rejected alternatives / Trade-off / Approval.
Statuses: `PROPOSED` (needs Hakan), `PROVISIONAL` (approved direction pending a mandatory verification step), `ACCEPTED` (approved), `REJECTED` (superseded — the entry records the replacement), `RECORDED` (no user approval required), `CONTRACT` (fixed by CLAUDE.md, recorded for traceability).

New entries are appended by tasks **only when a real decision was made**.

Revision log: 2026-07-17 — planning phase conditionally approved by Hakan; statuses and revisions below reflect that approval batch.

---

## D-001 — MDX pipeline: `next-mdx-remote/rsc` + `gray-matter`

- **Status:** ACCEPTED FOR MVP — next-mdx-remote/rsc 6.0.0 (2026-07-29, see approval addendum below)
- **Decision:** `next-mdx-remote@6.0.0` (`/rsc` entry) compiles case-study MDX inside Server Components; frontmatter parsed with `gray-matter@4.0.3`; validated with Zod. This is the pipeline TASK-001 verified and TASK-004 will build on **unless** the mandatory comparison below produces evidence and approval to migrate first.
- **Why this is provisional, not accepted, despite a passing spike:** the spike proves `next-mdx-remote@6.0.0` is technically compatible with our stack — it does not by itself justify committing to an archived-upstream dependency as the permanent MVP pipeline. That is a judgment call requiring an explicit, evidence-based comparison against the actively maintained alternative, made once (before TASK-004 starts building real content on top of whichever pipeline is chosen), not silently assumed from a passing technical check.
- **Mandatory before TASK-004 starts:** a focused, written comparison of `next-mdx-remote@6.0.0` against the official `@next/mdx` local-content pipeline, covering at minimum: maintenance status, RSC/Server Component compatibility, frontmatter handling, restricted-component-map feasibility, and migration cost if deferred further. The comparison is evidence, not a foregone conclusion in either direction.
- **Binding process rule:** the current pipeline (`next-mdx-remote`) **must not be replaced automatically** on the basis of the archived-repo finding alone. Any migration to `@next/mdx` or another pipeline requires (a) the comparison evidence above and (b) Hakan's explicit approval. Until both exist, `next-mdx-remote@6.0.0` remains the implemented pipeline and TASK-004 may proceed on it if the comparison concludes in its favor or is explicitly deferred by Hakan.
- **Not changed in this task:** this remediation pass only updates documentation/status; the MDX implementation, dependency versions, and code were not touched.
- **Spike evidence (TASK-001, 2026-07-27):** a temporary route (`app/spike-mdx/[slug]/page.tsx`, `content/spike/sample.mdx`, `lib/spike/*`) proved all eight required checks against the real installed toolchain (Next.js 16.2.12, React 19.2.4, Turbopack):
  1. one local, repository-owned MDX file compiled;
  2. frontmatter parsed via `gray-matter`;
  3. frontmatter validated via a Zod schema (`spikeFrontmatterSchema.parse`, which throws on invalid input — did not throw);
  4. rendered inside an async Server Component (`compileMDX` called directly in the route, no client boundary);
  5. a custom component (`<SpikeNote>`) rendered correctly through a restricted component map — confirmed in the prerendered HTML as `<aside data-testid="spike-note">...</aside>`;
  6. `generateStaticParams` produced a real param set, confirmed in `pnpm build` output: `● /spike-mdx/[slug] └ /spike-mdx/sample`;
  7. `pnpm build` completed with zero errors;
  8. the route appeared under the build's `(SSG) prerendered as static HTML` legend, confirming Vercel-compatible build-time pre-rendering.
  Markdown/MDX formatting (`**bold**`, inline code) compiled correctly with `blockJS: true, blockDangerousJS: true` explicitly set — our content model needs no `{jsExpression}` interpolation, so this is the ideal, most restrictive posture. Spike artifacts were removed after evidence was recorded, and the full gate suite (typecheck/lint/format/test/build) was re-run clean on the resulting tree.
- **Flagged risk (new information, not a spike failure):** the upstream GitHub repository `hashicorp/next-mdx-remote` is **archived** (`archived: true` via GitHub API; last push 2026-03-26) — no further commits, issue triage, or security patches will come from the maintainer. It is not marked deprecated on npm and 6.0.0 (published 2026-02-12) is recent, but this is a real maintenance-risk fact that did not exist when this entry was first drafted as PROVISIONAL. It does not block TASK-001 (the spike's job was to prove technical compatibility, which it did), but it should factor into whether this pipeline is still the right long-term choice — flagging for Hakan's awareness rather than silently proceeding as if D-001's original "preferred candidate" framing still fully holds.
- **Security constraints (binding, in effect):**
  - Only repository-owned, trusted local MDX is compiled (enforced by the loader design — no remote or user-submitted content path exists).
  - `compileMDX`'s underlying `serialize()` step is called with `{ blockJS: true, blockDangerousJS: true }` explicitly, even though `blockJS: true` is already the 6.0.0 default — made explicit in code so the security posture is self-documenting rather than relying on an unstated default.
  - `next.config.ts` adds `transpilePackages: ["next-mdx-remote"]`, per the library's own README guidance for Turbopack compatibility (confirmed relevant: `next build` uses Turbopack by default in this Next.js version).
- **Rejected:** Contentlayer (effectively unmaintained), Velite (extra abstraction layer for 3–6 content files), hand-rolled `@mdx-js/mdx` (more code to own for no gain). `@next/mdx` remains the documented fallback, not needed since the spike passed.
- **Trade-off:** Two small extra runtime deps; MDX not type-checked at authoring time (mitigated by Zod gates + restricted component map); the archived-upstream risk above is now a standing trade-off to monitor, not a one-time cost.
- **Approval:** The 2026-07-17 provisional grant was **not** upgraded to full acceptance by the passing spike alone — the spike cleared the technical-compatibility gate only; the archived-upstream comparison (addendum below) was the remaining gate. That comparison is now complete and **explicitly approved by Hakan (2026-07-29)**: see the final approval addendum below for the binding conditions attached to this acceptance.

### D-001 addendum — mandatory `next-mdx-remote` vs `@next/mdx` comparison (2026-07-29)

**Status of this addendum: comparison complete, recommendation approved.** Per D-001's binding process rule, this record was evidence for Hakan's decision, not a self-approved migration — see the final approval block at the end of this addendum for the explicit approval and its binding conditions.

**Method:** two isolated, fully-removed spikes were built against the real installed toolchain (Next.js 16.2.12, React 19.2.4, Turbopack) — `app/spike-d001-a/[slug]` for Candidate A (no new dependency; already installed) and `app/spike-d001-b/[slug]` for Candidate B (`@next/mdx@16.2.12`, `@mdx-js/loader@3.1.1`, `@mdx-js/react@3.1.1`, `remark-frontmatter@5.0.0`, `remark-mdx-frontmatter@5.2.0`, `@types/mdx@2.0.14` — all installed temporarily and fully removed afterward via `git restore` of `package.json`/`pnpm-lock.yaml`/`next.config.ts` plus `pnpm install --frozen-lockfile`). Each spike used identical fixture content: a published full-depth project (`index/surface/flow/system.mdx`, a custom `<SpikeNote>` component, bold/inline-code markdown), a draft project carrying a `[CONTENT REQUIRED: ...]` marker, and a published-preview project deliberately containing the same marker (to test publication-gate feasibility). Both were verified with a real `pnpm build` (not typecheck-only), raw prerendered-HTML inspection, and standalone filesystem/gate probes. Both spikes were completely removed after evidence was recorded; the production tree was verified byte-identical to `f4f7a69` afterward (`git status --short` empty, `git diff --stat` empty).

**Verified facts / implementation evidence:**

| # | Criterion | Candidate A — `next-mdx-remote/rsc` | Candidate B — `@next/mdx` |
|---|---|---|---|
| 1 | Next.js 16 App Router compatibility | Confirmed — real build, zero errors | Confirmed — real build, zero errors |
| 2 | Server Component rendering | Confirmed — `compileMDX()` called directly in an async Server Component | Confirmed — compiled `.mdx` imported as a module in an async Server Component |
| 3 | Build-time prerendering | Confirmed — route listed under `(SSG) prerendered as static HTML` | Confirmed — same build-output legend |
| 4 | `generateStaticParams` support | Confirmed — produced exactly the 2 published fixture slugs, draft excluded | Confirmed — same result, same exclusion |
| 5 | Typed frontmatter/metadata support | `gray-matter` parses frontmatter from raw file text, fully decoupled from MDX compilation (matches ARCHITECTURE §5: listing pages read frontmatter without compiling the body) | Two viable paths found: (a) `gray-matter` on raw text, identical to A; (b) the "native" path — `remark-frontmatter` + `remark-mdx-frontmatter` re-export a `frontmatter` object from the compiled module, but only obtainable by dynamically `import()`-ing (i.e. compiling) each file, coupling frontmatter reads to full compilation |
| 6 | Zod validation | Confirmed — schema throws on invalid enum value | Identical — Zod validates the plain object regardless of source; pipeline-independent |
| 7 | Custom MDX components | Confirmed — `<SpikeNote>` rendered via `compileMDX({components})`, verified in raw HTML | Confirmed — `<SpikeNote>` rendered via root `mdx-components.tsx`'s `useMDXComponents()`, verified in raw HTML |
| 8 | Separate `index/surface/flow/system.mdx` files | Confirmed — all four compile independently; layer files correctly skipped for `depth: "preview"` | Confirmed — identical result |
| 9 | Filesystem enumeration | `node:fs.readdirSync` — compiler-independent | Identical code, identical result — also compiler-independent |
| 10 | Draft/preview/published states | Trivial — `gray-matter` reads `status` without compiling | Requires dynamically importing (compiling) each candidate file to read `status` via path (b) above, unless falling back to path (a) |
| 11 | `verificationStatus` handling | Confirmed — arbitrary Zod-validated field, no pipeline dependency | Identical |
| 12 | Build-gate compatibility (marker scan, layer-meaning) | Confirmed — a raw-text `[CONTENT REQUIRED` scan correctly allowed draft+marker, allowed published+no-marker, and flagged published+marker | Identical result — gates read raw file text via `node:fs`, entirely independent of which library compiles the MDX body. **This criterion is a wash between candidates.** |
| 13 | Trusted-local-content security model | Executes compiled MDX via `@mdx-js/mdx`'s `run()` — confirmed by reading the installed package source: `new AsyncFunction(String(code))(options)`, doc-commented `"☢️ Danger: this evals JavaScript"` — mitigated by explicit `blockJS`/`blockDangerousJS` | Confirmed by reading `@mdx-js/loader`'s installed source: the loader compiles to static module source text (`outputFormat: "program"`) fed straight into the bundler, like any `.tsx` file — **no runtime `eval`/`Function` step exists**, so there is no comparable flag to set |
| 14 | JavaScript-expression control | Explicit, documented, actively used (`blockJS: true, blockDangerousJS: true`) | No equivalent mechanism — `.mdx` files compile with the same trust level as hand-written source, relying entirely on code review rather than a library guardrail |
| 15 | Maintenance status | Upstream `hashicorp/next-mdx-remote` repository is archived (confirmed via GitHub API, TASK-001); not deprecated on npm; 6.0.0 recent | `@next/mdx` ships from the `vercel/next.js` monorepo, version-locked to each Next.js release — confirmed via npm registry: `@next/mdx@16.2.12` published 2026-07-25 (4 days before this comparison), package `modified` timestamp 2026-07-28 |
| 16 | Dependency and migration cost | Zero — already installed, already proven in TASK-001 | +5 runtime/dev packages; `next.config.ts` rewrite (`pageExtensions`, `createMDX` wrapper); new root `mdx-components.tsx`; a genuine Turbopack-specific bug hit live in this spike (see below); an ambient `*.mdx` module type declaration or `@types/mdx` |
| 17 | Testing complexity | `compileMDX()` is a plain async function, callable against a string in any test environment with no extra tooling | Dynamic per-slug `import()` of `.mdx` modules is harder to unit-test in isolation; Vitest has no `.mdx` transform in the current dependency budget |
| 18 | Long-term maintainability | Small, self-contained, functionally proven; standing archived-upstream risk (no future patches from the maintainer) to keep monitoring | Actively maintained in lockstep with Next.js; more moving parts for an equivalent result in this project's actual use case |
| 19 | Vercel-compatible prerendering | Confirmed — `(SSG) prerendered as static HTML` | Confirmed — identical |
| 20 | Compatibility with CONTENT_MODEL/ARCHITECTURE | No changes needed to CONTENT_MODEL.md or the `content/work/<slug>/*.mdx` layout; `compileMDX(string)` is a direct, zero-rework fit for ARCHITECTURE §5's `getProjectBySlug(slug)` loader design (reads files at call time, wrapped in `cache()`) | No CONTENT_MODEL/layout changes needed either, but the static-import-shaped tool must be bent (dynamic `import()` with a template-literal path) to fit the dynamic, filesystem-driven loader ARCHITECTURE §5 specifies |

**A real, previously-undocumented finding from this spike:** passing `remarkPlugins` as live function references (`[remarkFrontmatter, remarkMdxFrontmatter]`) to `@next/mdx`'s `createMDX()` fails under Turbopack with `"...does not have serializable options"` — Turbopack requires plugin configuration to cross its Rust/JS boundary as serializable data. The fix is package-name strings (`["remark-frontmatter", "remark-mdx-frontmatter"]`) instead of imported function references. This is a real, current constraint of `@next/mdx` on Turbopack (this project's default bundler, confirmed already in the TASK-001 D-001 spike notes), not a hypothetical.

**Strengths (A):** already installed and proven; zero migration cost; simplest, most decoupled frontmatter-only reads; a direct architectural fit for the dynamic filesystem-driven loader design; explicit, self-documenting security posture.
**Weaknesses (A):** standing archived-upstream maintenance risk; runtime `eval`/`Function`-based execution model (mitigated, not eliminated, by `blockJS`/`blockDangerousJS`).
**Strengths (B):** actively maintained by the Next.js team itself, version-locked to each release; no runtime code-generation step by construction; official, long-term-supported path.
**Weaknesses (B):** 5+ new packages for an equivalent result; non-trivial Turbopack-specific configuration cost (discovered live); a worse fit for the dynamic loader architecture (native frontmatter access couples to full compilation; static-import-shaped tool bent to a dynamic use case); harder to unit-test in isolation with the current tooling.

**Rejected alternatives (reaffirmed from the original D-001 entry):** Contentlayer (unmaintained), Velite (unnecessary abstraction for 3–6 content files), hand-rolled `@mdx-js/mdx` (more code to own for no gain — and, per this spike, would still need the same runtime-`run()`-vs-bundler-loader trade-off `next-mdx-remote`/`@next/mdx` already make on our behalf).

**Final recommendation: 1. KEEP `next-mdx-remote/rsc` for MVP.**

**Reasons:** every functional capability required by CONTENT_MODEL and ARCHITECTURE (prerendering, `generateStaticParams`, typed frontmatter, Zod validation, custom components, multi-file layers, filesystem enumeration, draft exclusion, publication-gate compatibility) is proven working identically on both candidates. The only substantiated risk on Candidate A is maintenance continuity (archived upstream), not a functional or security defect — the library works correctly today with an explicit, audited, defense-in-depth security posture. Migrating now, before any real TASK-004 content exists, would trade that unrealized risk for measured, immediate integration costs found in this very spike: 5+ new dependencies, a genuine Turbopack-compatibility bug, a less direct fit for this project's loader architecture, and weaker unit-testability — without removing any capability gap, because there isn't one. The archived-upstream risk remains real and should keep being monitored (unchanged from the original D-001 entry); it does not, on the evidence gathered, justify migrating pre-emptively.

**Approval requirement:** per D-001's binding process rule, this recommendation did **not** self-approve. `next-mdx-remote@6.0.0` remained the implemented pipeline pending Hakan's explicit approval.

### D-001 final approval (2026-07-29)

**Hakan explicitly approved the KEEP recommendation.** Final decision: **KEEP `next-mdx-remote/rsc` FOR MVP.**

Binding conditions attached to this approval — all already true of the current implementation and to be preserved without exception through the MVP:

- Pin `next-mdx-remote` at exactly `6.0.0`.
- Compile only trusted, repository-owned local MDX — no user-submitted or remotely fetched MDX is ever compiled.
- Keep `blockJS: true` explicit in `compileMDX`'s options (not left to the unstated default).
- Keep `blockDangerousJS: true` explicit in `compileMDX`'s options.
- Preserve `gray-matter` frontmatter parsing and Zod validation as the schema gate (CONTENT_MODEL §1–2, ARCHITECTURE §5–6).
- Preserve the published-content build gates (marker scan, layer-meaning gate — ARCHITECTURE §7, CONTENT_MODEL §6–7) when TASK-004 implements them.

**The archived-upstream maintenance risk is not dismissed by this approval.** It is recorded as an **accepted and monitored MVP trade-off**: the `hashicorp/next-mdx-remote` repository will receive no further commits, issue triage, or security patches from its maintainer for as long as this pipeline is in use. This is a standing, ongoing risk, not a one-time cost cleared by this decision.

**D-001 must be re-evaluated (not silently carried forward) before any of the following:**
- a major Next.js or MDX pipeline upgrade;
- a relevant security advisory affecting `next-mdx-remote`, `@mdx-js/mdx`, or their transitive dependencies;
- a production architecture change affecting content rendering;
- a demonstrated compatibility failure with the pinned version.

**Scope of this approval:** documentation only. No application code, dependencies, or the MDX implementation were touched by this decision — `next-mdx-remote@6.0.0` was already the installed, working pipeline throughout the comparison and remains unchanged. TASK-004 may now proceed on this pipeline once its own task approval is granted.

## D-002 — Tailwind CSS v4 with CSS-first `@theme` tokens

- **Status:** ACCEPTED (2026-07-17)
- **Decision:** Use Tailwind v4; define all design tokens as CSS custom properties in `styles/globals.css` via `@theme`, so Tailwind utilities and raw CSS share one token source. Token definitions stay centralized — components never introduce raw values.
- **Reason:** Satisfies the contract "Tailwind + CSS custom properties" with a single source of truth; v4 is the current stable major.
- **Rejected:** Tailwind v3 + `tailwind.config.ts` (tokens duplicated between JS config and CSS variables), CSS Modules only (loses utility speed), vanilla-extract (unapproved dependency).
- **Trade-off:** v4's CSS-first config is newer; less community copy-paste. Acceptable for a greenfield repo.
- **Approval:** Granted 2026-07-17.

## D-003 — Fonts via `next/font/google`: Archivo, Newsreader, IBM Plex Mono

- **Status:** ACCEPTED (2026-07-27) — TASK-001 compile/variant verification and licensing check both passed
- **Decision:** Load the three spec-named families with `next/font/google` (self-hosted at build, zero runtime requests to Google), subsets `latin` + `latin-ext`, `display: swap`. No additional font family may be added without approval.
- **Licensing verification (2026-07-27):** confirmed SIL Open Font License 1.1 for all three, fetched directly from the canonical `google/fonts` GitHub repository (the authoritative source `next/font/google` itself bundles from): `ofl/archivo/OFL.txt`, `ofl/newsreader/OFL.txt`, and IBM's own `IBM/plex` `LICENSE.txt`.
- **Compile/variant verification (2026-07-27):** a real `pnpm build` (not just typecheck) compiled all three without error on the first attempt:
  - `Archivo({ subsets: ["latin","latin-ext"], variable: "--font-display", display: "swap" })` — no `weight` needed (variable font).
  - `Newsreader({ subsets: ["latin","latin-ext"], style: ["italic"], variable: "--font-serif", display: "swap" })` — the italic style/axis compiled successfully.
  - `IBM_Plex_Mono({ subsets: ["latin","latin-ext"], weight: ["400","500"], variable: "--font-mono", display: "swap" })` — required an explicit `weight` array (IBM Plex Mono is a static, non-variable family in `next/font/google`; the build would have errored without it).
  The prerendered HTML was inspected directly and confirmed: 8 self-hosted `.woff2` files preloaded, `<html>` carrying all three `*__variable` classes, and the generated CSS correctly wiring `--font-display`/`--font-serif`/`--font-mono` through `@theme inline` into `font-display`/`font-serif`/`font-mono` utility classes.
- **Reason:** `next/font` gives preloading, no CLS from FOUT sizing, and no external requests.
- **Rejected:** Google Fonts CDN `<link>` (runtime third-party request, GDPR noise, layout shift risk), manual self-hosting (maintenance without benefit), any fourth family (forbidden without approval).
- **Trade-off:** Font subsetting is limited to `next/font` options; fine for three families.
- **Approval:** Provisional grant from 2026-07-17 is now confirmed by the passing TASK-001 verification (2026-07-27).

## D-004 — Accessible color tokens: keep `--signal`; add `--signal-ui` and `--signal-text` (+ `--ink-muted`)

- **Status:** ACCEPTED WITH CHANGES (2026-07-17)
- **Decision:** `--signal: #ff4f1f` stays as approved. Separate accessible tokens are added:
  - `--signal-text` (candidate `#b8380e`, ≈5.1:1 on paper) — the accent wherever it appears as normal text.
  - `--signal-ui` (candidate `#e04413`, ≈3.6:1 on paper) — the accent for meaningful control boundaries and indicators.
  - `--ink-muted` (candidate `#504e48`, ≈7.1:1 on paper) — secondary text.
  Binding requirements: normal text meets at least **4.5:1**; meaningful control boundaries and indicators meet at least **3:1**; color is **never the only indication** of selection, focus, status, or interaction; raw `--signal` may remain decorative wherever it does not carry meaning. Exact hex values remain open to visual tuning as long as the ratios hold.
- **Reason:** `--signal` measures ≈2.9:1 on `--paper` — it fails WCAG AA for text (4.5:1) and for UI components (3:1). The palette-change rule allows changes with a documented reason; the reason is WCAG 2.x compliance, which PROJECT_SPEC's accessibility baseline requires.
- **Rejected:** Using raw `--signal` for links/labels or control indicators (fails contrast), lightening the paper (changes approved character), opacity tricks (unpredictable contrast).
- **Trade-off:** The accent renders slightly darker in text and controls than in decoration; continuity is kept because all three hues share the orange family.
- **Approval:** Granted with changes 2026-07-17. `DESIGN_SYSTEM.md` and `QA_CHECKLIST.md` updated accordingly.
- **Precise verification (TASK-001, 2026-07-27):** computed exactly (WCAG relative-luminance formula) rather than approximated — `ink-muted` on `paper` 7.23:1, `signal-text` on `paper` 5.06:1, `signal-ui` on `paper` 3.65:1, `signal` on `paper` 2.86:1 (confirms it fails both the 4.5:1 and 3:1 thresholds, as intended), `ink` on `signal` 5.51:1. All approved candidate hex values hold their required ratios exactly as specified — no tuning needed. Tokens implemented verbatim in `styles/globals.css`.

## D-005 — Navigation: desktop inline nav; mobile MENU trigger with accessible panel

- **Status:** REJECTED as originally proposed (2026-07-17) — replaced by the following approved decision
- **Original proposal (rejected):** all five nav links inline at every width, wrapping to a second row on mobile; no menu toggle; entire application fixed at exactly two Client Component boundaries.
- **Approved replacement:**
  - Inline navigation on desktop.
  - A **visible MENU trigger on mobile** opening an accessible full-screen or panel navigation.
  - Keyboard operation throughout; **Escape closes** the panel; **focus is managed** (moved into the panel on open, returned to the trigger on close); visible focus states.
  - A small additional Client Component is allowed for this (`MobileNav`, introduced in TASK-002).
  - The rule that the application may contain **exactly two Client Component boundaries is removed.** Client Components must remain minimal and purpose-driven, but their exact count is not fixed before implementation. Each new client boundary is recorded here with its purpose.
- **Reason (for replacement):** A wrapping inline nav on mobile trades a known, accessible disclosure pattern for layout fragility; the approved pattern is the standard accessible solution and its cost is one small, testable Client Component.
- **Trade-off:** The shell now ships a small amount of client JavaScript; without JavaScript the header must still expose all navigation links (progressive enhancement — see ARCHITECTURE §3).
- **Approval:** Replacement approved 2026-07-17.

## D-006 — Layer explorer: ARIA Tabs (manual activation) with stacked no-JS fallback

- **Status:** ACCEPTED WITH CHANGES (2026-07-17)
- **Decision:** Surface/Flow/System may use the WAI-ARIA Tabs pattern **as a progressive enhancement** (client component, TASK-007), with **manual activation**:
  - Left and Right Arrow move tab **focus** (they do not activate).
  - Home and End move focus to the first and last tab.
  - Enter and Space **activate** the focused tab.
  - `tablist`, `tab`, and `tabpanel` roles and relationships must be correct.
  Without JavaScript, all three layer sections remain **visible, ordered, labelled, and readable**. The page must never depend on JavaScript to expose project content. Until TASK-007 the stacked form IS the shipped UI; afterwards it remains the no-JS rendering. Content-per-layer minimums are enforced by the CONTENT_MODEL §7 gate.
- **Reason:** Tabs are the correct semantics for one-of-three content panels; manual activation avoids surprise content changes while arrowing; the stacked fallback guarantees "understandable with animation disabled" and no-JS integrity.
- **Rejected:** Automatic activation on arrow focus (content swaps under the user while navigating), accordion (weaker mapping to the three-layer metaphor), scroll-linked layer switching (forbidden), CSS-only radio-hack tabs (poor a11y).
- **Trade-off:** Progressive enhancement costs a small duplication in rendering logic (stacked vs tabbed), contained in one component.
- **Approval:** Granted with changes 2026-07-17.

## D-007 — Open Graph images: static in MVP

- **Status:** ACCEPTED (2026-07-17)
- **Decision:** One global static fallback OG image (asset from Hakan or approved design produced in TASK-008). Featured projects may receive their own **static** OG image when an approved asset exists. No runtime OG-image generation in the MVP.
- **Reason:** Dynamic OG generation adds an edge-runtime surface and font-loading complexity for ~7 pages; a static image is deterministic and reviewable.
- **Rejected:** `next/og` `ImageResponse` per route (complexity now, value later), no OG image (poor link sharing).
- **Trade-off:** Case-study links share the default image until per-project assets are approved.
- **Approval:** Granted 2026-07-17.

## D-008 — Notes are typed external-link data in MVP (`data/notes.ts`)

- **Status:** ACCEPTED (2026-07-17)
- **Decision:** MVP notes are a typed, Zod-validated array of external Medium links. `content/notes/` stays empty, reserved for a future local-MDX phase (proposed TASK-013).
- **Reason:** Spec says "external Medium links in MVP"; MDX infrastructure for zero local articles is dead weight; a typed array keeps one source of truth.
- **Rejected:** MDX stubs per note (fake content files), fetching Medium RSS (runtime dependency, unverifiable content).
- **Trade-off:** A future migration step to MDX; trivially contained.
- **Approval:** Granted 2026-07-17.

## D-009 — Honest pending copy for Professional / Lab / Notes

- **Status:** ACCEPTED (2026-07-17) — with exact approved wording for the professional area
- **Decision:** Pending areas use the approved honest texts in CONTENT_MODEL §8; `[CONTENT REQUIRED]` markers never render in production (build gate). The professional pending copy is **exactly**:

  > “Selected professional work is being prepared for publication. Only approved, non-confidential details will be shown.”

  No concrete client, project, result, or technical claims may be added until Hakan approves them.
- **Reason:** Spec demands honest placeholders; raw internal markers on a public page would read as broken, while vague teaser copy would be dishonest.
- **Rejected:** Publishing internal markers (unprofessional), hiding the sections entirely (breaks approved IA), teaser copy implying hidden achievements (violates truthfulness rules).
- **Trade-off:** Public admission of incompleteness — consistent with the brand's honesty principle.
- **Approval:** Granted 2026-07-17 with the exact wording above.

## D-010 — Playwright: Chromium + WebKit in MVP

- **Status:** ACCEPTED WITH CHANGES (2026-07-17)
- **Decision:** The MVP Playwright smoke suite runs on **Chromium and WebKit**. Firefox remains a later or manual quality check (QA_CHECKLIST / TASK-008 manual smoke).
- **Reason:** WebKit coverage catches the Safari-specific issues a Chromium-only suite misses, at acceptable runtime cost; the suite remains a smoke layer, not a compatibility matrix.
- **Rejected:** Chromium-only (original proposal — insufficient engine coverage), full three-browser matrix in CI (cost > value in MVP).
- **Trade-off:** Slightly longer e2e runs; Firefox regressions caught manually until post-MVP.
- **Approval:** Granted with changes 2026-07-17.

## D-011 — Transitional homepage data module in TASK-003

- **Status:** REJECTED (2026-07-17)
- **Original proposal (rejected):** feed homepage sections from a temporary typed module (`data/home-temp.ts`) created in TASK-003 and deleted in TASK-004.
- **Approved replacement:** no disposable data layer is created. The execution order changes so the content system precedes the homepage: **TASK-001 → TASK-002 → TASK-004 → TASK-003 → TASK-005 → TASK-006 → TASK-007 → TASK-008.** TASK-003 depends on TASK-004, and the homepage consumes the real typed content system from its first implementation.
- **Reason (for replacement):** creating project data only to delete it one phase later is waste and a truthfulness risk (two sources of truth during the window). Building loaders first removes the window entirely.
- **Trade-off:** The visual approval gate (homepage) moves one phase later; content-system review happens against `/work` and the case-study template instead of the homepage.
- **Approval:** Rejection and reorder approved 2026-07-17. ROADMAP, PROGRESS, TASK-003, TASK-004 updated.

## D-012 — Pre-rendered routes; `dynamicParams = false`; published-content gates fail the build

- **Status:** RECORDED (revised 2026-07-17 per approval items on rendering terminology and build-gate honesty)
- **Decision:** **All publishable routes are pre-rendered at build time.** Project routes use `generateStaticParams`; unknown work slugs 404 via `dynamicParams = false`. `output: "export"` is **not** configured in the MVP unless a later deployment decision explicitly requires it. Content gates fail `pnpm build` **only for content with `status: "published"`** — draft and preview content never blocks a production build. No `error.tsx` boundaries in MVP.
- **Reason:** No request-time data exists; failing loudly at build for published content is a strong quality gate. Gates reduce risk; they do not replace human review (see CONTENT_MODEL).
- **Rejected:** ISR/dynamic rendering (nothing to revalidate), tolerant parsing of published content (unverified content could slip through), gating drafts (would block iteration).
- **Trade-off:** Published-content mistakes block deploys — intended behavior.
- **Approval:** Not required (implements contract principles); recorded as revised.

## D-013 — No CI pipeline in MVP

- **Status:** RECORDED (unchanged)
- **Decision:** Quality gates run locally per task via pnpm scripts. GitHub Actions proposed post-MVP (TASK-012).
- **Reason:** Single-developer, gated-phase workflow already forces the checks each task; CI setup is real scope and was not in the approved task list.
- **Rejected:** Adding CI now (scope creep against the fixed task list).
- **Trade-off:** Gate honesty depends on the per-task reports until CI exists.
- **Approval:** Not required now; TASK-012 needs approval later.

## D-014 — `@axe-core/playwright` as the only added test dependency, in TASK-008

- **Status:** ACCEPTED (covered by the approved dependency budget, 2026-07-17)
- **Decision:** Add the axe integration dev-dependency during the a11y task for automated scans of all routes.
- **Reason:** Manual audits miss mechanical issues (contrast regressions, missing names); axe is the standard, dev-only, and confined to tests.
- **Rejected:** Lighthouse-only (coarser a11y signal), eslint-plugin-jsx-a11y as sole net (static analysis misses rendered output).
- **Trade-off:** One more dev dependency, declared in the budget table.
- **Approval:** Covered by approval of ARCHITECTURE §14.

## D-015 — Translation readiness without i18n machinery

- **Status:** RECORDED (unchanged)
- **Decision:** All chrome/homepage strings centralized in `data/copy.ts`; content directory structured to accept a locale level later; routes unprefixed in MVP; no i18n library, no locale middleware.
- **Reason:** Contract forbids an i18n library before the Turkish phase; centralizing strings is the cheapest genuine readiness.
- **Rejected:** next-intl/format.js now (forbidden), `/en` prefix now (URL churn later without benefit).
- **Trade-off:** The Turkish phase will still need a routing decision (TASK-011 proposal).
- **Approval:** Not required (implements contract); recorded.

## D-016 — Homepage featured order while professional content is pending

- **Status:** ACCEPTED (2026-07-17)
- **Decision:** Initial homepage "Selected systems" order:
  1. **Kıvılcım**
  2. **DropSpot**
  3. **JointLedger**
  4. **Professional Systems preview**
  Professional Systems may move to first place **only after at least one approved and substantive professional case study exists** (PROJECT_SPEC §8's original priority then applies).
- **Reason:** PROJECT_SPEC §8 puts Professional Systems first, but CONTENT_INVENTORY marks it `REQUIRES USER` — leading the portfolio with a placeholder would make the first impression an apology. This decision supersedes the §8 initial order until the condition above is met.
- **Rejected:** Placeholder in slot 1 (weak first impression), omitting professional entirely (breaks approved IA).
- **Trade-off:** Temporary deviation from the spec's priority order, self-correcting once content arrives.
- **Approval:** Granted 2026-07-17 with the four-entry order above.

## D-017 — Kıvılcım naming and route slug

- **Status:** ACCEPTED (2026-07-17)
- **Decision:** The primary display name is **Kıvılcım**. On its first English-language introduction it may be written as **Kıvılcım — “Spark”**. “Kıvılcım / Spark” is **not** used as a permanent brand lockup. Route slug: `/work/kivilcim`.
- **Reason:** One primary name keeps the brand coherent; the first-introduction gloss makes the Turkish word accessible to English readers without creating a dual-name lockup.
- **Rejected:** “Kıvılcım / Spark” everywhere (permanent dual lockup), “Spark” alone (loses the distinctive name; collides with common product names).
- **Trade-off:** English readers meet an unfamiliar word first — mitigated by the approved first-introduction gloss.
- **Approval:** Granted 2026-07-17.

## D-018 — `phase` and `aiAssisted` are schema-optional, not unconditionally required

- **Status:** RECORDED (2026-07-29, TASK-004 remediation)
- **Decision:** In `lib/content/schemas.ts`, `ProjectFrontmatter.phase` and `.aiAssisted` are `.optional()`. CONTENT_MODEL §2's inline type shows both as unconditionally required (no `?`), but no approved document (PROJECT_SPEC, CONTENT_INVENTORY, DECISIONS) states a verified `phase` or `aiAssisted` value for Kıvılcım, DropSpot, or Professional Systems. `aiDisclosure` remains conditionally required whenever `aiAssisted === true`.
- **Reason:** A strict-review pass on TASK-004 found `aiAssisted: false` and `phase: "active-development"` asserted on published content with no evidentiary source — an unverified positive claim, not a neutral default (CLAUDE.md §2: never invent facts; §11: AI-assisted work must be disclosed, which requires the field to mean something when set). The only alternatives were (a) invent a value to satisfy an unconditionally-required field, (b) add an "unknown" enum member with no prior approval, or (c) make the field genuinely optional and omit it where unsupported. (a) and (b) were rejected outright by the remediation instruction; (c) is the smallest change that keeps the schema honest.
- **Rejected:** Inventing a value (violates CLAUDE.md §2); adding an `"unknown"` / `"unspecified"` enum member (an unapproved schema addition in its own right, not less speculative than the fields it would paper over).
- **Trade-off:** `ProjectFrontmatter.phase`/`.aiAssisted` are no longer guaranteed present at the type level; any future UI surfacing them must handle `undefined`. JointLedger's verified `phase: "active-development"` (PROJECT_SPEC §12, direct quote) is unaffected — the field stays optional in the schema but is still populated wherever a real source exists.
- **Approval:** Directed by the TASK-004 remediation instruction (2026-07-29); not independently proposed.

## D-019 — Provisional project asset policy

- **Status:** ACCEPTED (2026-08-05)
- **Decision:** Real screenshots, photographs, and video remain the preferred and default project imagery, and their absence must not permanently block completing or publishing a case study. Until real media exists, a project may instead use **repository-verified illustrative diagrams and editorial concept visuals**, subject to all of the following, binding without exception:
  - Every provisional asset must be **visibly labelled** as illustrative or diagrammatic — never presented, captioned, or styled closely enough to be mistaken for a real screenshot, real photograph, or real product footage.
  - A provisional diagram may visualize **only** repository-verified architecture, states, flows, data relationships, or product areas — never an invented UI screen, control, metric, user, client, outcome, or feature.
  - Alt text and captions must state plainly that the asset is an illustration or diagram, not a captured screenshot, and must not imply the illustrated facts are anything other than what the repository audit actually verified.
  - Real assets replace provisional ones later as a pure asset swap — the content model, schema, and gates do not change when that happens.
  - This decision changes what counts as an acceptable project *asset*. It does not relax any other truthfulness rule in CLAUDE.md, PROJECT_SPEC, or CONTENT_MODEL: no fact, claim, metric, client, user, outcome, or production status may be invented, in an image or otherwise.
- **Reason:** The MVP's "real screenshots only" asset rule (ARCHITECTURE §8, DESIGN_SYSTEM §9) was written before any full-depth case study existed. Kıvılcım's text and technical claims are now repository-audited and gate-ready, but real product screenshots genuinely do not exist yet — holding the entire case study back solely for missing photography, when accurate, honestly-labelled diagrams can responsibly stand in, is a worse outcome than publishing verified text with clearly-marked illustrative visuals. Hakan made this trade-off explicitly, as a new decision, not as a reinterpretation of the original rule.
- **Rejected:** Continuing to block publication indefinitely on missing photography alone (the prior standing rule); AI-generated fake UI screenshots or stock imagery standing in for real screenshots (both explicitly forbidden — they would misrepresent unverified detail as real); leaving the generic "PLACEHOLDER — ASSET PENDING" panel as the only available option (honest, but communicates nothing — a repository-verified diagram is strictly more informative at the same honesty cost).
- **Trade-off:** The site now carries two different image-honesty regimes side by side (real screenshots vs. clearly-labelled verified/provisional diagrams) until real photography exists project-by-project; every future case study must keep the label and the underlying verified facts in sync, or the asset itself becomes a truthfulness violation.
- **Schema/content-model impact:** `ProjectFrontmatter.images[].placeholder: boolean` is replaced by `images[].assetType: "real-screenshot" | "verified-diagram" | "provisional-illustration"` in `lib/content/schemas.ts` and CONTENT_MODEL §2 — a single field capturing the distinction this decision introduces, instead of layering a second boolean alongside the existing one (CONTENT_MODEL §8 already documents the parallel `[CONTENT REQUIRED]`-marker mechanism; this is a separate, image-specific concern, not restated there).
- **Approval:** Hakan's explicit, dated decision (2026-08-05); implemented as directed, not independently proposed.

## D-020 — Reduced motion disables motion, not design (experimental branch scope)

- **Status:** ACCEPTED for `feature/spatial-portfolio-v5` only (2026-08-16). **Not** in force on `main`, which remains governed by DESIGN_SYSTEM §§1–17.
- **Decision:** Under `prefers-reduced-motion`, the spatial prototype disables **motion systems** while permitting **static design grammar** to remain. Camera travel, parallax, spline-driven travel, collision shake, animated repositioning, erosion animation, moving debris, directional-field movement and Editorial Drift movement must all be off. Strong editorial compositions, static System POV corners/brackets, real project metadata, static structural rails and non-animated system grammar may remain.
- **Supersedes:** DESIGN_SYSTEM §18.9 (V4), whose concept was *reduced motion = zero spatial grammar*, verified as "zero of each". V4 itself is unchanged on its own branch; this decision changes the contract for V5 forward, not retroactively.
- **Reason:** V4's rule was written to guarantee that a reduced-motion visitor was never subjected to residual movement, and it achieved that by deleting the entire spatial layer. In V5 that became the wrong trade: the System POV annotation carries *real, non-duplicated project facts* (which layer the lead evidence belongs to, and the project's real lifecycle phase), so deleting the layer wholesale removed genuine information from exactly the users least able to afford losing it. Motion is the accessibility hazard; composition is not.
- **Binding conditions:** no fake telemetry in the static state; no duplicate screen-reader content — useful metadata appears exactly once and stays semantic; decorative static graphics remain `aria-hidden`; no partially destroyed functional text; the static state must be a designed composition, not a stripped dump.
- **Rejected:** Keeping §18.9 unchanged (discards real metadata from reduced-motion users for no accessibility gain); rendering the spatial layer with animations merely slowed rather than removed (still motion, still a hazard); duplicating the metadata into a separate screen-reader-only block (creates two sources of truth for the same fact, and violates the no-duplicate-content rule).
- **Trade-off:** Reduced motion is no longer verifiable by the simple assertion "zero spatial elements present". The E2E contract becomes finer-grained — *these specific things must not move, these specific things may exist statically* — which is more expressive but more test surface to maintain. That test coverage does **not yet exist** and is recorded as an open item in DESIGN_SYSTEM §19.13.
- **Approval:** Hakan's explicit, dated instruction (2026-08-16), issued as an approved contract change during the V5 stabilization pass; implemented as directed, not independently proposed.

## D-021 — Owner reorder, governed scroll, and the V7 system pass (experimental branch scope)

- **Status:** ACCEPTED for `feature/spatial-portfolio-v5` only (2026-08-31, owner brief). **Not** in force on `main`.
- **Decisions, all owner-directed in one brief:**
  1. **Project order** is now Software Factory → Kıvılcım → JointLedger → DropSpot (then Professional Systems on the Work index). This supersedes **D-016's order** wherever the two disagree; `order` frontmatter stays the single source of truth and now records 0/1/2/3/4.
  2. **Software Factory and JointLedger become first-class spatial scenes.** Software Factory's content entry was published after a direct audit of the local repository (`C:\GitHub\software-factory`) — its delivery-loop diagram is traced to the repo's own README pipeline, constitution and ADR-0002 and labelled a verified diagram under D-019.
  3. **Gate 1's DropSpot crop is reversed.** The uncropped screenshot returns at 84% width with the second-shot group restored and enlarged; `Figure`'s `frameRatio` capability remains but is unused.
  4. **One supporting-plane grammar** (enter-before / register-at-focus / trail-on-exit) now runs on every project plane via `lib/spatial/planeChoreography.ts`, desktop and mobile.
  5. **Scroll is governed inside the spatial route.** Wheel input is intent; progression is capped at `ROUTE_MAX_RATE` in both directions (`useRouteGovernor` + the route-wide visual glide ceiling). This deliberately extends the break event's fixed-playback philosophy to the whole route at the owner's explicit direction ("raw wheel = intent; the system decides progression"), and keeps the same escape guarantees: keyboard/scrollbar/programmatic scrolls are never captured and are adopted, ctrl+zoom passes through, touch stays native, reduced motion never sees any of it.
  6. **"Built for real life" (dormant, zero entries) is replaced by the Selected Systems index** — loader-fed rows for every published system. Chosen over an "Operational Model" section because How I Build already carries the method; what the lower page lacked was a dense, navigable account of the systems just toured.
- **Trade-offs recorded:** the route grew (640vh; ~64vh per segment, still far under V1's per-scene cost); the exit traverse's progress share fell below the old 10% guard (geometry unchanged, guard re-derived); two e2e settle-helpers needed longer proven-stable runs because arrival is now paced.
- **Approval:** Hakan's explicit V7 brief; implemented as directed.
