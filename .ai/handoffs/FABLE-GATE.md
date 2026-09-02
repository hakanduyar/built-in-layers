MODEL: claude-fable-5-1 (Fable 5.1)
EFFORT: max
RUNNER: Claude CLI

# FABLE GATE — FINAL ART DIRECTION

> Supersedes the 2026-08-31 Fable Gate 1 brief, whose starting state (`.ai/handoffs/OPUS-RETURN.md`)
> is now three system passes old. Written from the actual current HEAD.

You own **art direction, visual coherence, spatial experience and case-study presentation quality**.
You do not own correctness or system architecture — that was settled by two independent reviews and
is frozen. Your question is the one a test suite cannot answer:

**Does this actually look and feel finished?**

## 0. State

| | |
|---|---|
| Repository | `C:\GitHub\portfolio` |
| Branch | `feature/project-architecture-v13` |
| HEAD | `bc2dad371651ef350f65658d6d5df37e623bc372` — verify with `git rev-parse HEAD` |
| Base | `243db393` — the V12 desktop freeze |
| Frozen branch | `feature/spatial-portfolio-v5` @ `243db393` — **do not touch** |
| `main` | `16d3ec0` — **do not touch** |
| Tree | clean except untracked `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (22.6 MB V12 recovery bundle — **do not delete**) |

Validation at HEAD: typecheck, lint, Prettier clean; unit 521/521; build 15/15; Chromium 214/214;
WebKit 212/214 with two classified pre-existing failures.

## 1. Read first

| Path | Why |
|---|---|
| `docs/DESKTOP_FREEZE_ACCEPTANCE.md` | What the V12 desktop freeze measured and accepted |
| `docs/FROZEN_BOUNDARY.md` | **30 fingerprinted files you must not edit without cause** |
| `docs/PROJECT_ARCHITECTURE_ACCEPTANCE.md` | The architecture criteria frozen 2026-09-03 |
| `docs/DECISIONS.md` D-019, D-021, D-022…D-027 | Standing decisions |
| `docs/DESIGN_SYSTEM.md` §32–§36 | The visual language and its history |
| `docs/CONTENT_GAPS.md` | What is unverified — never fill a gap by inventing |
| `docs/review/v12-codex-gate/` | 221 existing artifacts: stills at 5 viewports, zoom, phases, sharpness, recordings |

## 2. Render it yourself

Do not trust anyone's PASS, including mine. `pnpm build && pnpm start` (port 3000 may be held by a
stale process — use another port). Then actually watch it: scroll naturally, scroll hard, reverse,
scrub the recordings, at **1366, 1440, 1536, 1920, 2560** and at 100/80/67/50% zoom.

## 3. Judge

**Homepage journey** — 01 Software Factory → 02 Kıvılcım → 03 JointLedger → 04 DropSpot →
05 SYSTEMS, then the lower world. Does each destination get its own moment: ARRIVE → EXPERIENCE →
DEPART → TRAVEL → ACQUIRE NEXT? Does 1366/1440 feel intentional rather than a cramped fallback?
Does 2560 feel expansive without going empty?

**Project grounds** — judge the *visual behaviour*, not the abstraction's name. Required perception:
ground **leads** on entry → **resolves** with the foreground at focus → **trails** on exit. If it
still reads as "a beige rectangle moving behind a card", it fails. Refining timing, scale or
composition is yours; reverting to four hardcoded offsets is not.

**Project roles** — Software Factory must feel flagship/foundational and systemic (do **not** force
fake UI screenshots; architecture and workflow evidence is stronger and truthful). Kıvılcım's strong
foreground is preserved. JointLedger must feel first-class, not connective filler. DropSpot keeps
its full uncropped evidence. Professional Systems keeps its publication-safe preview role.

**Case-study pages** — newly reworked, and never art-directed. `/work/kivilcim`, `/work/jointledger`,
`/work/dropspot` now carry derived previous/next navigation; `/work/software-factory` and
`/work/professional-systems` deliberately carry none. Judge hierarchy, evidence presentation,
diagram treatment, typography, density, rhythm, and whether the pages feel related without being
cloned. **Truthfully asymmetric evidence must still look deliberately designed** — visual
consistency does not mean identical evidence slots.

**Lower world** — UNDERNEATH → transition → SELECTED SYSTEMS → HOW I BUILD → FIELD NOTES → ABOUT →
CTA. No dead route, no arbitrary pale rectangles, every section with a reason to exist, CTA as final
system state. Negative space is welcome; dead space is not.

**Motion** — controlled, not violent, no scene-blasting, natural reverse, diagonal and vertical
feeling like one system, text and images optically sharp *while moving*.

## 4. Preserve

Hero identity; Kıvılcım's foreground; SYSTEMS intact typography and its surface-opening concept;
UNDERNEATH; the deterministic geometric transition; the warm off-white restrained language;
system intelligence expressed through focus/route/state rather than sci-fi decoration.

Previously rejected and must not return: wall collision or recoil, eroded/damaged SYSTEMS
typography, peeling or hatch gimmicks, HUD clutter, fake telemetry or coordinates, arbitrary pale
filler boxes, fake code, decorative technical noise.

## 5. Authority

You MAY: inspect, render, capture, iterate visually, edit presentation code, and commit and push
`feature/project-architecture-v13`.

You MAY NOT: merge or touch `main`; touch `feature/spatial-portfolio-v5`; force push; rewrite
history; delete the V12 bundle; invent any project fact, screenshot, metric, timeline or URL;
weaken tests; or rewrite the scroll physics or ordering/navigation architecture for visual novelty.

Editing a file fingerprinted in `docs/FROZEN_BOUNDARY.md` §1 requires a stated visual reason and
the same standard the freeze was granted under: evidence, not preference. Say so explicitly when
you do it.

Iterate internally — RENDER → WATCH → CRITIQUE → MODIFY → RENDER → COMPARE → REFUTE → REFINE. Do
not stop after one pass and do not ask for approval between iterations. If several small coordinate
tweaks fail to fix the same thing, question the composition instead of tweaking again.

If you find an objective engineering regression, **document it — do not paper over it with a visual
trick.** It goes to the final engineering QA.

## 6. Required output

Create `.ai/handoffs/FABLE-RETURN.md`: starting HEAD, final HEAD, exact model, exact effort,
art-direction findings, changes made, architecture deliberately preserved, frozen areas preserved,
artifacts produced, remaining objective engineering findings, and the verdict.

End your final message with exactly:

```
FABLE ART DIRECTION:
FREEZE
```

or

```
FABLE ART DIRECTION:
NOT READY
```

Do not report FREEZE because the implementation is technically correct. Report FREEZE only if the
actual desktop experience looks and feels like a finished premium portfolio.
