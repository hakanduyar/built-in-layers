# Cinematic study acceptance

The experiment opens at `/cinematic?lang=tr`. Each of the five overview plates uses a published case study's own local illustration. Selecting a plate takes the visitor to the matching project detail. Film links lead directly to each cut; the ordinary portfolio remains available. The initial language follows the existing English site, and the cinematic page offers Turkish.

## Film material

Both original Blender-derived H.264 edits decode completely at 960 × 720, 24 fps and 11 seconds. The first part is shared. The black pawn's reply distinguishes A; the reverse view of the waiting knight distinguishes B. A separately generated 11-second mono soundtrack is opt-in. The pictures are composed from Cycles render plates; no live hand or actor footage was captured. Editable generation sources and reproduction commands are in `tools/cinematic`.

## Verification

| Check | Result |
| --- | --- |
| Locked dependencies | Installed from the existing pnpm cache |
| TypeScript, ESLint, formatting on changed frontend sources and Next.js production build | Passed |
| Existing unit suite | 595 passed |
| Final integrated cinematic Playwright scenarios | 12 passed across Chromium and WebKit, including atlas selection, navigation history, keyboard, motion preferences, film controls and the Work index entry |
| Cinematic accessibility scan | Passed in Chromium and WebKit |
| Full browser suite on integrated atlas, film and cover (df3b677) | 502 passed, 4 skipped, 2 failed across 508 cases |
| Isolated rerun of both failures | Same two WebKit failures on the experiment and clean baseline 77ea5e1 |
| Visual review | Desktop 1440 × 900 and phone 390 × 844; no horizontal overflow. Reviewer recommended a mobile rail wrapping adjustment and clearer introduction to the teacher/learner motif. Both refinements were applied. |

The two baseline failures concern the number of sampled scroll positions during the legacy homepage journey and WebKit's first Tab stop on the legacy page. Their assertions have not been weakened. The reviewed corrections for the new UI include real fragment targets, addressable atlas previews, explicit pause/sound preference retention across cuts and audio synchronization.

The Claude Code worker delivered the existing Work index link on its own isolated branch. Its exact independently reviewed commit `c2d13fd` was cherry-picked to this experiment. The final production build and the final cinematic scenarios ran after integration. The full browser matrix above ran before the Work index link and two small cover/copy refinements.

## Artistic decision

The A/B cuts remain available so the owner can assess whether the reply or the waiting angle feels right. This deliverable is a working original motion study. Live-action capture and a personal voice recording would require material from the owner and are not represented by the renders.
