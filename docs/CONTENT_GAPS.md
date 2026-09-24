# CONTENT GAPS

Facts that are missing or unverified. Nothing here may be invented to fill a gap — record it and
continue with everything else that is possible. See `CLAUDE.md §11`.

_Last updated: 2026-09-01 (V9)_

---

## Blocking the roadmap

| Gap | Needed for | Status |
|---|---|---|
| _(none)_ | — | The V6.8 recovery blocker recorded here is **CLOSED**: the tree was recovered and merged at `682d54e`. |

Until V6.8 is recovered, the project-content audit below cannot be completed against the real
current tree, and `docs/PROJECT_INVENTORY.md` has deliberately **not** been written — writing it
against the superseded `d7013f8` source would produce a misleading inventory.

---

## Known open content questions (carried from V5)

These predate the current blocker and were already recorded in `docs/PROGRESS.md`.

| Gap | Affects |
|---|---|
| Public email, current CV, current location | site-wide contact / About — deliberately unpublished until explicitly confirmed |
| Selection of three Medium articles (title + URL) | Notes index |
| Real screenshots for Kıvılcım | case study — currently honest D-019 diagrams, a wanted replacement, not a publication blocker |
| Real screenshots for DropSpot | case study — 8 real screenshots exist in the source repo, not yet all imported |
| Production domain | TASK-008 completion — still a hard release blocker |

---

## To be established once V6.8 is recovered

Candidate flagship ordering is `01 Software Factory → 02 Kıvılcım → 03 DropSpot →
04 JointLedger → 05 Professional Systems / Work index`, but **actual available content must be
verified first**. For each candidate, `docs/PROJECT_INVENTORY.md` will need to record:

- actual repository / project source
- real screenshots and assets that exist today
- real technical facts, verified against source rather than README claims
- architecture knowledge genuinely available
- what is missing
- publishability
- whether anonymization is required

**Software Factory** is a likely flagship (a local repo exists at `C:\GitHub\software-factory`,
branch `feat/autonomous-engineering-loop`), but no claim about its architecture, roles, gates or
proof lineage may be published until extracted from that source directly.

**JointLedger** must not be reduced to a minor annotation if enough real content exists to
support more.

---

## Homepage release-candidate gaps (V9, 2026-09-01)

Recorded while removing the "A fuller introduction is coming here" placeholder from About and the
homepage's About preview. The introduction that now ships is assembled **only** from facts this
repository already asserts (see the note on `aboutIntro` in `data/copy.ts`). Everything below is
what a longer, more personal biography would need and what this repository cannot supply — so it
was **not written**, per CLAUDE.md §11.

| Gap | Blocks | Why it is not guessed |
|---|---|---|
| Years of experience / career start date | a conventional "N years building X" line | Not derivable from any file in the repo |
| Current employer, job title, team | professional framing on About | Professional work is deliberately anonymised; no employer is named anywhere in content |
| Location / timezone / working availability | About, contact | Never stated in the repo |
| Public email address | contact beyond LinkedIn | Deliberately unpublished until explicitly confirmed (carried from V5) |
| Education, certifications | About | Not in the repo |
| A personal photograph | About page identity | None exists in `public/images/` |
| Three Medium article titles + URLs | Field Notes and `/notes` becoming a real index | `data/notes.ts` is intentionally an empty array (D-008); Field Notes ships as a compact
external bridge until it is populated (V9 §P0) |

### Professional Systems (§19)

`content/work/professional-systems/index.mdx` carries `verificationStatus: "requires-user"`,
`tech: []`, `links: []`, an empty contribution statement awaiting approval, and one
`provisional-illustration` asset. It is honestly labelled everywhere it appears — the Selected
Systems register now states "Not yet verified" and "No public artefact" for it explicitly — and it
is deliberately kept as a `preview`-depth entry with no spatial scene, because the content cannot
support one. What is missing before it can carry more:

- the problem class and constraint, in publishable form
- Hakan's specific role and contribution, approved for publication
- whether any interface evidence can be shown at all, even anonymised

Until then it stays compact. That is the honest presentation, not a placeholder.

## Evidence gaps recorded by owner decision (2026-09-02)

These are open questions, not defects. Per the owner's content rule, none of them blocks
architecture, ordering, navigation, the project data model, the case-study framework or
evidence-slot design — they block only the content that would otherwise have to be fabricated.

| # | Gap | Status | Blocks |
|---|---|---|---|
| 1 | Software Factory screenshot availability | Not yet verified. Must be established by inspecting the real repository/runtime, not assumed. If there is no meaningful product UI, do **not** force screenshot parity — use verified architecture/workflow/topology/state diagrams. | Evidence selection for the flagship |
| 2 | Verified Software Factory public architecture depth | Approved in principle at public logical/system-architecture level: role boundaries, workflow orchestration, review/release gates, proof lineage, state transitions, module relationships, topology, verified data/control flow, decisions and trade-offs, verification model. Every claim must be verified against actual source — never inferred from portfolio copy. Never publish credentials, secrets, tokens, private endpoints, or confidential third-party detail. | Raising Software Factory above `depth: "preview"` |
| 3 | Kıvılcım runnable screenshot state | Unverified. To be established by inspecting the actual project. Real screenshots if a runnable state exists; otherwise keep verified architectural evidence and fabricate nothing. | Evidence selection |
| 4 | JointLedger runnable screenshot state | Unverified, same rule. | Evidence selection |
| 5 | Verified timelines | No timeline policy or data established. Dates may be added only if verifiable from git history, repository history or project documentation. Never estimate for parity. | The optional `timeline` field |
| 6 | Verified live/demo destinations | `https://github.com/hakanduyar/jointledger` is a **repository** link and must never be presented as a live application or demo. Kıvılcım, Software Factory and DropSpot have no verified live/demo URL. Repository, live and demo are distinct evidence types; if no verified destination exists, omit the field. | The optional `links` entries |

### Navigation consequence of gap 2

Under D-027, case-study previous/next navigation includes only projects whose `depth` is `full` or
`short`. Software Factory is the flagship but is still `preview`, so it is **not** currently in that
sequence and its page has no onward link. This is a content gap, not a navigation defect: closing
gap 2 raises its depth and it enters the sequence automatically, with no code change.
