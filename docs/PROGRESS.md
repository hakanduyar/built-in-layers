# PROGRESS — Built in Layers

How to use this file: every task appends a log entry when it starts and when it stops, and keeps the status table truthful. Deferred scope discovered mid-task is recorded here, never silently implemented.

## Status

Execution order revised 2026-07-17 (D-011 rejected): content system (TASK-004) now precedes the homepage (TASK-003).

| Phase | Task | Status | Review verdict |
|---|---|---|---|
| 0 | Preconditions | **Nearly complete** — git initialized 2026-07-17; decisions resolved; initial docs commit awaits Hakan's instruction | — |
| 1 | TASK-001 Foundation (+ D-001 MDX spike, D-003 font verification) | Not started | — |
| 2 | TASK-002 Static shell (desktop inline nav + mobile MENU panel) | Not started | — |
| 3 | TASK-004 Content system | Not started | — |
| 4 | TASK-003 Homepage static (loader-fed; static-layout approval gate) | Not started | — |
| 5 | TASK-005 Kıvılcım case study | Not started (content inputs pending) | — |
| 6 | TASK-006 DropSpot case study | Not started (repo audit pending) | — |
| 7 | TASK-007 Motion layer + explorer | Not started (gated on Phase 4 approval) | — |
| 8 | TASK-008 A11y / performance / SEO | Not started | — |

Planning documents: **conditionally approved 2026-07-17; required revisions applied same day. TASK-001 awaits start approval.**

## Open items blocked on Hakan

- Initial commit of the documentation set (commits require explicit instruction — `CLAUDE.md §13`).
- Explicit approval to start TASK-001.
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
