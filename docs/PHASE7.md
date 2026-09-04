# PHASE 7 — FINAL ENGINEERING / CONSOLE / PERFORMANCE

The whole-portfolio engineering pass after the three freezes (desktop `0752883`, case-study
`5000201`, mobile `8a24e03`). Not a design pass: no art direction, no new composition, no frozen
system reopened. Every fix below is a measured defect, and every number here has a command that
produced it.

Reviewed branch: `feature/project-architecture-v13`, starting from `623b450`.

---

## 1. The publication gate was quadratic, and it was the suite's dominant cost

**Classification:** ENGINEERING · PERFORMANCE. Found by the audit, not previously recorded.

### The symptom

The full unit suite failed on the first run of this phase:

```
FAIL tests/unit/touch-link.test.tsx > work index: each project card's title
Error: Test timed out in 5000ms.
Test Files  1 failed | 27 passed (28)
Tests  1 failed | 555 passed (556)
Duration  76.10s
```

`.ai/handoffs/FABLE-MOBILE-RETURN.md` §10.12 had already recorded this as load-sensitive and
prescribed "run the suite alone". **That mitigation does not hold** — this run *was* alone, with
typecheck and lint already finished and no browser work in flight. So the flake was treated as a
live defect rather than a documented one.

### The measurement

The failing test's only unusual work is one `getProjectsByTier("featured")` call. Timed inside the
same jsdom environment the suite uses:

```
getPublishedProjects x5 ms: 1732, 1568, 1647, 1692, 1630
getProjectsByTier   ms: 1659
```

Two things follow. It costs ~1.6s per call, and **it does not get cheaper on repeat** — confirming
the earlier measured finding that the `cache()` wrapper on `parseAllProjects` buys nothing outside
a React request scope.

Profiling the call apart, over the five real project directories:

| Stage | Cost |
|---|---|
| `readFileSync` all `index.mdx` | 3ms |
| `gray-matter` parse | 10ms |
| Zod `safeParse` | 6ms |
| layer file reads | 8ms |
| **`validatePublicationGates` all** | **1675ms** |

The filesystem was never the cost. 99% of it was one function.

### The cause

`similarity()` in `lib/content/validate.ts` is the layer-distinctness gate (CONTENT_MODEL §7: no
two layer bodies more than 60% similar). It computed full Levenshtein distance by allocating the
entire `rows × cols` matrix as a `number[][]` — one JS array object per row.

The gate compares three pairs for each of the three projects that have layer files:

```
dropspot     2923 / 2572 / 4001 chars
jointledger  1517 / 1979 / 3342
kivilcim     2279 / 3018 / 2983
```

That is **~67 million cells across the nine pairs**, allocated and collected on every single call.
The arithmetic was never the problem; the allocation was.

### The fix

Two rolling `Int32Array` rows instead of the full matrix. Same recurrence, same distance, ~32KB
instead of hundreds of megabytes.

**Proved equivalent, not assumed.** All nine real layer pairs plus 21 edge and pseudo-random cases
were captured to 17 decimal places before and after:

```
diff docs/review/phase7/similarity-{before,after}.txt   # identical, timing line aside
```

- `docs/review/phase7/similarity-before.txt` — 30 values, `REAL_PAIRS_MS = 1722`
- `docs/review/phase7/similarity-after.txt` — the same 30 values, `REAL_PAIRS_MS = 701`

The edge cases pin the branches that are easy to get wrong when converting to rolling rows: both
empty, either side empty, identical strings, `kitten`/`sitting`, markup that strips to the same
text, and whitespace-only input.

No assertion was touched. `similarity`'s existing tests in `tests/unit/validate.test.ts` still pin
its contract, and `LAYER_MAX_SIMILARITY` is unchanged.

### The result

| Measurement | Before | After |
|---|---|---|
| The nine real layer pairs | 1722ms | **701ms** |
| `pnpm test` (full unit suite) | 76.10s, **1 failed** | **28.21s / 28.32s, 556/556** |
| `pnpm build` (cold `.next`) | 48s / 46s | **43s / 31s** |

The suite is 2.7× faster and passed twice consecutively. The build numbers are one run each side
of a pair and carry real variance — 11 static-generation workers hide much of the gate cost behind
each other — so the honest claim is a consistent direction, not a precise figure. The decisive
numbers are the gate's own and the suite's.

The `.ai/STATE.md` and `FABLE-MOBILE-RETURN.md` §10.12 entries describing the suite as
load-sensitive are superseded: the load sensitivity was this function.
