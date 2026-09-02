# PROJECT ARCHITECTURE — CURRENT, TARGET, GAP

Companion to [`docs/PROJECT_INVENTORY.md`](PROJECT_INVENTORY.md). The inventory records what is
there; this document maps how it fits together, what it should become, and what stands between the
two.

- Branch: `feature/project-architecture-v13`
- Base commit: `243db3934d634f2c39d339cd2a267c01d86be2bd` (frozen V12 tip)
- Status: **proposal — pending independent architecture review.** No implementation slice has
  started and no acceptance criteria are frozen.

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
        │                            → sortByTierThenOrder
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
| `/work` index | `sortByTierThenOrder` → `order` | SF(0) → Kıvılcım(1) → JointLedger(2) → DropSpot(3) → Professional(4) |
| Case-study "next project" | hand-written `nextSlug` | Kıvılcım → DropSpot → JointLedger → Professional → ∅; **SF → ∅** |

The first two agree. The third disagrees with both and dead-ends the flagship.

---

## 2. TARGET architecture

The target changes **structure, not direction**. The frozen V12 homepage, the schema's honesty
model, and the fail-closed gates are all kept as they are.

### 2.1 One ordering, derived

`order` becomes the sole ordering source. Case-study navigation derives next/previous from the
published, sorted list rather than from a hand-maintained field.

```
getPublishedProjects()  →  sorted by (tier, order)
        │
        └── getProjectNeighbours(slug) → { previous, next }   [new, lib/content/work.ts]
                                                  │
                                                  ▼
                              app/work/[slug]/page.tsx → NextProject
```

`nextSlug` is then removable from the schema and from all five `index.mdx` files. This satisfies
"no duplicate source of truth for project content" (`CLAUDE.md` §8) and makes F2 unrepresentable
rather than merely fixed.

### 2.2 A depth ladder that matches position

The target is that **presented prominence and content depth agree**:

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
| G6 | Real screenshots for Kıvılcım / JointLedger | F4 | **UNKNOWN 6 (owner)** | evidence parity |
| G7 | `professional-systems` empty | F3 | **UNKNOWN 3 (owner)** | tier/featured integrity |
| G8 | No timelines | F6 | **UNKNOWN 4 (owner)** | — |
| G9 | No live/demo links | F6 | **UNKNOWN 5 (owner)** | — |

**Six of nine gaps are blocked on owner facts.** Exactly one gap — G1 — is fully unblocked, purely
structural, and needs no new content. That is the shape of this phase: the code-side work is small
and the content-side work is gated on the owner.

---

## 4. Candidate implementation slices, in dependency order

No slice below has been started. None has frozen acceptance criteria — that comes after the
independent review.

### Slice 1 — Derive project neighbours from `order` (UNBLOCKED)

Replace the hand-written `nextSlug` chain with a derivation from the published, sorted list; add
previous-project navigation; delete `nextSlug` from the schema and the five entries.

- Touches: `lib/content/work.ts`, `lib/content/schemas.ts`, `app/work/[slug]/page.tsx`,
  `components/project/NextProject.tsx`, 5 × `index.mdx`, new unit test
- Requires no new facts, invents nothing, and removes a duplicate source of truth
- Risk: schema field removal is build-affecting; must run the full gate suite
- **Recommended first slice**

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

1. **Is `nextSlug` actually obsolete, or is it deliberate editorial sequencing?** The chain
   Kıvılcım → DropSpot → JointLedger could be an intentional narrative order that `order` cannot
   express. If so, Slice 1 destroys a real signal and the correct fix is the opposite: make the
   homepage follow `nextSlug`. No document states which is intended — this is the single most
   consequential open question in the proposal.
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
