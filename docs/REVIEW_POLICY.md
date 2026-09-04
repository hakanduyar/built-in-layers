# REVIEW ARTIFACT POLICY

How visual review evidence is produced, where it lives, and what may enter Git.

_Last updated: 2026-09-04 (V13 mobile gate, bounded final pass)_

---

## Why this exists

The V8 responsive pass committed ~18MB of review binaries — 76 full-page PNGs and three `.webm`
recordings — into a repository whose `.git` was 4MB before it. That was the right call for the
brief that asked for them and the wrong default going forward: review evidence is a snapshot of one
moment, it is superseded by the next pass, and it is permanent in Git history.

**Nothing is being deleted.** The V8 bundle stays exactly where it is under
`docs/review/v8-responsive/`; rewriting history is explicitly out of scope. This policy governs
what happens from V9 onward.

---

## The rule

| Artifact | Where it goes | In Git? |
|---|---|---|
| Measurements, metrics, JSON probe output | `docs/review/<pass>/metrics/` | **yes** — small, diffable, and the actual evidence |
| Route/geometry dumps (`route-focus.json`) | `docs/review/<pass>/metrics/` | **yes** — probes read them, so they must be versioned with the route |
| Written findings, comparison tables | `docs/review/<pass>/` or `docs/DESIGN_SYSTEM.md` | **yes** |
| A handful of stills that a decision depends on | `docs/review/<pass>/` | **yes**, deliberately — only where a specific claim needs a picture |
| Full still matrices (every scene × every viewport) | `C:\Users\hakan\portfolio-review\<pass>\` | **no** |
| `.webm` / any video recording | `C:\Users\hakan\portfolio-review\<pass>\` | **never** |

`.gitignore` enforces the last two rather than relying on discipline.

## Why metrics are the evidence and stills are the illustration

Every defect this project has actually fixed was found by a number, not by a picture: 145px of
clipped scene, a 360px run at 0.2% content fill, a 9.0% frame-to-frame speed step, a travel-material
fragment resolving to progress 0.137 against a scene focus of 0.141. The stills confirmed each one
afterwards. So the numbers are what belongs in history, at a few KB each; the pictures are review
material, and they belong on disk next to the person doing the reviewing.

## Producing a review bundle

The probes under `tests/tools/` are evidence tools, not test suites — they are never run by
`pnpm test` and never gate a commit:

| Tool | Answers |
|---|---|
| `world-fit-probe.mjs` | does every scene fit its frame, at every viewport |
| `dead-scroll-probe.mjs` | where does the page stop saying anything (step-and-settle) |
| `natural-fill-probe.mjs` | the same, under real wheel input at a human cadence |
| `cta-endhold-probe.mjs` | is input buying movement, or has the route simply ended |
| `still-capture.mjs` | the still matrix (writes outside the repo by default) |
| `scroll-recording.mjs` | natural-scroll video (writes outside the repo by default) |
| `mobile-zoom-probe.mjs` | mobile widths and browser-zoom CSS-viewport truth |
| `fable-gate-probe.mjs` | the V13 desktop art-direction matrix (V13 Fable gate) |
| `mobile-audit-probe.mjs` | measure, tap targets, overflow, headings and console at six device sizes (Phase 6) |
| `mobile-route-probe.mjs` | how much of each frame carries ink, walking the mobile route in half-viewport steps (V13 mobile gate, M3) |
| `touch-target-probe.mjs` | every hit box below `lg`, plus the strip-and-recapture proof that the layout did not move (V13 mobile gate, M4) |
| `desktop-parity-probe.mjs` | two builds walked side by side: is the desktop provably unchanged (V13 mobile gate, `docs/FROZEN_BOUNDARY.md` §5) |
| `measure-768-probe.mjs` | per-element line length at a tablet width, and the cost of the 34rem measure alone — the page as built against the same page with the token re-declared (V13 mobile gate, M2 / ART-2) |
| `figure-inspect-probe.mjs` | every INSPECT control's accessible name and asset per page, and the `/work` thumbnails' scale at every width (V13 mobile gate, A11Y-1 / ART-1) |

Each takes `PROBE_BASE` (default `http://127.0.0.1:3000`) and most take `PROBE_W` / `PROBE_H`.
`still-capture.mjs` and `scroll-recording.mjs` take `SHOT_OUT` / `OUT`, defaulting outside the
repository. The V13 mobile-gate probes take `PROBE_OUT` and, where they compare two builds,
`PROBE_BASE_A` / `PROBE_BASE_B`; each file's header block is its own usage note.

**A number of record needs a tool in Git.** Any tool whose output a decision cites belongs under
`tests/tools/`, not beside the reviewer. The rule was written when
`docs/review/v13-mobile-gate/after/measure-768.txt` cited a `measure768.mjs` left in the gate's
out-of-repo scratch directory, so that one table could not be regenerated from a clean clone. The
bounded final pass after the independent QA (ARTIFACT-1) put the tool in Git as
`measure-768-probe.mjs` and regenerated the file with it — every paragraph row identical — and
the pass's own listings (`after/figure-inspect.txt`, `after/tablet-length-768.txt`) were produced
by versioned tools from the start.
