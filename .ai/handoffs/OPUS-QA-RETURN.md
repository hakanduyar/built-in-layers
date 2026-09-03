# OPUS FINAL ENGINEERING QA — V13 FABLE CHECKPOINT

| | |
|---|---|
| Reviewer | `claude-opus-5`, effort High — independent; wrote none of the reviewed work |
| Reviewed SHA | `26836bae274a54f634f30d6ed6b840c74f64e77f` (committed checkpoint) |
| Parent | `76c5660511a38386a5dd099ee7ce2903d876c3ae` (verified hero-clipping fix) |
| Frozen V12 baseline | `243db3934d634f2c39d339cd2a267c01d86be2bd` |
| `main` | `16d3ec0d8c7022d5b2b7b05198f8c752ef1308a6` — untouched |
| Branch | `feature/project-architecture-v13` |
| Follow-up pushed by this QA | `742ecf5` — `docs/FROZEN_BOUNDARY.md` §5 ledger (§6.1), plus the commit carrying this file. Documentation only; no source, test or assertion touched. |
| Date | 2026-09-03 |
| **Verdict** | **PASS WITH DOCUMENTED NON-BLOCKERS** |

Every number below was measured by this session on its own clean build. No figure was taken from
`.ai/handoffs/FABLE-RETURN.md` on trust; where a claim is confirmed, it is because it was
re-measured and agreed.

---

## 1. Repository and scope

| Check | Result |
|---|---|
| `feature/project-architecture-v13` local == origin | ✅ both `26836ba` |
| `main` local == origin | ✅ both `16d3ec0` |
| `feature/spatial-portfolio-v5` local == origin, still frozen | ✅ both `243db393` |
| `main` moved locally at any point | ❌ never — its reflog has exactly one entry, the original clone |
| `feature/spatial-portfolio-v5` moved since the freeze | ❌ its last reflog entry is the V12 checkpoint commit itself |
| History rewritten / force-pushed | ❌ `243db393` and `16d3ec0` are both ancestors of `26836ba`; linear, 50 commits ahead of `main` |
| Checkpoint size | 52 files, 11169 insertions, 142 deletions — matches the claim exactly |
| `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` | present, untracked, untouched |
| `git fsck` | no corruption (dangling objects only, expected from the V12 bundle import) |

**Everything intended is committed.** The only working-tree modifications are three launcher-owned
files — `.ai/orchestrator/AUTONOMOUS_PIPELINE.log`, `.ai/orchestrator/state.json`,
`docs/AUTONOMOUS_STATUS.md` — whose content describes *this* QA stage, not the Fable pass. They are
the orchestrator's live state and were deliberately left alone.

### Concurrent-writer residue — none found

The other session reverted four files at 06:16:42 local, which Fable restored by transcript replay.
Verified independently:

- `components/spatial/SpatialProjectScene.tsx` is committed at blob `34b48d5`, the hash recorded
  before the revert.
- No merge/conflict markers in any of the 52 changed files.
- No duplicated exports in the four restored files (`Figure.tsx` 1, `ProjectNeighbours.tsx` 2,
  `app/work/[slug]/page.tsx` 3, `SpatialProjectScene.tsx` 1) — no half-applied or double-applied edit.
- No test exists without its implementation: every string the new tests assert was traced to
  `content/work/*/index.mdx` frontmatter (§5) and every new component the tests import exists.
- No session scratch residue in the repository: `git status --ignored` shows no `.scratch/`,
  and `test-results/` and `playwright-report/` are correctly git-ignored.
- The whole tree typechecks, lints, tests, builds and passes 216/216 Chromium e2e — a partially
  restored tree could not.

---

## 2. Frozen V12 boundary

`docs/FROZEN_BOUNDARY.md` §4's loop, run against `243db393`, prints **exactly five** `MOVED:` lines
and nothing else. Thirty files exist under the three frozen directories at both ends — none added,
none removed.

| File | frozen blob | committed blob | first moved in | visual reason stated | before/after measurement |
|---|---|---|---|---|---|
| `components/spatial/SpatialExperience.tsx` | `fa941e8` | `8568129` | `76c5660` | ✅ finding A | ✅ §11.3 A + `metrics/final/hero-unit.txt` |
| `lib/spatial/projectGround.ts` | `aa159e9` | `6431139` | `26836ba` | ✅ finding B / D-028 | ✅ §11.3 B (153–213 → 42–59 px) |
| `components/spatial/SpatialProjectScene.tsx` | `edb9cd4` | `34b48d5` | `26836ba` | ✅ finding C | ✅ §11.3 C (clearance 23/0/4/16/243 → 62/44/46/67/376) |
| `components/sections/HowIBuild.tsx` | `a48126a` | `2d90924` | `26836ba` | ✅ finding E | ✅ §11.3 E (rule 40 → 331/347 px; gap 322–338 → 31) |
| `components/sections/SelectedSystems.tsx` | `751aa48` | `592b79e` | `26836ba` | ✅ finding E | ✅ §11.3 E (label offset 77–80 → 0 px) |

The set is exactly right, the commit attribution is exactly right, and all four of this
checkpoint's moves carry both a stated visual reason and a before/after number. **No unjustified
frozen-file change.**

Each diff was read in full and is confined to the lines its finding names. `resolveDown` /
`resolveUp` are untouched as functions; in the foundation variant `resolveDown` moved from the
plate's wrapper onto the ground-source element itself — it is a pure `translate3d`, and
`getBoundingClientRect` already included ancestor transforms, so the ground's measured box is
unaffected. The nine-column decision holds its frozen contract: `spatial.spec.ts:193` (first tour
image > 648 px at 1440) passes in **both** browsers.

---

## 3. Validation re-run by this session — measured, not accepted

Clean tree, single writer, own production build served on :3100 (no foreign process on that port).

| Check | Claimed | **Measured here** |
|---|---|---|
| `pnpm typecheck` | 0 | **exit 0** |
| `pnpm lint` | 0 errors | **exit 0, no output** |
| `npx prettier --check` on all 17 changed source/doc files | clean | **"All matched files use Prettier code style!"** |
| `pnpm test` | 527/527 | **527 passed, 24 files, exit 0** |
| `rm -rf .next && pnpm build` | 15 routes | **exit 0, 15 routes**, build `D__P2RP1vJ0Gd0jKwzf44` |
| Route smoke | — | 10 routes 200, `/nope` 404 |
| `playwright --project=chromium --workers=2` | 216/216 | **216 passed (2.5m), 0 failed** |
| `playwright --project=webkit --workers=2` | 211/216 | **211 passed, 5 failed** — §4 |

Every claimed number reproduced exactly.

---

## 4. WebKit — the pre-existing claim, verified rather than trusted

This was the gate's main open engineering question. It was tested, not accepted.

**Method.** A detached worktree at parent `76c5660` (`git worktree add --detach`, no branch
touched), its own `pnpm install --frozen-lockfile` and its own production build
(`LGJlN6mHc7hhK1F4KxQcM`), served on the same port 3100 after the checkpoint server was stopped —
so both runs saw identical browser, worker count, machine and port. The baseline server was
confirmed to be serving pre-checkpoint code (no record row, no AI-disclosure block on
`/work/kivilcim`). The four spec files containing the five failures are **byte-identical** between
`76c5660` and `26836ba` (only `work.spec.ts` changed, and none of the five live there).

**Result — the failure set and every received value are identical.**

| Spec | Assertion | Checkpoint `26836ba` | Baseline `76c5660` |
|---|---|---|---|
| `home.spec.ts:63` | h1 after "See all notes" | Expected `"Notes"`, received `"Hakan Duyar"` | **identical** |
| `shell.spec.ts:35` | skip link focused | Expected focused, received `inactive` | **identical** |
| `spatial-v5.spec.ts:384` | surface open at end `< 60` | received `783.360005` | **identical** |
| `spatial.spec.ts:265` | link re-centred into viewport | received `viewport ratio 0` | **identical** |
| `spatial.spec.ts:320` | break-rail gap `< 80` | received `1440` | **identical** |

Baseline run: **5 failed / 84 passed**. Same five, no more, no fewer.

**Independent corroboration from the repository's own history**, predating V13 entirely:

- `docs/DESIGN_SYSTEM.md` §19.13 records `shell.spec.ts`'s skip-link and `spatial.spec.ts`'s
  break-rail gap as WebKit-only failures **in specs that predate V5**, never traced to a V5 change,
  never weakened or skipped.
- `docs/AUTONOMOUS_STATUS.md` records that WebKit here has no GPU process and renders in software
  at ~14 fps against Chromium's ~45, that the failing set *varies between runs* (a contention
  signature), and — decisively — that **`783` is the value a starved WebKit reads mid-crawl** from
  the surface-opening probe. The constant Fable flagged is the already-documented artefact.
- `1440` is exactly the viewport width, i.e. the rail never moved at all, and `viewport ratio 0`
  means the scripted scroll produced no movement. Both are consistent with "the scripted scroll is
  not executed", not with a geometry defect.

Chromium passes all five (`spatial.spec.ts:265`, `:320` and `spatial-v5.spec.ts:384` all green in
my 216/216 run).

**Classification: ENVIRONMENT, pre-existing, not a product regression. Not a FAIL.** No assertion
was weakened, skipped or retried into passing by anyone, and none was weakened here.

---

## 5. Quality — case study, tests, artifacts, documentation

**The case-study implementation is coherent.** `CaseStudyHero` reads only validated frontmatter;
the lead plate is chosen by `representativeAsset()` — the same function the spatial scene uses — so
the plate the reader arrives from is the plate the destination opens with, with no new asset and no
per-project markup. The record's vocabulary matches `DESIGN_SYSTEM.md` §33.6's five fields exactly
(provenance · phase · access · record · stack), including the "no value, no row" rule. Preview-depth
routing is correct: `software-factory` and `professional-systems` are `depth: preview`, so
`isCaseStudyDestination` is false and both render a `Work index` nav to `/work`; the three
destinations render `Case study navigation`. Verified in the served HTML.

**Type-scale claims are arithmetically exact.** `--text-display-l: clamp(2.25rem, 5vw, 4rem)` gives
36 px at 375, 38 px at 768, 51 px at 1024, 64 px at 1280/1440/1920 — precisely D-029's consequence
line. The prior `--text-heading-l` clamp gives the stated 40 px.

**No invented facts.** Every contribution and AI-disclosure string rendered and asserted was read
back out of `content/work/*/index.mdx` frontmatter and matches verbatim. `aiAssisted` is true only
for Kıvılcım and Software Factory, and only those two render a disclosure. Content is untouched by
this checkpoint; the only content change since the freeze is D-027's removal of three `nextSlug`
fields. Professional Systems' contribution remains its honest pending-approval placeholder.

**The new tests are meaningful, not tautological.** `case-study-hero.test.tsx` renders the real
published content and asserts the frontmatter sentences verbatim, that the disclosure appears *only*
where declared, and that no phase row is invented where no phase exists. `project-ground.test.ts`
adds a genuine geometric assertion (bottom == evidence bottom + one `blockPadding`, and that a
ceiling-clamped ground never lifts above its evidence) rather than restating the constant.

**The three moved contracts are stated moves, not weakenings**, and one is a tightening:
- `project-ground.test.ts` visuals re-derived from the build; the Kıvılcım floor `> 0.49 → > 0.44`
  because the new derivation yields 0.442 — the stated arithmetic checks out.
- `jointledger-content.test.tsx` `text-heading-l → text-display-l` — the measured defect.
- `work.spec.ts` image locators scoped from `main` to `getByRole("tabpanel")` — strictly *narrower*
  than before, required because the hero now also renders the representative asset. Two tests added.

**The artifacts correspond to the current code.** The committed probe was re-run against my own
build and diffed against the committed metrics:

| Comparison | Values compared | Differences |
|---|---|---|
| `metrics/final/fable-gate-all.json` → `work` (1366, 1440, 1920 × 5 routes) | 105 | **0** |
| `metrics/final/fable-gate-work.json` (375, 768, 1024, 1280 × 5 routes) | 140 | **0** |

245/245 measured values reproduce exactly. Every out-of-repo path cited by D-028/D-029 exists, and
the FINAL matrix holds exactly the 230 stills §11.2 claims. Artifact placement complies with
`docs/REVIEW_POLICY.md`: metrics and 28 decision-bearing stills in git, full matrices outside, no
`.webm`.

**Nothing is asserted in docs that the code does not do** — with one exception, now fixed (§6.1).

---

## 6. Issues, classified

### 6.1 DOCUMENTATION — `docs/FROZEN_BOUNDARY.md` did not record the five sanctioned moves — **FIXED**

The governing boundary document had not been touched since `f85b166` (2026-09-02). It declared a
30-blob boundary and a §4 check whose output it calls a regression signal — but five blobs have
since legitimately moved, and the document recorded none of them. Anyone running its own procedure
got five `MOVED:` lines with no explanation *in the document that defines the boundary*, while the
justification lived only in `FABLE-RETURN.md` and `DECISIONS.md`. Under `CLAUDE.md` §1 that is a
source-of-truth conflict. Its §3.1 also still posed a "ruling required" question that D-027 had
already settled.

**Fixed here**, as documentation only: a new §5 ledger listing each of the five moves with its
granting decision and evidence pointer, a §1 preamble note, a §4 cross-reference, and the §3.1
resolution recorded. The §1 fingerprints are deliberately left at their `243db393` values — they are
what §4 compares against, and rewriting them would erase the boundary. No policy was changed, no
threshold moved, nothing weakened.

### 6.2 ENVIRONMENT — five WebKit failures (non-blocking, carried forward)

Proven pre-existing at `76c5660` value-for-value (§4) and documented in this repository back to V5.
Software-rendered WebKit on this machine starves the governed scripted scroll. Worth the one
engineering look Fable recommends — a WebKit-specific scroll driver or a fps-aware settle helper —
but it is not a defect of this checkpoint and not an art-direction item.

### 6.3 ENGINEERING — three `<nav>` landmarks share `aria-label="Primary"` (non-blocking, pre-existing)

Every route renders three navs labelled `Primary` (desktop header, mobile trigger, mobile panel).
Duplicate landmark labels are a wayfinding smell for screen-reader users. **Not introduced by this
checkpoint** — `components/layout/` is untouched by the entire diff — and axe reports zero
violations on all ten routes. Out of this gate's scope; recorded for a future accessibility pass.

### 6.4 DOCUMENTATION — the repo-wide Prettier "debt" is mostly a CRLF artefact (non-blocking)

`FABLE-RETURN.md` §9.9/§11.9 carries forward "100+ pre-existing files" of `prettier --check .` debt
without noting what `docs/AUTONOMOUS_STATUS.md` already records: this machine has
`core.autocrlf=true` while Prettier expects LF, so the committed content is correct and git reports
no change. The figure overstates a real problem. Left as-is — it is Fable's own return document and
the substance (only changed files were checked, and they are clean) is accurate and was verified.

### 6.5 ENGINEERING — `humanise()` duplicated (trivial, no action)

The three-line display helper exists in both `components/project/CaseStudyHero.tsx` and
`lib/spatial/systemPov.ts`. The hero's comment explains the locality deliberately (the homepage
counterpart is a frozen file). Noted only; extracting it would be an unrequested refactor of frozen-
adjacent code.

### 6.6 ART-DIRECTION — one pass-1 directive not carried into pass 2 (for Fable, not fixed here)

Pass 1 §4 D.7 asked for the decisions' *alternatives* to be set as a list rather than a comma join.
`DecisionList.tsx` still joins with `", "`. This is **not** a documentation defect: D-029 does not
claim it was done, so nothing asserted is false. It is an open art-direction judgement and is
therefore recorded for return to Fable rather than fixed here.

---

## 7. Accessibility and runtime integrity

| Check | Result |
|---|---|
| Console errors, 10 routes × 1440/1920, each scrolled to full page height | **0 across 20 page loads** |
| Console errors during the probe, 5 case-study routes × 7 viewports | **0 across 35 page loads** |
| axe, default state, all 9 routes + 404 (Chromium suite) | zero violations |
| axe, interactive states (mobile nav, layer explorer tabs, keyboard focus) | zero violations |
| Heading order on all five `/work/*` routes | `h1 → h2` only; no skipped level |
| Exactly one `h1` per route | ✅ |
| Nav landmarks on case-study routes | `Case study navigation` on the three destinations, `Work index` on the two previews — distinct and correct |
| Horizontal overflow | none at 320/375/768/1024/1280/1366/1440/1920 (e2e + probe agree) |
| Keyboard focus, reduced motion, no-JS | covered green in the 216/216 Chromium run |

---

## 8. Verdict

Repository consistency ✅ · typecheck ✅ · lint ✅ · Prettier on changed files ✅ · unit 527/527 ✅ ·
clean build 15 routes ✅ · Chromium e2e 216/216 ✅ · runtime integrity (0 console errors) ✅ ·
frozen V12 boundary intact and every move justified with measurement ✅ · coherent case-study
implementation ✅ · artifacts corresponding to current code (245/245) ✅ · no concurrent-writer
residue ✅ · `main` untouched ✅.

The one defect found was documentary and is fixed. The remaining items are an environment condition
proven pre-existing by direct experiment, two pre-existing engineering notes outside this
checkpoint's diff, and one open art-direction judgement returned to Fable.

**OPUS FINAL QA: PASS WITH DOCUMENTED NON-BLOCKERS**
