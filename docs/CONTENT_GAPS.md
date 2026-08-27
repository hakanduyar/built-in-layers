# CONTENT GAPS

Facts that are missing or unverified. Nothing here may be invented to fill a gap — record it and
continue with everything else that is possible. See `CLAUDE.md §11`.

_Last updated: 2026-08-28_

---

## Blocking the roadmap

| Gap | Needed for | Status |
|---|---|---|
| **V6.8 source tree** | everything after Phase 1 | **BLOCKED** — exists only on the Ubuntu machine, uncommitted and unpushed. See `docs/AUTONOMOUS_RECOVERY_STATUS.md`. |

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
