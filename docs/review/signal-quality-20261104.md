# Signal study — visual and interaction audit

Scope: the experimental portfolio branch, original home content and project destinations preserved. The owner requested detailed inspection, varied temporary photography, coherent motion and an externally reachable corrected preview. A later clarification prioritizes asymmetric spacing and removing overlapping picture piles.

## Findings and repairs

| Finding | Observed effect | Repair / acceptance |
| --- | --- | --- |
| Repeated source pool | The same shoe and diagrams appear across many unrelated screens; depth reads as duplication | 216 distinct source photographs, separate from project plates. Each desktop logical slot is unique; 144 slots on phone. A second identical sequence exists only to close each reel's loop. |
| Escaping depth stacking | Incoming project plate is covered by small background reels and looks shredded | Isolated corridor stacking at level 0; real outgoing/incoming plates at level 1; register at level 2. |
| Double representation | Departing original and displaced clone coexist; diagram labels and arrows double | Original is hidden when the moving clone takes ownership and restored on leaving/reversing the passage. |
| Near-plane dominance | Huge near images and translucent layers obscure one another | Smaller screens, opaque near surfaces, distance wash on far images, controlled near-edge exit. |
| Screen crowding | More pictures alone increases clutter; symmetry reinforces repeated columns | Additional owner-directed projected-spacing pass, with asymmetric windows and separation. Retain spatial movement and reel rhythm rather than a static tile grid. |
| First packing attempt popped | A greedy list of currently visible rails switched rear membership abruptly; 23 large raw opacity swaps in the first fine-scroll probe | Replaced visibility-dependent membership with continuous geometric blockers, fading blocker influence before an invisible rail wraps. Final reviewer 1 px/frame forward/reverse probe: maximum area-weighted visible alpha change 0.215, none above 0.35. |
| Mobile aspect distortion | A landscape preview measured 187.75 × 363.09 px and showed only its center | Width determines height from natural aspect before final registration. Reviewed result: 187.75 × 117.34 px, ratio 1.6, whole diagram visible. |
| WebKit lost perspective | Phone regression tests found only 2–4 visible photos. Actual WebKit rail widths stayed 150 px regardless of depth, leaving a blank center | Replaced browser-dependent parent CSS perspective with mathematically equivalent explicit projection. Independent 12-sample Chromium/WebKit, phone/desktop, neutral/±1 look check: zero overlaps and depth restored. Desktop rectangle agreement within about 0.003 px. |
| Text collisions | Source Case/Acquired annotation overlaps navigation; destination register overlaps outgoing prose | Source metadata fades during departure; destination register starts later, after the prose has cleared. Center reserved for imagery. |
| Pointer discontinuity | Reset then leaving controls jumped to approximately y=+.731 | Relative mouse deltas feed a time-based eased target. Reviewer measured 0 → -.1195 at 40 ms → -.1788 at 390 ms for an 82 px movement, rather than the unrelated absolute jump. |
| Lost viewer context | Closing enlarged Professional Systems returns to contact sheet, losing selection | Close restores focus and keeps selected project; reopening shows the same project. |
| Unclear image meaning | Temporary stock imagery could be mistaken for more portfolio work | Small IMAGE STUDY cue and source records distinguish decorative imagery from actual project evidence. |

## Work ownership

- `archive_assets`: local image collection, provenance registry and executable uniqueness/decoding verification.
- `depth_corridor`: only corridor geometry, rendering and reel styles.
- Root: source/target handoff, labels, controls, viewer selection, regression checks and publication.
- `corridor_review`: independent read-only browser/code audit and post-repair inspection.

## Evidence

- Independent desktop 1440×900 and phone 390×844 screenshots: temporary `corridor-deep-audit` folder, outside repository.
- Archive verifier: 216 distinct original IDs/URLs, encoded hashes and decoded pixel hashes; all 320×200 WebP files decode. Total 1,760,956 bytes. Attribution in `public/images/signal-archive/provenance.json`.
- Scoped ESLint: passed for modified root components and focused tests; corridor and registry checked by their owners.
- Production camera/viewer regression run: 6/6 Chromium + WebKit tests passed, including reset handoff and retained selection.
- Mobile smoke inspection of `/`, `/work`, `/about`, `/lab`, `/notes`: all HTTP 200, correct headings, horizontal overflow 0, broken loaded images 0, page exceptions 0.
- Independent reviewer accepted repaired source ghosting, landing stacking/aspect, label timing, viewer selection and eased pointer handoff. Final spacing/production gates follow the owner's additional clarification.
- Final spacing review accepted: zero actual photo intersections in desktop/phone forward/reverse sweeps; 18–33 visible desktop photos and 9–23 phone photos. The field is intentionally less crowded. The look-control observer recalculates only when the look tuple changes; no idle render loop added.
- Failure history preserved: initial production passage/navigation run passed 15/18; all three WebKit phone cases failed the nonempty-photo gate. Exact-source rebuild reproduced the low-density failure. The assertion was retained and the perspective implementation fixed rather than lowering the threshold.
- Final production build: `pnpm build` PASS. Final combined run with `PORT=3249`: `pnpm exec playwright test tests/e2e/signal-passage.spec.ts tests/e2e/passage-navigation.spec.ts tests/e2e/camera-comparison.spec.ts tests/e2e/signal-index.spec.ts --workers=1 --reporter=line` — **24/24 PASS**, Chromium and WebKit, 1.9 minutes. Covers all three project passages at 390/1440px, registration/reversal, unique logical photo slots, actual clipped photo separation/nonempty field, keyboard navigation, reduced motion, pointer handoff and viewer selection retention.
- Final anonymous external HTTP check returned 200 and the correct portfolio title. Original main remains `77ea5e1b05ed43ac5a34fa28204b0b2fc92e2f56`; no merge performed.

## Limits

Phone-sized Chromium/WebKit checks are not a measurement of the owner's physical phone GPU or mobile network. Temporary Cloudflare preview depends on the serving computer/tunnel staying alive. The existing development-only root HTML pre-paint bootstrap hydration warning was identified separately; it was not hidden by weakening checks or changing the original bootstrap in this visual patch. No claim of exhaustive testing of every pre-existing route state is made.
