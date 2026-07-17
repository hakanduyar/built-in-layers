# ROADMAP — Built in Layers

Status: REVISED per Hakan's conditional approval (2026-07-17)
Rule: **a phase may not start until Hakan has explicitly approved the previous phase's review.** One active task at a time (`CLAUDE.md §2`). "Parallel-allowed" below means order-independent, not simultaneous execution.

## Phase overview and dependency order

Approved execution order (D-011 rejected — content system precedes the homepage; TASK-003 depends on TASK-004):

```text
Phase 0 ─► Phase 1 ─► Phase 2 ─► Phase 3 ─► Phase 4 ─► Phase 5 ─► Phase 6 ─► Phase 7 ─► Phase 8
(setup)   (TASK-001) (TASK-002) (TASK-004) (TASK-003) (TASK-005) (TASK-006) (TASK-007) (TASK-008)
          foundation  shell      content    homepage   └─ 005 and 006 are order-independent ─┘
```

Task execution order: **TASK-001 → TASK-002 → TASK-004 → TASK-003 → TASK-005 → TASK-006 → TASK-007 → TASK-008.**

## Phase 0 — Preconditions

Outcome: the repository and open decisions are ready for implementation.

Entry: planning documents approved (conditional approval granted 2026-07-17; revisions applied).
Exit criteria:

- [x] Git repository initialized at the project root (done 2026-07-17). *Initial commit of the docs has not been made — commits require Hakan's explicit instruction (`CLAUDE.md §13`).*
- [x] Decision batch resolved (2026-07-17): D-001 provisional, D-002/D-007/D-008/D-016/D-017 accepted, D-003 accepted provisionally, D-004/D-006/D-010 accepted with changes, D-009 accepted with exact wording, D-005/D-011 rejected and replaced (see `docs/DECISIONS.md`).
- [x] Confirmation list answered: homepage featured order (D-016), Kıvılcım display name (D-017), public email/CV/location remain unpublished until explicitly confirmed.
- [ ] Initial commit of the documentation set (awaits Hakan's instruction).

The production domain is **not** a Phase 0 or TASK-001 blocker; it is required before TASK-008 completion (see Phase 8).

## Phase 1 — TASK-001 Foundation

Outcome: a running, empty-but-verified Next.js workspace with tokens, fonts, tooling, every canonical quality-gate command green — plus the **mandatory D-001 MDX compatibility spike** (result recorded in DECISIONS) and the D-003 font compile/variant verification.

Entry: Phase 0 complete.
Exit: all TASK-001 acceptance criteria pass; `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e` all green; spike outcome documented (next-mdx-remote confirmed or `@next/mdx` fallback adopted); review approved.
Parallel: nothing may run alongside.

## Phase 2 — TASK-002 Static shell

Outcome: root layout (header with desktop inline nav + mobile MENU trigger and accessible panel per revised D-005, footer with contact CTA, skip link), all MVP routes exist as honest static stubs, custom 404, baseline metadata.

Entry: Phase 1 approved.
Exit: every route renders; keyboard pass on shell including menu open/close/Escape/focus management; smoke tests cover all routes + 404 + menu behavior; review approved.
Parallel: none.

## Phase 3 — TASK-004 Content system

Outcome: schemas, loaders, publication gates, MDX pipeline (per the D-001 spike outcome), work index, case-study template, JointLedger + professional previews, notes and lab pages with real or honestly-pending data.

Entry: Phase 2 approved.
Exit: content gates unit-tested; `/work` and the case-study template render from content files only; review approved.
Parallel: none. (Content *collection* for Phases 5/6 — screenshots, role statements — can happen on Hakan's side during this phase.)

## Phase 4 — TASK-003 Homepage static

Outcome: complete static homepage — all 10 sections with approved seed copy, static (stacked) layer explorer, **fed by the real typed content system from its first implementation** (no transitional data layer — D-011 rejected).

Entry: Phase 3 approved (TASK-003 depends on TASK-004).
Exit: homepage matches DESIGN_SYSTEM at 375/768/1024/1440px; anti-generic criteria (DESIGN_SYSTEM §17) reviewed; **this review is the static-layout approval gate — no motion work anywhere before it passes.**
Parallel: none.

## Phase 5 — TASK-005 Kıvılcım case study (full)

Outcome: first complete case study, published.

Entry: Phase 4 approved **and** content verification complete: repository audit of `hakanduyar/spark` done within the task, plus Hakan-provided screenshots, role statement, current status, limitations. **Full case-study writing may not begin before these inputs exist** — if inputs are missing, the task stops at the audit-report step and waits.
Exit: publication gates pass with `verificationStatus: verified`; Hakan approves the published text; review approved.
Parallel: order-independent with TASK-006 (either may go first once its own inputs are ready), still executed one at a time.

## Phase 6 — TASK-006 DropSpot case study (short)

Outcome: shorter technical case study, published.

Entry: Phase 4 approved and repository audit of `hakanduyar/dropspot-project` completed within the task; every technical claim (PostgreSQL transactions, concurrency handling, waitlist logic) verified against code before writing.
Exit: publication gates pass; Hakan approves; review approved.
Parallel: order-independent with TASK-005.

## Phase 7 — TASK-007 Motion layer + interactive explorer

Outcome: `motion` installed; LayerExplorer becomes an accessible tab interface (WAI-ARIA Tabs, **manual activation** per revised D-006); restrained site-wide reveals; reduced-motion verified.

Entry: Phases 3 **and** 4 approved (content system + static layout); at least one case study (Phase 5 or 6) published so the explorer previews real layers. **Hard gate: no motion code before the Phase 4 static-layout approval.**
Exit: keyboard + reduced-motion tests pass (RTL + Playwright); motion obeys DESIGN_SYSTEM §13–14; without JavaScript all three layer sections remain visible, ordered, labelled, and readable; review approved.
Parallel: none.

## Phase 8 — TASK-008 Accessibility, performance, SEO

Outcome: final a11y audit, performance pass, metadata/OG/sitemap/robots/JSON-LD complete, release checklist run.

Entry: all routes and published content stable — Phases 2–7 approved, no pending content changes. **SEO polish may not start earlier**; only the metadata *helper* (built in TASK-002/004) exists before this.
Blocking inputs within this phase: **the production domain must be confirmed before TASK-008 completion** (it is not a blocker for any earlier phase; the typed site-URL configuration uses a safe development value until then — the production domain is never invented). OG image approval. Optionally: confirmed email/location if they are to appear at all.
Exit: QA_CHECKLIST fully executed and recorded; Lighthouse targets met (TASK-008); axe scan clean; review approved. MVP is releasable.
Parallel: none.

## Proposed additional tasks (NOT created — require approval)

Per the bootstrap constraint, these are proposals only:

- **TASK-009 — JointLedger full case study** (post-MVP): depends on Hakan's public/private decision, safe screenshots, upstream-disclosure review.
- **TASK-010 — Professional systems real case study**: depends entirely on approved professional content (names, permissions, artifacts). Once at least one approved and substantive professional case study exists, Professional Systems may take homepage slot 1 (D-016 condition).
- **TASK-011 — Turkish content phase**: i18n approach decision + translations; architecture is ready but the library decision is deliberately deferred.
- **TASK-012 — CI pipeline** (GitHub Actions running the existing gates): small, useful, optional.
- **TASK-013 — Local MDX notes**: migrate selected writing from external links to on-site articles.

## Standing rules across all phases

- Approval between phases is explicit — silence is not approval.
- A failed review returns the phase to its task with the reviewer's remediation list; the next phase stays blocked.
- Content verification always precedes case-study writing (Phases 5–6 entry criteria).
- Motion always follows static approval (Phase 7 entry criterion).
- SEO/performance polish always comes last (Phase 8 entry criterion).
- Any scope discovered mid-task that is not in the task file is written to `docs/PROGRESS.md` as "deferred", not implemented.
