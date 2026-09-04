# STATE — current truth only

Replace entries when they go stale. History belongs in Git and `docs/`, not here.

_Updated: 2026-09-04_

| Field | Value |
|---|---|
| Project | Built in Layers — Hakan Duyar portfolio |
| Repo | `C:\GitHub\portfolio` |
| Branch | `feature/project-architecture-v13` |
| HEAD | `8a24e03` |
| Origin | same — in sync |
| `main` | `16d3ec0` — untouched, never merged to |
| Working tree | clean except intentional untracked `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (22.6 MB recovery bundle, deliberately not committed) |

## Frozen systems

| System | Frozen at | Scope |
|---|---|---|
| Desktop spatial | 2026-09-02, `0752883` | route, spacing, grounds, scroll physics, sharpness, zoom, SYSTEMS, UNDERNEATH, lower world |
| Case-study system | 2026-09-03, `5000201` | destinations, hero, record, derived previous/next, ordering contract |
| Mobile | 2026-09-04, `8a24e03` | mobile world unit, figure inspector, measure token, touch targets, mobile route legs |

Fingerprints and the sanctioned-move ledger: `docs/FROZEN_BOUNDARY.md` (§1 list, §5 ledger).
Ten of thirty fingerprinted blobs have moved; every one is ledgered with evidence.

## Current phase

**Phase 7 — final engineering / console / performance.** Not started.

The mobile track is closed: Phase 6 audit → Fable Gate 4 (FREEZE, `8a24e03`) → independent Opus QA
(PASS WITH DOCUMENTED NON-BLOCKERS, `4c788b4`, 44/44 desktop-parity walks).

## Active blockers

None. Nothing is waiting on the owner.

## Accepted non-blockers

- WebKit: five failures under software rendering on this machine, reproduced against baseline. Not a
  product regression. The newer inspector tests are unmeasured there.
- Decision *alternatives* render as a comma join rather than a list — owner-accepted 2026-09-03.
- Two `<nav>`s share `aria-label="Primary"` — pre-existing, axe-clean, no measured mobile harm.
- Repo-wide Prettier "debt" is largely a `core.autocrlf` artefact; no `.gitattributes`.
- Software Factory sits at `depth: "preview"`, so it is outside case-study navigation until its
  content depth rises. Blocked on `docs/CONTENT_GAPS.md` gaps 1–2, which need the external
  repository the owner has ruled out of scope.
- Desktop figures at ~0.51 scale have no inspector, by design.

## Next action

Execute `.ai/ACTIVE_TASK.md`.
