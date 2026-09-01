# AUTONOMOUS STATUS

Single source of truth for machine-readable project state. Conversation history is **not** the
source of truth — this file is. Updated at every checkpoint and every gate.

_Last updated: 2026-09-01 (V9)_

---

## Current state

| Field | Value |
|---|---|
| **Status** | V9 HOMEPAGE RELEASE CANDIDATE — validated, committed and pushed. Homepage recommended for FREEZE; next workstream is the case-study system |
| Current branch | `feature/spatial-portfolio-v5` |
| Current HEAD | `44e0924` (V8 responsive world pass) |
| Latest origin commit | `44e0924` on `feature/spatial-portfolio-v5` (local == origin); `16d3ec0` on `main`, untouched |
| Remote | `https://github.com/hakanduyar/built-in-layers.git` (renamed from `portfolio.git`) |
| Working tree | clean |
| Current phase | V9 (owner brief): homepage finalization — stale facts, dead run, pacing, affordance, About/Field Notes, CTA |
| Source state | **RESOLVED** (was STATE D) — V6.8 checkpoint `d7bcebc`, merged with `dc81393` at `682d54e`; see `docs/AUTONOMOUS_RECOVERY_STATUS.md` section 0 |
| Last checkpoint commit | see §"Checkpoints" below |
| Pending Fable gate | none open — Gate 1 executed; `.ai/handoffs/OPUS-RETURN.md` written. Gates 2–4 not yet raised |
| Current visual artifacts | `C:\Users\hakan\portfolio-review\v9\` (stills across six desktop viewports plus 80% / 67% zoom); metrics in `docs/review/v9-release/metrics/`. Policy: `docs/REVIEW_POLICY.md` |

## Next action

**Owner visual review, then FREEZE the homepage.** Stills for every scene and landmark are in
`C:\Users\hakan\portfolio-review\v9\` at six desktop viewports plus 80% and 67% zoom; the
measurements behind every claim are in `docs/review/v9-release/metrics/`.

Three things are the owner's judgement rather than another engineering pass:

1. **Neighbouring scenes are visible at focus** at viewports wider than the 1440 reference. They do
   not overlap — this is the "zooming out reveals more of the same world" behaviour D-022 was asked
   for, and hiding them again would mean widening the whole route. Left as is, deliberately.
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

Last full validation: **V9 homepage release candidate, 2026-09-01** (Node 22.23.2 / pnpm 11.17.0),
against the tree committed in this pass.

| Gate | Result |
|---|---|
| typecheck | pass |
| lint | pass — 0 errors, 0 warnings |
| prettier | pass on every file changed in this pass |
| unit tests | **500 / 500**, 20 files |
| production build | pass — 15/15 pages |
| Chromium E2E | **214 / 214** |
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

None are open. No handoff exists in `.ai/handoffs/`.

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
| 2026-08-28 | `d7bcebc` | feat: checkpoint recovered spatial portfolio v6.8 (Ubuntu source, 33M/5A/1D) |
| 2026-08-28 | `682d54e` | merge: reconcile Ubuntu V6.8 source with Windows recovery documentation |
