# DECISIONS — Built in Layers

Format per entry: Decision / Reason / Rejected alternatives / Trade-off / Approval.
Statuses: `PROPOSED` (needs Hakan), `PROVISIONAL` (approved direction pending a mandatory verification step), `ACCEPTED` (approved), `REJECTED` (superseded — the entry records the replacement), `RECORDED` (no user approval required), `CONTRACT` (fixed by CLAUDE.md, recorded for traceability).

New entries are appended by tasks **only when a real decision was made**.

Revision log: 2026-07-17 — planning phase conditionally approved by Hakan; statuses and revisions below reflect that approval batch.

---

## D-001 — MDX pipeline: `next-mdx-remote/rsc` + `gray-matter`

- **Status:** PROVISIONAL (2026-07-17) — preferred candidate, pending the TASK-001 compatibility spike
- **Decision:** `next-mdx-remote/rsc` remains the preferred candidate for compiling case-study MDX inside Server Components; frontmatter parsed with `gray-matter`; validated with Zod. **TASK-001 must run a mandatory compatibility spike** covering: one local MDX file, frontmatter parsing, Zod validation, rendering in a Server Component, custom MDX components, `generateStaticParams`, a production build, and Vercel-compatible pre-rendering.
- **Fallback (documented):** if the spike fails, the pipeline switches to the official `@next/mdx` pipeline; this entry is updated with the spike evidence either way.
- **Security constraints (binding regardless of outcome):**
  - Only repository-owned, trusted local MDX may be compiled.
  - User-submitted or remotely supplied MDX is not supported and must never be compiled.
  - If `next-mdx-remote` is used: pin a compatible version and explicitly enable its JavaScript-blocking security options.
- **Reason:** Keeps content in `/content` (decoupled from routes), works natively with App Router Server Components, small dependency surface, no build-tool coupling — but RSC-entry compatibility must be proven against the actual Next.js version before the architecture depends on it.
- **Rejected:** Contentlayer (effectively unmaintained), Velite (extra abstraction layer for 3–6 content files), hand-rolled `@mdx-js/mdx` (more code to own for no gain). `@next/mdx` is not rejected — it is the documented fallback.
- **Trade-off:** Two small extra runtime deps; MDX not type-checked at authoring time (mitigated by Zod gates + restricted component map); spike adds a bounded step to TASK-001.
- **Approval:** Granted provisionally 2026-07-17 — final confirmation follows the TASK-001 spike result.

## D-002 — Tailwind CSS v4 with CSS-first `@theme` tokens

- **Status:** ACCEPTED (2026-07-17)
- **Decision:** Use Tailwind v4; define all design tokens as CSS custom properties in `styles/globals.css` via `@theme`, so Tailwind utilities and raw CSS share one token source. Token definitions stay centralized — components never introduce raw values.
- **Reason:** Satisfies the contract "Tailwind + CSS custom properties" with a single source of truth; v4 is the current stable major.
- **Rejected:** Tailwind v3 + `tailwind.config.ts` (tokens duplicated between JS config and CSS variables), CSS Modules only (loses utility speed), vanilla-extract (unapproved dependency).
- **Trade-off:** v4's CSS-first config is newer; less community copy-paste. Acceptable for a greenfield repo.
- **Approval:** Granted 2026-07-17.

## D-003 — Fonts via `next/font/google`: Archivo, Newsreader, IBM Plex Mono

- **Status:** ACCEPTED PROVISIONALLY (2026-07-17) — pending TASK-001 verification
- **Decision:** Load the three spec-named families with `next/font/google` (self-hosted at build, zero runtime requests to Google), subsets `latin` + `latin-ext` (covers future Turkish glyphs), `display: swap`, variable axes where available. **TASK-001 must verify that the actual `next/font` imports compile successfully and that the selected variants and subsets are actually available** (including Newsreader italic). No additional font family may be added without approval.
- **Reason:** All three are published under the SIL Open Font License (re-verify during TASK-001 as spec requires); `next/font` gives preloading, no CLS from FOUT sizing, and no external requests.
- **Rejected:** Google Fonts CDN `<link>` (runtime third-party request, GDPR noise, layout shift risk), manual self-hosting (maintenance without benefit), any fourth family (forbidden without approval).
- **Trade-off:** Font subsetting is limited to `next/font` options; fine for three families.
- **Approval:** Granted provisionally 2026-07-17 — confirmed once TASK-001 records the compile/variant verification.

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
