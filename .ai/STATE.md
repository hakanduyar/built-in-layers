# STATE — current truth only

Replace entries when they go stale. History belongs in Git and `docs/`, not here.

_Updated: 2026-09-04_

| Field | Value |
|---|---|
| Project | Built in Layers — Hakan Duyar portfolio |
| Repo | `C:\GitHub\portfolio` |
| Branch | `feature/project-architecture-v13` |
| Last application checkpoint | Phase 7 — see `docs/PHASE7.md`. Verify the tip with `git rev-parse HEAD` rather than trusting a SHA written here |
| Origin | in sync — verify with `git rev-parse origin/feature/project-architecture-v13` |
| `main` | `16d3ec0` — untouched, never merged to |
| Working tree | clean except intentional untracked `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (22.6 MB recovery bundle, deliberately not committed) |

## Frozen systems

| System | Frozen at | Scope |
|---|---|---|
| Desktop spatial | 2026-09-02, `0752883` | route, spacing, grounds, scroll physics, sharpness, zoom, SYSTEMS, UNDERNEATH, lower world |
| Case-study system | 2026-09-03, `5000201` | destinations, hero, record, derived previous/next, ordering contract |
| Mobile | 2026-09-04, `8a24e03` | mobile world unit, figure inspector, measure token, touch targets, mobile route legs |

Fingerprints and the sanctioned-move ledger: `docs/FROZEN_BOUNDARY.md` (§1 list, §5 ledger).
Ten of thirty fingerprinted blobs have moved; every one is ledgered with evidence. **Phase 7 opened
no frozen file** — the §4 loop still prints exactly those ten.

## Current phase

**Phase 7 — final engineering / console / performance. COMPLETE.** Record: `docs/PHASE7.md`.

Validation at the checkpoint: typecheck 0 · lint 0 · `format:check` 0 (was 98) · unit **556/556**
across three runs · build 15/15 · Chromium **224/224** · WebKit **222/224** (was 219/224) · frozen
§4 exactly 10 `MOVED:` · console/runtime/hydration **0** across 10 content routes · CLS ≤ 0.0388 ·
images 0 broken / 0 unsized / 0 empty-alt · overflow **0 of 99** route × width combinations.

## Active blockers

None. Nothing is waiting on the owner.

## Accepted non-blockers

- WebKit: **two** failures remain (was five). Both proved environment, not product — Safari's
  default "Tab highlights each item: off" for the skip-link test, and one governed-camera arrival
  case that passes serially in 8.9s at unchanged thresholds. `docs/PHASE7.md` §3–§5.2.
- Three font-preload console notices on the **404 route only**; the ten content routes are silent.
- Decision *alternatives* render as a comma join rather than a list — owner-accepted 2026-09-03.
- Two `<nav>`s share `aria-label="Primary"` — pre-existing, axe-clean, no measured mobile harm.
- Software Factory sits at `depth: "preview"`, so it is outside case-study navigation until its
  content depth rises. Blocked on `docs/CONTENT_GAPS.md` gaps 1–2, which need the external
  repository the owner has ruled out of scope.
- Desktop figures at ~0.51 scale have no inspector, by design.
- `blockJS` drops MDX `index={n}` FIG numbering (D-001) — content-side, pre-existing.

## Resolved in Phase 7 — no longer open

- The unit suite's "load sensitivity" was a quadratic publication gate, now fixed and measured.
  `similarity()` no longer allocates the full Levenshtein matrix. Suite 76.1s → 28.2s, and the
  intermittent 5s timeout is gone.
- ENV-1, the CRLF artefact: `.gitattributes` added, worktree normalized, **zero blobs changed**.
  `pnpm format:check` passes for the first time.
- The eight figure-inspector tests are now measured on WebKit. One was a genuine unguarded
  hydration race and is fixed; the count assertions were not relaxed.

## Next action

No assignment. `.ai/ACTIVE_TASK.md` is `TASK: NONE` — set the next phase there.
