# AUTONOMOUS STATUS

Single source of truth for machine-readable project state. Conversation history is **not** the
source of truth — this file is. Updated at every checkpoint and every gate.

_Last updated: 2026-09-02 (V13 — project inventory; waiting for review resource)_

---

## WAITING_FOR_REVIEW_RESOURCE

| Field | Value |
|---|---|
| **State** | Pre-review work complete. Blocked on an external resource, not on work. |
| **Missing resource** | **Codex CLI capacity.** Quota exhausted; probed directly at 2026-09-02 and refused with "You've hit your usage limit… try again at **2:57 PM**". Session id of the refused probe: `01a0616b-f1dc-7512-a88f-da52af966d89`. |
| Reviewer required | Fresh Codex process — `gpt-5.6-luna`, effort `xhigh`. NOT a resumed session. |
| Why not substitute | The implementing Claude session cannot be its own independent reviewer, and no unproven local model may be qualified as an acceptance reviewer to avoid waiting. |
| Review candidate | `f85b166cc277484511e71108d99a03e694de06b4` — content baseline. Any later commit on this branch adds only this status record; verify with `git merge-base --is-ancestor f85b166 HEAD`. |
| Branch | `feature/project-architecture-v13`, based on frozen `243db393` |
| Tree state | clean, except the intentional untracked `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` |
| Review packet | `.ai/handoffs/CODEX-ARCH-GATE.md` — complete; launching Codex is the only remaining step |
| Expected return | `.ai/handoffs/CODEX-ARCH-RETURN.md` |
| Frozen boundary | all 30 fingerprinted blobs verified unchanged (`docs/FROZEN_BOUNDARY.md` §4) |
| On resume | independent review → remediation if required → re-review → **then** freeze the first slice's acceptance criteria → continue |
| Acceptance criteria | **NOT frozen** — the standing process requires the independent review first |

---

## Current state

| Field | Value |
|---|---|
| **Status** | **DESKTOP SPATIAL SYSTEM — FROZEN** (2026-09-02). V12 independent Codex gate closed every product item; acceptance matrix in docs/DESKTOP_FREEZE_ACCEPTANCE.md |
| Current branch | `feature/spatial-portfolio-v5` |
| Current HEAD | `0752883` (V12 Codex gate return; implementation is its parent `42798f1`) |
| Latest origin commit | `0752883` on `feature/spatial-portfolio-v5` (local == origin); `16d3ec0` on `main`, untouched |
| Remote | `https://github.com/hakanduyar/built-in-layers.git` (renamed from `portfolio.git`) |
| Working tree | clean except one intentional untracked artifact: `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (22.6 MB recovery bundle, deliberately not committed) |
| Current phase | **V13 PROJECT INVENTORY — pre-review work complete**, waiting for Codex review capacity (see §WAITING_FOR_REVIEW_RESOURCE). Working branch `feature/project-architecture-v13`; `feature/spatial-portfolio-v5` stays frozen at `243db393` |
| Source state | **RESOLVED** (was STATE D) — V6.8 checkpoint `d7bcebc`, merged with `dc81393` at `682d54e`; see `docs/AUTONOMOUS_RECOVERY_STATUS.md` section 0 |
| Last checkpoint commit | see §"Checkpoints" below |
| Pending Fable gate | none open — Gate 1 executed; `.ai/handoffs/OPUS-RETURN.md` written. Gates 2–4 not yet raised |
| Current visual artifacts | `docs/review/v12-codex-gate/` — 221 files: 204 stills across 1366/1440/1536/1920/2560 plus 80% / 67% / 50% zoom, project and SYSTEMS phases, reduced motion, moving-vs-stationary sharpness, six recordings and extracted frames, 10 JSON metric reports. Policy: `docs/REVIEW_POLICY.md` |

## Next action

**Project architecture / content expansion**, beginning with a truthful `PROJECT_INVENTORY` in the
established order: 01 Software Factory, 02 Kıvılcım, 03 JointLedger, 04 DropSpot. The desktop
homepage is frozen — do not reopen it without a measured regression.

Three things remain the owner's judgement rather than another engineering pass:

1. ~~**Neighbouring scenes are visible at focus** at viewports wider than the 1440 reference.~~
   **Resolved in V11/V12** — the route was widened and neighbouring painted intersection is now
   0 px² at every destination across all five desktop viewports.
2. **Professional Systems stays compact** because its content cannot support more. What it would
   need before it can carry a scene is listed in `docs/CONTENT_GAPS.md`.
3. **Scroll pacing** is now 1.38 projects-to-statements, up from 1.17, and the governor is
   untouched. The ceiling on that lever is the world's own continuity contracts, recorded in
   `SCENE_ALLOWANCE`.

After the freeze, the next workstream is the **project experience / case-study system**, starting
with Software Factory: SURFACE / FLOW / SYSTEM, then architecture, topology, workflow, state and
deployment where real, then the framework applied to Kıvılcım, JointLedger and DropSpot.


---

## Frozen areas

Do not restart or redesign these without evidence of an actual regression in current artifacts:

- Kıvılcım strong spatial composition
- `SYSTEMS` intact typography
- `SYSTEMS` surface-opening / underlying-system concept
- black geometric transition
- deterministic bidirectional black-transition state machine
- main spatial/diagonal route identity
- `UNDERNEATH` core direction

---

## Validation state

Last full validation: **V11 desktop system gate, 2026-09-01** (Node 22.23.2 / pnpm 11.17.0),
against the tree committed in this pass.

| Gate | Result |
|---|---|
| typecheck | pass |
| lint | pass — 0 errors, 0 warnings |
| prettier | pass on every file changed in this pass |
| unit tests | **500 / 500**, 20 files |
| production build | pass — 15/15 pages |
| Chromium E2E | **214 / 214** |
| WebKit E2E (V11) | **213 / 214** at --workers=2; the one failure is the pre-existing skip-link |
| Focus isolation | **0px neighbour intrusion in all 25 cells** (5 destinations x 5 viewports); 669-1055px clear between projects |
| Motion sharpness | transform scale over text **1.0000 at every viewport** (was 0.74 / 0.87 / 0.83 at 1366 / 1440 / 1536) |
| Zoom-out | 1 scene at 1920@100%, 2 at 90%, 2 at 2560@100%, **4 at 2560@50%** |
| Scroll ceiling | route 728px/s, lower page 767px/s under hard input — one model, both bounded (lower page was previously uncapped) |
| Wheel-intent coast | **496px / 0.57vh / 0.6s** after input stops (was 2827px / 3.27vh / 5.6s) |
| Reverse latency | **1 notch, 0px wrong-way, 106ms** (was 7 notches, 484-506px, ~1100ms) |
| Plane grammar | lead 54-70px -> **0px at focus** -> trail 90-102px, trail>lead at all four projects and four viewports |
| WebKit E2E | 211 / 214 at `--workers=2`; two pass in isolation in ~1s, one is the pre-existing skip-link failure — see below |
| Responsive matrix | 6 desktop viewports + 80% / 67% zoom: **0 horizontal overflow, 0 console errors** |
| Mobile matrix | 320 / 360 / 375 / 390 / 430 / 768: 0 overflow, 0 console errors |
| Browser zoom | 90% / 100% / 110% / 125% at 1920×1080, plus 2560×1440 at 100% and 50%: 0 overflow, 0 console errors |
| Dead scroll | step-and-settle probe: **0 dead runs** (was 3). Natural wheel input: one 41px run, the intentional black occlusion |
| CTA end-hold | instrumented: 133 ticks to traverse, **1 stall** (inside the occlusion), document at true max scroll — **not dead scroll** |

**WebKit, stated precisely.** WebKit has no GPU process on this machine and renders in software,
achieving ~14fps against Chromium's ~45 on the same build. Several spatial tests wait for the
camera to *arrive* after a scripted scroll, and arrival is governed by a bounded per-frame budget
(D-021 item 5) — so wall-clock settle time is a function of frame rate: measured, the same 3000px
jump settles in 5.3s on Chromium and 10.0s on WebKit. The project's per-test budget was therefore
raised to 120s. Not one assertion or threshold was relaxed.

Two failures remain at `--workers=2`, and the failing set *varies between runs*, which is the
contention signature rather than a contract signature:

- `shell.spec.ts` skip-link — **pre-existing**, unrelated to this pass.
- `spatial.spec.ts` break-rail sweep — passes in isolation in 24.9s; it is a 17-sample settle
  sweep and is the most contention-sensitive test in the suite.

At full parallelism (5 workers) WebKit reports 6 failures; every one of them passes serially. The
honest reading is that WebKit results on this machine are only trustworthy at `--workers=2` or
lower.

**V9 classification (§23), against the three categories the brief names:**

| Category | Verdict |
|---|---|
| A — genuine product defect | **none.** No WebKit failure in this pass reproduced as a product fault. |
| B — deterministic test-design problem | **two, both fixed, neither by weakening.** The SYSTEMS settle helper trusted four stable polls and read a mid-crawl value at 14fps (now six after ten). The depth-plane contract selected planes positionally and broke when a non-plane element entered the frame — now by `[data-camera-plane]`, with every plane labelled and a second test asserting the population so it cannot pass vacuously. |
| C — environment / software-render contention | **the remainder.** The failing set varies between runs; in the V9 run two failed at `--workers=2` and both passed in isolation, in 1.1s and 0.7s. |
| Pre-existing, unrelated | `shell.spec.ts` skip link, which reproduces in isolation and predates V5. |

**Recommended CI configuration:** run WebKit at `--workers=2` or lower on any runner without GPU
acceleration, or at full parallelism on a GPU-enabled runner. Chromium is unaffected at any worker
count.

One assertion helper was strengthened, not relaxed: the SYSTEMS surface-opening test required four
proven-stable polls before trusting a sample, and at 14fps four repeats are reachable *mid-crawl* —
it read a value from the middle of the journey (783px) and reported it as a surface that had failed
to open. Six repeats after at least ten polls now makes a false settle require six consecutive
starved frames. Chromium passed that test either way.

---

## Open defects

1. **One WebKit-only E2E failure that reproduces in isolation**, in a spec predating V5, not traced
   to any V5–V8 change, and neither weakened nor skipped:
   - `shell.spec.ts` — skip-link Tab-focus assertion.

   The former second entry here (`spatial.spec.ts` break-rail gap) is **resolved as of V8**: it now
   passes in isolation in 24.9s. It was never a geometry failure — the 30s default budget was
   expiring partway through a 17-sample governed settle sweep, which the raised WebKit budget
   covers.
2. **`format:check` reports ~146 files** purely because this machine has `core.autocrlf=true`
   while Prettier expects LF. Committed content is correct LF and git reports no change;
   `prettier --check . --end-of-line crlf` passes repo-wide. Environmental, not a repo defect.
3. **Full E2E suite is parallelism-sensitive on this machine.** At the config's default worker
   count six axe scans time out at 30s each; run singly they finish in 1.3–3.8s with **zero**
   violations. CPU contention, already documented for TASK-008 — not an a11y regression.
4. **`engines.node` inconsistency** — `package.json` declares `>=22.0.0` while the pinned
   `pnpm@11.17.0` requires `>=22.13`. Recommendation is `>=22.13.0`; **not changed**, awaiting
   owner approval.
5. **DropSpot visual acceptance is outstanding.** The V6.8-era complaints (evidence height too
   short, supporting plane arbitrarily aligned against Kıvılcım's) were addressed in V7 and
   DropSpot now measures 0.79 of the frame with zero clipping at every viewport in the V8 matrix,
   but the owner has not signed it off visually. Evidence: `docs/review/v8-responsive/index.html`.
6. **The V8 evidence bundle is ~18MB of binaries** (76 PNGs, three `.webm` recordings) committed
   under `docs/review/v8-responsive/`, against a `.git` that was 4MB before it. Committed because
   the brief asked for the recordings and sheets as deliverables; flagged because it is a permanent
   5× to repository size and moving it to a release artifact or a separate branch is the owner's
   call, not the supervisor's.

---

## Completed gates

- V5 stabilization — tests, docs, formatting (`e7fc790`, `996c7b7`).
- V5 authoritative runtime proof on the pinned toolchain (`5645e79`, `d7013f8`), including the
  Editorial Drift `calc()` interpolation question, which is **resolved**: it interpolates
  correctly, largest single step 2.5–3.2% of travel, deterministic across reloads, 0px overflow.

## Pending gates

| Gate | Model | Blocked on |
|---|---|---|
| Fable Gate 1 — desktop final art direction (DropSpot / lower homepage / CTA) | Fable 5, ultracode xhigh+workflows | V6.8 recovery, then Opus mechanical diagnosis |
| Fable Gate 2 — project experience system (SURFACE / FLOW / SYSTEM + case-study framework) | Fable 5 | Phase 4 content inventory |
| Fable Gate 3 — Software Factory flagship | Fable 5 | real architecture extraction |
| Fable Gate 4 — mobile art direction | Fable 5 | desktop structural stability |

None are open. The V12 Codex gate explicitly found no remaining pure art-direction question, so no
Fable handoff was raised. `.ai/handoffs/` holds `CODEX-GATE.md` (the V12 brief), `CODEX-RETURN.md`
(its return), `FABLE-GATE.md` and `OPUS-RETURN.md` from earlier gates.

---

## Checkpoints

| Date | Commit | Description |
|---|---|---|
| 2026-08-16 | `e7fc790` | test: cover spatial v5 stabilization contracts |
| 2026-08-16 | `996c7b7` | docs: record spatial v5 system direction |
| 2026-08-17 | `5645e79` | test: prove spatial v5 browser behavior |
| 2026-08-17 | `d7013f8` | docs: update spatial v5 verification status |
| 2026-08-28 | `dc81393` | docs: record STATE D recovery blocker (documentation only) |
| 2026-08-31 | `a54244c` | docs: record the v7 systems pass |
| 2026-09-01 | `44e0924` | feat: remove the early duplicates and give the world a height axis (V8) |
| 2026-09-01 | `5bbd391` | feat: close the homepage defects for a release candidate (V9) |
| 2026-09-01 | `4f45b6d` | feat: one governed scroll model, bounded intent, a ground that registers (V10) |
| 2026-09-01 | `9255748` | feat: the desktop system gate — isolate the focus, stop resampling the text (V11) |
| 2026-09-02 | `42798f1` | feat: close desktop spatial freeze gate (V12, independent Codex review) |
| 2026-09-02 | `0752883` | docs: record Codex desktop gate return (V12 checkpoint tip) |
| 2026-08-28 | `d7bcebc` | feat: checkpoint recovered spatial portfolio v6.8 (Ubuntu source, 33M/5A/1D) |
| 2026-08-28 | `682d54e` | merge: reconcile Ubuntu V6.8 source with Windows recovery documentation |
