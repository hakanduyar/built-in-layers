// V14.2 Gate C evidence tool: the LOWER WORLD as a reader meets it -- every
// frame from the surface return to the end of the document, at a fixed
// fraction of a viewport per step, forward or in reverse, tiled into one
// contact sheet with the scroll position printed under each frame; and the
// page's length and every lower section's position and height, as JSON, so
// a candidate can be diffed against the record it replaces
// (docs/review/v14.2-gate-c/).
//
//   PROBE_BASE=http://127.0.0.1:3200 VP=1440x900 DIR=forward STEP=0.5 \
//     OUT=docs/review/v14.2-gate-c/after/motion/1440--lower-world.png \
//     node tests/tools/lower-world-sheet.mjs
//
// Each frame is parked (scrollTo) and settled -- the lower page has no scroll
// governor, so a parked frame is the frame a reader who stopped there sees;
// the reveal transitions are given their full duration before the capture.
// The JSON is written beside the sheet as `<sheet>.json`.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const [W, H] = (process.env.VP ?? "1440x900").split("x").map(Number);
const DIR = process.env.DIR ?? "forward";
const STEP = Number(process.env.STEP ?? 0.5);
const COLS = Number(process.env.COLS ?? 6);
const OUT =
  process.env.OUT ?? `docs/review/v14.2-gate-c/after/motion/${W}--${DIR}--lower-world.png`;

const SECTIONS = ["selected-systems", "how-i-build", "field-notes", "about"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(BASE, { waitUntil: "networkidle" });
await page
  .locator("section[aria-label='Spatial system tour'] .sticky")
  .waitFor({ state: "attached" });
await page.waitForTimeout(300);

const geometry = await page.evaluate((sections) => {
  const s = document.querySelector("section[aria-label='Spatial system tour']");
  const sp = s.querySelector(":scope > div");
  const start = s.getBoundingClientRect().top + window.scrollY;
  const end = start + sp.getBoundingClientRect().height - window.innerHeight;
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
  };
  const out = {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    routeStart: Math.round(start),
    routeEnd: Math.round(end),
    docMax: document.documentElement.scrollHeight - window.innerHeight,
    lowerWorldPx: document.documentElement.scrollHeight - window.innerHeight - Math.round(end),
    sections: {},
    footer: box(document.querySelector("footer")),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
  for (const id of sections) {
    const block = document.querySelector(`[data-drift-block="${id}"]`);
    const register = block?.querySelector("[data-node-register]");
    if (block) out.sections[id] = { ...box(block), register: register ? box(register).top : null };
  }
  return out;
}, SECTIONS);

const from = DIR === "reverse" ? geometry.docMax : geometry.routeEnd;
const to = DIR === "reverse" ? geometry.routeEnd : geometry.docMax;
const step = Math.round(H * STEP);
const positions = [];
for (let y = from; DIR === "reverse" ? y > to : y < to; y += DIR === "reverse" ? -step : step) {
  positions.push(y);
}
positions.push(to);

// A reverse walk starts from a page that has been read to the end, so the
// reveals are already open; a forward walk starts from the top.
if (DIR === "reverse") {
  await page.evaluate((y) => window.scrollTo(0, y), geometry.docMax);
  await page.waitForTimeout(900);
}

/** Settle: the world plane's transform unchanged for four consecutive polls
 *  (the camera still eases for the frames nearest the route's end), then the
 *  reveal transitions' own duration. */
async function settle() {
  await page.evaluate(() => {
    window.__lwLast = undefined;
    window.__lwHits = 0;
  });
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-camera-plane='world']");
      const t = el ? getComputedStyle(el).transform : String(window.scrollY);
      const n = window.__lwLast === t ? (window.__lwHits ?? 0) + 1 : 0;
      window.__lwLast = t;
      window.__lwHits = n;
      return n >= 4;
    },
    { timeout: 30000, polling: 90 },
  );
  await page.waitForTimeout(650);
}

const shots = [];
for (const y of positions) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await settle();
  const buffer = await page.screenshot();
  shots.push({ y, dataUrl: "data:image/png;base64," + buffer.toString("base64") });
}

const sheet = await page.evaluate(
  async (input) => {
    const scale = 0.5;
    const w = input.width * scale;
    const h = input.height * scale;
    const label = 22;
    const cols = input.cols;
    const rows = Math.ceil(input.shots.length / cols);
    const c = document.createElement("canvas");
    c.width = cols * w + (cols + 1) * 8;
    c.height = rows * (h + label) + (rows + 1) * 8;
    const x = c.getContext("2d");
    x.fillStyle = "#e9e5dc";
    x.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < input.shots.length; i += 1) {
      const img = await new Promise((res) => {
        const im = new Image();
        im.onload = () => res(im);
        im.src = input.shots[i].dataUrl;
      });
      const cx = 8 + (i % cols) * (w + 8);
      const cy = 8 + Math.floor(i / cols) * (h + label + 8);
      x.drawImage(img, cx, cy, w, h);
      x.strokeStyle = "rgba(22,22,22,0.35)";
      x.strokeRect(cx + 0.5, cy + 0.5, w - 1, h - 1);
      x.fillStyle = "#161616";
      x.font = "12px monospace";
      x.fillText(
        `${i + 1}/${input.shots.length}  ${input.dir}  y=${input.shots[i].y}`,
        cx + 4,
        cy + h + 15,
      );
    }
    return c.toDataURL("image/png");
  },
  { shots, width: W, height: H, cols: COLS, dir: DIR },
);
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.from(sheet.split(",")[1], "base64"));
writeFileSync(
  `${OUT}.json`,
  JSON.stringify(
    { base: BASE, dir: DIR, step, positions, consoleErrors: errors, ...geometry },
    null,
    2,
  ),
);
console.log(
  `sheet ${OUT}  ${shots.length} frames  ${DIR}  y ${from} -> ${to}  ${W}x${H}  docMax ${geometry.docMax}  lower ${geometry.lowerWorldPx}px  errors ${errors.length}`,
);
await browser.close();
