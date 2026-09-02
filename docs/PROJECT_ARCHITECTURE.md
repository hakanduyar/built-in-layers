# PROJECT ARCHITECTURE — CURRENT, TARGET, GAP

Companion to [`docs/PROJECT_INVENTORY.md`](PROJECT_INVENTORY.md). The inventory records what is
there; this document maps how it fits together, what it should become, and what stands between the
two.

- Branch: `feature/project-architecture-v13`
- Base commit: `243db3934d634f2c39d339cd2a267c01d86be2bd` (frozen V12 tip)
- Status: **Slice 0 and Slice 1 IMPLEMENTED** (`78bf8305`), reviewed twice by independent Codex
  (`gpt-5.6-luna`/xhigh): the proposal at `499e7d8` and the implementation at `1bea2aa`, both
  ACCEPT WITH CHANGES. Returns in `.ai/handoffs/CODEX-ARCH-RETURN.md` and
  `.ai/handoffs/CODEX-SLICE-RETURN.md`. Every open policy question was answered by the owner on
  2026-09-02 and is recorded in **D-027**.
- **Acceptance criteria are still NOT frozen** — the second review requires the defects it found to
  be fixed and the full browser suite re-run first.

> **Reading order.** Sections 1–5 below were written *before* implementation and are kept as the
> record of how the decision was reached, with corrections marked inline. Where they describe
> something as proposed or undecided, **D-027 is now authoritative.** What actually shipped:
> `order` is one global unique sequence, `sortByOrder` replaced `sortByTierThenOrder`,
> `nextSlug` is gone, and `getCaseStudyNeighbours` derives both directions for projects whose
> `depth` is `full` or `short`.

---

## 1. CURRENT architecture

### 1.1 The content pipeline

```
content/work/<slug>/index.mdx        frontmatter + body
content/work/<slug>/{surface,flow,system}.mdx   layer bodies (full/short only)
        │
        ▼
lib/content/schemas.ts               Zod parse + superRefine conditional rules
        │
        ▼
lib/content/work.ts                  parseAllProjects → filter status:published
        │                            → validatePublicationGates (THROWS on failure)
        │                            → sortByOrder  [was sortByTierThenOrder; see 1.2]
        ▼
lib/content/validate.ts              layer length ≥400, layer similarity ≤0.6,
        │                            required h2 sections by depth, asset extension allow-list
        ▼
┌───────────────────┬─────────────────────────┬──────────────────────────┐
│ app/page.tsx      │ app/work/page.tsx       │ app/work/[slug]/page.tsx │
│ spatial homepage  │ tier-grouped index      │ case study               │
│ (FROZEN — V12)    │                         │                          │
└───────────────────┴─────────────────────────┴──────────────────────────┘
```

Two properties of this pipeline are worth stating plainly, because they constrain everything below:

**It fails closed.** `getPublishedProjects()` throws and breaks the build if any *published*
project fails a gate (`lib/content/work.ts:141-147`). Drafts are filtered out *before* gates run, so
incomplete work can exist in the tree without blocking a build. Any change that adds a required
field to an existing published project is therefore a build-breaking change, not a soft one.

**`depth` is the master switch.** It selects required h2 sections
(`lib/content/validate.ts:137-142`), whether `layers` is required (`schemas.ts:134`), whether ≥3
decisions are required (`schemas.ts:142`), whether layer files are read at all
(`work.ts:128`, `work.ts:197`), and the case-study affordance label on the frozen homepage
(`components/spatial/SpatialProjectScene.tsx:115`). Raising a project's depth is the single act
that upgrades it end to end — and the single act that can break the build if the content is not
there first.

### 1.2 Ordering — the defect

Three consumers order the same five projects, from **two** sources:

| Consumer | Source | Result |
|---|---|---|
| Frozen spatial homepage | scene ids in `lib/spatial/scenes.ts` | SF → Kıvılcım → JointLedger → DropSpot |
| `/work` index | global `order` sort, then tier grouping | SF(0) → Kıvılcım(1) → JointLedger(2) → DropSpot(3) → Professional(4) |
| Case-study "next project" | hand-written `nextSlug` | Kıvılcım → DropSpot → JointLedger → Professional; SF and Professional carry no `nextSlug` |

The first two agree. The third disagrees with both, and the flagship has no onward link.

**Corrected after independent review — `sortByTierThenOrder` does not sort by tier.** Its body is
`sort((a, b) => a.order - b.order)`: a single global sort on `order`, ignoring tier entirely. Tier
grouping happens separately in `app/work/page.tsx` via `getProjectsByTier`. The function name
asserts a two-key ordering the code does not implement — a naming defect in its own right, and the
reason this map originally described the pipeline incorrectly.

**Ordering semantics are therefore undefined in one respect:** nothing specifies what `order` means
*across* tiers, or how ties break. Any derived-neighbour implementation must state this explicitly
rather than inherit it.

---

## 2. TARGET architecture

The target changes **structure, not direction**. The frozen V12 homepage, the schema's honesty
model, and the fail-closed gates are all kept as they are.

### 2.1 One ordering, derived

`order` becomes the sole ordering source. Case-study navigation derives next/previous from the
published, sorted list rather than from a hand-maintained field.

```
getPublishedProjects()  →  sorted by `order` (global), gated for uniqueness
        │
        └── getCaseStudyNeighbours(slug) → { previous, next }   [lib/content/work.ts]
                                                  │
                                                  ▼
                              app/work/[slug]/page.tsx → ProjectNeighbours
```

`nextSlug` is then removable from the schema and from the **three** entries that carry it —
Kıvılcım, JointLedger, DropSpot — plus the fixture
`tests/fixtures/content/work/delta-full/index.mdx`. (Corrected: it was never on all five.) This
satisfies "no duplicate source of truth for project content" (`CLAUDE.md` §8), executes D-021's
already-accepted "`order` … single source of truth", and makes F2 unrepresentable rather than
merely fixed.

The derivation must define, explicitly and testably: whether neighbours are global or within-tier,
what happens at the first and last entry, and how equal `order` values break ties.

### 2.2 A depth ladder that matches position — OWNER-APPROVED AS ROLES, NOT A RIGID LADDER

> **Independent review ruling:** this was an **invented hard rule** — the per-depth *requirements*
> are grounded in `CONTENT_MODEL.md`, but the mapping from *prominence* to *required depth* was not.
>
> **Owner ruling, 2026-09-02 — superseding the table below.** Approved as three publication
> **roles**, explicitly *not* as a rigid ladder: FLAGSHIP (Software Factory), CORE PROJECT
> (Kıvılcım, JointLedger, DropSpot), PREVIEW / PROFESSIONAL INDEX (Professional Systems).
> Prominence sets editorial priority, **not permission to invent content — evidence availability
> always overrides desired depth.** Strict evidence parity (§2.3) and strict per-project test
> parity (§2.4) were both **REJECTED** in favour of *evidence fitness* and shared framework tests
> plus risk-based project tests.

The originally proposed rigid rule, kept for the record and **not** in force:

| Position | Required depth | Implies |
|---|---|---|
| Flagship (scene 01) | `full` | 3 layer files, ≥3 decisions, 5 h2 sections |
| Featured system | `short` or `full` | 3 layer files, 3 h2 sections |
| Placeholder / unverified | `preview` | no requirement; must not occupy a featured scene alone |

Under this rule Software Factory must reach `full`, or the flagship position must move. Both are
real options; choosing between them is an owner decision, not an engineering one, because it
depends on facts only the owner has (`PROJECT_INVENTORY.md` §3 UNKNOWN 1–2).

### 2.3 Evidence parity

Each featured project should carry at least one `real-screenshot` where a running state exists, or
state explicitly that it cannot. The typing system already supports this
(`ProjectImageAssetTypeSchema`); only the content is missing. No asset may be fabricated — a project
with no publishable running state keeps diagrams and says so.

### 2.4 Coverage parity

Every featured project gets a content suite and an asset suite, matching the existing pattern in
`tests/unit/{kivilcim,jointledger,dropspot}-*.test.*`.

---

## 3. Gap / dependency map

| # | Gap | Finding | Blocked by | Unblocks |
|---|---|---|---|---|
| G1 | Two orderings; flagship dead end | F2 | *nothing* | G2 navigation correctness |
| G2 | `nextSlug` duplicates `order` | F2 | G1 landed | schema simplification |
| G3 | Flagship at `preview` depth | F1 | **UNKNOWN 1–2 (owner)** | G4, G5, depth ladder |
| G4 | No SF layer files / decisions | F1 | G3 decision | flagship case study |
| G5 | No SF test suites | F5 | G4 content exists | coverage parity |
| G6 | Real screenshots for Kıvılcım / JointLedger | F4 | **UNKNOWN 6 (owner)** | evidence parity *(policy — not required today)* |
| G7 | `professional-systems` empty | F3 | **UNKNOWN 3 (owner)** | *editorial choice — contract-compliant today* |
| G8 | No timelines | F6 | **UNKNOWN 4 (owner)** | *optional field — not required* |
| G9 | No live/demo links | F6 | **UNKNOWN 5 (owner)** | *optional field — not required* |

**Corrected after independent review.** The original summary — "six of nine gaps blocked, exactly
one actionable" — was too strong in both directions.

- G6–G9 are **observed absences against proposal-authored aspirations**, not violations of any
  standing contract. They are only "gaps" if the owner adopts the §2.2–2.4 policies.
- Conversely, more than one thing is actionable without new project facts: the ordering-contract
  clarification (§1.2), the derived-navigation implementation that follows it, generic gate-level
  test coverage, and documentation cleanup are all unblocked.

What *is* strictly blocked on owner facts is **truthful content expansion** — G3/G4 and anything
that would require stating something about a project that no source records.

---

## 4. Candidate implementation slices, in dependency order

No slice below has been started. None has frozen acceptance criteria — that comes after the
independent review.

### Slice 0 — Ordering-contract clarification — **DONE** (`78bf8305`)

*Added after independent review.* Before any navigation is derived, write down what `order` means:
global versus within-tier neighbours, first/last behaviour, and tie-breaking. Correct or rename
`sortByTierThenOrder`, whose name asserts an ordering its body does not implement. Documentation
and naming only.

### Slice 1 — Derive project neighbours from `order` — **DONE** (`78bf8305`)

Replace the hand-written `nextSlug` chain with a derivation from the published, sorted list; delete
`nextSlug` from the schema and from every reference.

- Touches: `lib/content/work.ts`, `lib/content/schemas.ts`, `app/work/[slug]/page.tsx`,
  `components/project/ProjectNeighbours.tsx` (replacing `NextProject.tsx`), **3 × `index.mdx`**,
  `tests/fixtures/content/work/delta-full/index.mdx`, new unit test
- Requires no new facts, invents nothing, and executes D-021's accepted single-source rule
- Risk: schema field removal is build-affecting; must run the full gate suite. Verify whether Zod
  strips or rejects the unknown key before choosing the edit order
- **Superseded scope note.** The first review deferred *previous*-project navigation as a new IA
  element needing separate approval. The owner approved it on 2026-09-02, so **both directions**
  shipped, derived from the same collection. See D-027.

### Slice 2 — Software Factory depth upgrade (BLOCKED — owner)

Raise `preview` → `short` or `full`, adding layer files, decisions and sections. Cannot start:
writing this content without owner facts would mean inventing architecture, forbidden by
`CLAUDE.md` §11. What is needed is recorded in `docs/CONTENT_GAPS.md`.

### Slice 3 — Software Factory test suites (BLOCKED by Slice 2)

### Slice 4 — Evidence parity (BLOCKED — owner, UNKNOWN 6)

### Slice 5 — `professional-systems` resolution (BLOCKED — owner, UNKNOWN 3)

Ordering rationale: Slice 1 is first because it is the only one that is unblocked, it is the only
one that removes a contradiction rather than adding content, and it is a precondition for the
flagship case study being reachable at all.

---

## 5. Reviewer attack surface

Where an independent reviewer should attack this proposal hardest. These are stated as invitations,
not defences.

1. ~~**Is `nextSlug` actually obsolete, or is it deliberate editorial sequencing?** … No document
   states which is intended.~~ **ANSWERED — and the premise was wrong.** A document does state it:
   accepted **D-021** (`docs/DECISIONS.md:317-328`) sets the order to SF → Kıvılcım → JointLedger →
   DropSpot and keeps "`order` frontmatter … the single source of truth". The `nextSlug` values
   predate that reorder, so they are stale sequencing, not an approved editorial signal. This
   proposal missed an accepted decision record in its own repository.
2. **Is the depth ladder (§2.2) an invention?** `CONTENT_MODEL.md` defines what each depth
   requires, but does it anywhere require that prominence and depth agree? If not, §2.2 is a new
   rule an agent proposed, and it needs owner approval rather than review approval.
3. **Does raising Software Factory to `full` risk the frozen homepage?** `SpatialProjectScene`
   reads `project.depth` for its affordance label (`:115`), and the V12 acceptance measured
   Software Factory's plate geometry. A depth change alters a rendered string inside a frozen
   scene. Is that a V12 regression?
4. **Is "fail closed" being respected?** Removing `nextSlug` from the schema while an `index.mdx`
   still carries it — does Zod strip unknown keys or reject them? Verify before assuming ordering
   of edits is free.
5. **Is the flagship claim itself sound?** The V12 gate asserts Software Factory must feel
   foundational. If its content cannot support that, the honest architecture may be to move the
   flagship position, not to grow the content. This proposal assumes growth.
6. **Is `professional-systems` publishable at all?** It is `requires-user` and materially empty.
   Should it be `status: draft` until resolved, which would remove it from the build entirely?
7. **Coverage claim** — is per-project unit testing the right pattern, or does it encode content
   into tests such that every content edit breaks a test?
