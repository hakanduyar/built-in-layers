# V14.1 — final Opus engineering QA of the Fable visual correction gate

**From:** Opus 5 / High (engineering QA) · **Date:** 2026-09-06
**Verified:** `f4bdab3` — the Fable application checkpoint. Branch HEAD `ffe65ff`; the diff
`f4bdab3..ffe65ff` is the four routing documents only, so the application tree tested is exactly
`f4bdab3`'s (`git diff f4bdab3 HEAD -- . ':(exclude).ai/**'` → empty).
**Method:** a fresh production build from a cleared `.next`, served on its own ports; every number
below produced by a tool in Git (`docs/REVIEW_POLICY.md`), independently of the Fable run.

**VERDICT: PASS.** No engineering defect found; no source change made. Owner acceptance remains
the only gate. `main` is `16d3ec0`, untouched.

## 1. Protected invariants — verified independently

| Invariant | Method | Result |
|---|---|---|
| Scroll code untouched | `git diff --name-only fa7c72c HEAD` over the seven `lib/spatial` scroll modules, `SceneBreak.tsx`, `SystemsWord.tsx`, `app/` | **empty**. `SpatialCamera.tsx` carries one changed call (`scenePresence(value, mobile)`) and its comment — nothing else |
| Initial-load flash | `initial-paint-probe.mjs`, cold, 1440×900 / 1920×1080 / 1366×768 | **FIRST PAINT == SETTLED** at all three. Hero box 225.43 → 225.41px (0.02px; the probe's own test is the painted foreground, not the internal zoom) |
| Discrete scroll | `discrete-scroll-probe.mjs`, diffed field by field against `docs/review/v14.1-engineering/discrete-scroll/discrete-1440x900.json` | **Every isolated impulse identical**: 120px per notch, delivered 1.000, coast 0, in all four regions. Sustained-12 within 0.005 of the record. `lower-vertical-world` identical at every impulse count |
| Scroll geometry | same probe's `geom` | `routeStart` 61, `routeEnd` 4561, `routeSpan` 4500, `leadCapPx` 540 — **byte-identical**. `docMax` 7737 → 7806 (§3.1) |
| Continuous pacing | `scroll-contract-probe.mjs` at 1536×864 | `geom` identical to the checkpoint record (routeTop 61, routeEnd 4381, docMax 7593); routeAggressive identical (522 px/s, coast 502px, 900ms), inside the 540px lead cap |
| Reverse | same probe | **1 notch, 0 wrong-way px** |
| Frame time — route | `frame-time-probe.mjs`, 1440×900 | 17.1 / 17.9 / 17.4 ms a frame (forward-1 / forward-2 / reverse) against the recorded 17.2–17.3 baseline. At parity |
| Frame time — the new lower-page mechanism | same probe, `PROBE_SPAN=1,1.7` (past `routeEnd`, over `LowerRoute` and the per-frame `--drift-arm` width) | **16.7 ms a frame in all three traverses; 0 frames over 25ms out of 151 / 151 / 142.** No D-040-class cost |
| Mobile | `mobile-route-probe.mjs` at the recorded step, diffed against `docs/review/v14.1-engineering/mobile/metrics/mobile-route.json` | **one** differing key: `meanPxInkRows.lower` at 320×568, 0.325 → 0.324 (Fable measured 0.326 — the value varies run to run). Every scene height, document height, focus position and screen count identical: 14.1 / 12 / 12.8 / 11.6 / 11 / 10.5 screens, near-empty 0vh, unsettled 0 |

## 2. The five new implementations — runtime verification

Measured on the built page at 1440×900 (a throwaway DOM probe, removed after the run; every
assertion below is either covered by a committed guard or is a count of what the committed modules
render).

- **Route / stations (D-043).** 8 AHEAD paths and 8 TRAVELLED polylines — the number of legs with
  open travel, which is what the restated e2e guard asserts against the module itself; 4 station
  index labels. `[data-rail-group] > :not(svg)` = **0**: the D-040 reason holds at runtime.
- **Project ground (D-044).** All four floors present. `scaleX` is **0.000 at rest far from the
  scene and 1.000 at every project's own focus** (software-factory, kivilcim, jointledger,
  dropspot), with the plane at 0.84–1.00 presence — "laid by acquisition" works end to end.
- **Evidence detail (D-045).** Three windowed plates, each clipped by its frame, each captioned
  `Detail: …`, each with INSPECT: magnification 1.08× (delivery loop), **1.78×** (Kıvılcım's
  on-device core), 1.16× (JointLedger). DropSpot's two real screenshots are **not** windowed
  (0.99× / 0.98×) and carry no prefix — the owner's V7 decision intact.
- **Strata / lower page (D-046, D-047).** Recess present; lower rail present (2311px) with 4
  stations at the four registers, 4 registers, arms of 122 / 67 / 166 / 159px (each block's own
  drift, non-zero and different), the travelled rail animating (`scaleY` 0.85 mid-page), 5 station
  glyphs in Selected Systems, the finale map's tail present.
- **SceneBreak.** File byte-identical to `fa7c72c`; present and rendering at runtime. **Not
  re-authored — owner decision, per the brief.**

Console errors during the whole traversal: **0**.

## 3. Findings — none blocking, none fixed (no defect)

### 3.1 The document is 69px taller at 1440×900 — a composition change, not a scroll change

`docMax` 7737 → 7806. The pinned world is untouched (`routeSpan` 4500, `routeStart`/`routeEnd`
identical), and the lower page is scrolled 1:1 (delivered 1.000, 120px per notch, coast 0 at every
impulse count), so this is 0.6 of a wheel notch of extra page, produced by the sanctioned lower-page
composition changes (About's spacing, the How I Build rows). Recorded here because the Fable
handoff's §6 does not mention it.

### 3.2 Two numbers to read with care

- **CLS on `/` measures 0.0418** (well inside the "good" band; every other route 0.0000). The V14-era
  record cited ≤0.0388. Neither the current `STATE.md` nor the Fable handoff claims a CLS figure for
  this checkpoint, so nothing is contradicted — but the honest number for this build is 0.0418.
- **`V14_1_FABLE_TO_OPUS.md` §5 says the cut has "seven `data-break-rail` bars".** The DOM has
  **11** (`SECTION_RULES` plus the contact bundle). `SceneBreak.tsx` is byte-identical to `fa7c72c`
  and to the V4 freeze, so this is a description error about untouched code, not a regression. The
  Fable handoff is left as its own record; the correction lives here.

### 3.3 Observations on test strength (not defects, not changed)

- The restated rail assertion counts `[data-rail-ahead]` against
  `routeLegs().filter(legHasOpenTravel).length` — derived from the same module the component
  renders from. It therefore verifies DOM-vs-module **consistency** (it would catch a leg that
  failed to render) rather than pinning a literal, which is the convention this file already uses
  for `railCount`. The D-040 intent — no positioned HTML in the rail group — remains asserted
  literally. Worth a lower bound if the file is next opened for a substantive reason; not worth
  churn now.
- `Figure`'s `Detail:` caption prefix is emitted from the `detail` prop while the window itself also
  needs `readIntrinsicDimensions(src)` to resolve. All three assets resolve today (verified: all
  three are windowed and clipped), so the two can only disagree if an asset's dimensions became
  unreadable. Latent, not live.

## 4. Full acceptance validation — run once, on this build

| Check | Result |
|---|---|
| typecheck | **PASS** (0) |
| lint | **PASS** (0) |
| format:check | **PASS** (0) |
| unit | **PASS** — 562/562, 29 files |
| production build | **PASS** — fresh, from a cleared `.next` |
| Chromium e2e | **PASS** — 224/224 |
| WebKit e2e | **220/224 — the documented baseline set, reproduced exactly**: `shell.spec.ts:35` skip-link Tab default, `spatial.spec.ts:266` focus re-centre, `spatial-v5.spec.ts:384` surface opens monotonically, `spatial.spec.ts:321` break rails close. The last two are the cut-region arrival cases the Opus V14 QA reproduced on the **baseline** build; the remedy is the tests' arrival detection (`OPUS-V14-QA-RETURN.md` §6.2), deliberately not taken here |
| console / runtime | **PASS** — 10 content routes: noise 0. 6 messages on the 404 route only (pre-existing, documented) |
| hydration | **PASS** — 0 on all 11 routes, the 404 included |
| CLS | **PASS** — max 0.0418 on `/` (good); every other route 0.0000 |
| images | **PASS** — 0 broken / 0 unsized / 0 empty-alt |
| overflow | **PASS** — 0 of 99 route × width combinations |
| scene fit | **PASS** — clear at 1366 / 1440 / 1536 / 1920 / 2560; worst clearance −42px (Kıvılcım at 1440). Reproduces the checkpoint record exactly |
| accessibility | **PASS** — the axe suite (7 tests) inside the Chromium 224 |
| first paint | **PASS** — §1 |
| scroll regression | **NONE** — §1 |
| frame time | **PASS** — §1, including the new lower-page mechanism |
| mobile smoke | **NONE** — §1 |

## 5. State

- Application tree tested: `f4bdab3` (tree `80cc777`); branch HEAD `ffe65ff` + this return.
- `local == origin` verified after push. Working tree clean except the intentional untracked
  `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle`.
- `main` = `16d3ec0`, untouched. Nothing merged.
- The three owner-pending mobile deltas (`OPUS-V14-QA-RETURN.md` §6.1) **remain PENDING** — this
  gate neither changed nor decided them.
- The SYSTEMS → UNDERNEATH `SceneBreak` black-frame behaviour is an **owner decision** and was not
  re-authored.

**NEXT:** the owner's review of `docs/review/v14.1-fable/README.md`. That is the only acceptance;
no model declares FREEZE, OWNER ACCEPTED or READY TO MERGE.
