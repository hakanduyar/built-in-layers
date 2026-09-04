# ACTIVE TASK

One assignment. Replace it when it completes, or set `TASK: NONE`.

**TASK:** Phase 7 — final engineering / console / performance

**GOAL:** Verify the finished portfolio as a whole and correct evidence-backed engineering defects.
This is not a design pass: no art direction, no new composition, no reopening frozen systems.

**MODEL:** Opus 5
**EFFORT:** Medium (High only if a defect turns out to be architectural)

**READ:**

- `CLAUDE.md`, `.ai/STATE.md`, `.ai/TOKEN_POLICY.md`
- `docs/FROZEN_BOUNDARY.md` — §1 fingerprints, §4 check, §5 ledger
- `.ai/handoffs/OPUS-MOBILE-QA-RETURN.md` §8 and `.ai/handoffs/FABLE-MOBILE-RETURN.md` §10 — the
  open engineering items both gates deliberately left
- Nothing else unless a finding requires it

**PRESERVE:** all three frozen systems (desktop, case-study, mobile); project order; all content and
evidence; every test assertion.

**AUDIT:** typecheck · lint · full unit · production build · Chromium e2e · WebKit against its
documented baseline · console and runtime warnings · hydration · accessibility · routes, links and
404s · image loading and sizing · layout shift · reduced motion · overflow at desktop and mobile
widths · case-study navigation · unnecessary client-side work · stale current-state docs.

Known candidates, already recorded rather than discovered: WebKit inspector tests unmeasured; the
reduced-motion desktop-parity walk never reproduced; no `.gitattributes` for the CRLF artefact;
`blockJS` drops MDX FIG numbering (D-001).

**TARGETED VALIDATION:** run the affected suite while iterating; the full matrix once at the end.

**DELIVER:** evidence-backed fixes only, a short Phase 7 record, updated `.ai/STATE.md` and
`.ai/HANDOFF.md`, and a pushed checkpoint on `feature/project-architecture-v13`.

**STOP WHEN:** the matrix passes or its residue is classified as a documented non-blocker, and the
work is committed, pushed, and `local HEAD == origin`.

**OWNER BLOCKERS:** none expected. Escalate only per `CLAUDE.md` — in particular, do not attempt the
Software Factory content-depth upgrade: it needs the external repository, which is out of scope.
