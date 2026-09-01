# REVIEW ARTIFACT POLICY

How visual review evidence is produced, where it lives, and what may enter Git.

_Last updated: 2026-09-01 (V9)_

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

Each takes `PROBE_BASE` (default `http://127.0.0.1:3000`) and most take `PROBE_W` / `PROBE_H`.
`still-capture.mjs` and `scroll-recording.mjs` take `SHOT_OUT` / `OUT`, defaulting outside the
repository.
