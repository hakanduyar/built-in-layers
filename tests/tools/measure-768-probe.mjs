// V13 MOBILE GATE — MEASURE PROBE AT 768 (M2 / ART-2)
//
// Two measurements, one script, against a running build, at the tablet width
// where the 34rem measure applies (styles/globals.css, `@media (width < 64rem)`):
//
//   1. MEASURE  every `p` and `li` with more than 40 characters: its font size,
//      its box width, the audit probe's estimate (width / (font-size x 0.5),
//      the M2 rule in docs/MOBILE_AUDIT.md) and the real characters per
//      rendered line (characters / lines, lines from the element's Range
//      rects). Body copy (>=14px) is the number of record; the audit mean
//      averages in list containers and 12px mono meta.
//   2. LENGTH   the page's height as built, then with `--container-measure`
//      overridden below `lg` to PROBE_ALT_MEASURE (default 42rem, the desktop
//      value) and the height again. The difference is the cost of the 34rem
//      measure alone -- what ART-2 (V13 mobile QA) asked to have accepted or
//      adjusted -- separated from everything else the checkpoint added to the
//      page. The override is verified (the widest `max-w-measure` box must
//      grow) so a zero delta cannot be an override that never applied.
//
// PROBE_BASE (default http://127.0.0.1:3210), PROBE_PAGES, PROBE_WIDTH (default
// 768), PROBE_MODE (measure | length | all, default all), PROBE_ALT_MEASURE.
// Output is text on stdout; the gate keeps it in docs/review/v13-mobile-gate/after/.
import { chromium } from "@playwright/test";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3210";
const PAGES = (
  process.env.PROBE_PAGES ??
  "/work,/work/kivilcim,/work/dropspot,/work/software-factory,/work/jointledger,/work/professional-systems,/about,/"
).split(",");
const WIDTH = Number(process.env.PROBE_WIDTH ?? 768);
const MODE = process.env.PROBE_MODE ?? "all";
const ALT_MEASURE = process.env.PROBE_ALT_MEASURE ?? "42rem";
const run = (mode) => MODE === "all" || MODE === mode;

/** Walk the page so reveal-on-scroll content is settled, then return to the top. */
async function settle(page) {
  const height = page.viewportSize().height;
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += height * 0.8) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
}

/** Per-element line-length rows, as the audit probe selects them. */
function measureRows() {
  const out = [];
  for (const el of document.querySelectorAll("p, li")) {
    const text = (el.textContent || "").trim();
    if (text.length <= 40) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const rect = el.getBoundingClientRect();
    if (!rect.width) continue;
    const range = document.createRange();
    range.selectNodeContents(el);
    const lines = new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
    out.push({
      fs,
      w: Math.round(rect.width),
      ch: Math.round(rect.width / (fs * 0.5)),
      glyphCh: Math.round(text.length / Math.max(1, lines)),
      lines,
      text: text.slice(0, 40),
    });
  }
  return out;
}

/** The page's height and the widest running-text box, for the LENGTH mode. */
function lengthState() {
  const boxes = [...document.querySelectorAll(".max-w-measure")].map((el) =>
    Math.round(el.getBoundingClientRect().width),
  );
  return {
    height: document.documentElement.scrollHeight,
    boxes: boxes.length,
    widest: boxes.length ? Math.max(...boxes) : 0,
  };
}

const mean = (rows, key) =>
  rows.length ? Math.round(rows.reduce((s, r) => s + r[key], 0) / rows.length) : "-";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: 1024 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();
let failed = false;

for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await settle(page);

  if (run("measure")) {
    const rows = await page.evaluate(measureRows);
    const body = rows.filter((r) => r.fs >= 14);
    const meta = rows.filter((r) => r.fs < 14);
    console.log(
      `\n== ${WIDTH} ${path}  audit-mean(all)=${mean(rows, "ch")}  body-only(>=14px)=${mean(body, "ch")}  meta(<14px)=${mean(meta, "ch")}  n=${rows.length}/${body.length}/${meta.length}`,
    );
    for (const r of rows) {
      console.log(
        `   ${String(r.fs).padStart(4)}px ${String(r.w).padStart(4)}w ${String(r.ch).padStart(4)}ch(audit) ${String(r.glyphCh).padStart(4)}ch/line(real, ${r.lines} lines)  ${r.text}`,
      );
    }
  }

  if (run("length")) {
    const built = await page.evaluate(lengthState);
    const builtBody = (await page.evaluate(measureRows)).filter((r) => r.fs >= 14);
    await page.addStyleTag({
      content: `@media (width < 64rem) { :root { --container-measure: ${ALT_MEASURE}; } }`,
    });
    await page.waitForTimeout(100);
    await settle(page);
    const alt = await page.evaluate(lengthState);
    const altBody = (await page.evaluate(measureRows)).filter((r) => r.fs >= 14);
    const delta = built.height - alt.height;
    const pct = alt.height ? ((delta / alt.height) * 100).toFixed(1) : "-";
    // A page without a `max-w-measure` box (the homepage's frozen sections
    // carry their own measure) has nothing for the override to widen.
    const applied = built.boxes === 0 ? "no measure boxes here" : alt.widest > built.widest;
    if (applied === false) failed = true;
    const longest = (rows) => (rows.length ? Math.max(...rows.map((r) => r.glyphCh)) : "-");
    console.log(
      `\n== ${WIDTH} ${path}  LENGTH  as built: ${built.height}px, ${built.boxes} measure boxes, widest ${built.widest}px, body mean ${mean(builtBody, "glyphCh")} / longest ${longest(builtBody)} ch/line (n=${builtBody.length})`,
    );
    console.log(
      `   with --container-measure: ${ALT_MEASURE} below lg: ${alt.height}px, widest ${alt.widest}px, body mean ${mean(altBody, "glyphCh")} / longest ${longest(altBody)} ch/line (n=${altBody.length})  ${applied === true ? "override applied" : applied === false ? "OVERRIDE NOT APPLIED" : applied}`,
    );
    console.log(`   cost of the built measure alone: ${delta >= 0 ? "+" : ""}${delta}px (${pct}%)`);
  }
}

await browser.close();
if (failed) {
  console.error("\nLENGTH: the measure override did not widen any box on at least one page.");
  process.exit(1);
}
