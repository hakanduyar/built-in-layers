// V14.1 (Fable gate) review tool: the INTERMEDIATE frames of a transition,
// composed into one contact sheet.
//
// The owner's brief §28 is explicit that focus stills are not a review: "a
// motion state that looks unfinished is a design failure even if focus
// screenshots look good". A recording cannot be read frame by frame by a
// reviewer that reads images, so this parks the camera at N evenly spaced
// progress values between two named beats -- letting the governed camera
// settle at each, exactly as a reader who stopped there would see it -- and
// tiles the frames into a single PNG with the progress printed under each.
//
//   PROBE_BASE=http://127.0.0.1:3200 node tests/tools/transition-sheet.mjs \
//     --from software-factory --to kivilcim --frames 8 --out sheet.png
//
// `--from` / `--to` are scene ids from the focus table, or raw progress numbers
// (0..1). `--pad 0.02` extends the range on both sides. `--viewport 1440x900`.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const FOCUS_FILE =
  process.env.FOCUS_FILE ?? "docs/review/v14-owner-visual/after/metrics/route-focus.json";
const FOCUS = JSON.parse(readFileSync(FOCUS_FILE, "utf8")).desktop;
const [WIDTH, HEIGHT] = flag("viewport", "1440x900").split("x").map(Number);
const FRAMES = Number(flag("frames", "8"));
const PAD = Number(flag("pad", "0"));
const COLS = Number(flag("cols", "4"));
const OUT = flag("out", "transition-sheet.png");
const resolve = (v) => (v in FOCUS ? FOCUS[v] : Number(v));
const from = resolve(flag("from", "software-factory")) - PAD;
const to = resolve(flag("to", "kivilcim")) + PAD;
const TOUR = "section[aria-label='Spatial system tour']";

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
const page = await context.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached", timeout: 30000 });
await page.waitForTimeout(400);
const range = await page.evaluate(() => {
  const section = document.querySelector("section[aria-label='Spatial system tour']");
  const spacer = section.querySelector(":scope > div");
  const start = section.getBoundingClientRect().top + window.scrollY;
  return { start, end: start + spacer.getBoundingClientRect().height - window.innerHeight };
});

async function settle() {
  await page.evaluate(() => {
    window.__tsLast = undefined;
    window.__tsHits = 0;
  });
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-camera-plane='world']");
      const t = el ? getComputedStyle(el).transform : String(window.scrollY);
      const n = window.__tsLast === t ? (window.__tsHits ?? 0) + 1 : 0;
      window.__tsLast = t;
      window.__tsHits = n;
      return n >= 4;
    },
    { timeout: 30000, polling: 90 },
  );
}

const shots = [];
for (let i = 0; i < FRAMES; i += 1) {
  const p = from + ((to - from) * i) / Math.max(1, FRAMES - 1);
  await page.evaluate(
    (input) => window.scrollTo(0, Math.round(input.start + (input.end - input.start) * input.p)),
    { start: range.start, end: range.end, p },
  );
  await settle();
  const buffer = await page.screenshot();
  shots.push({ p, dataUrl: "data:image/png;base64," + buffer.toString("base64") });
}

// Tile in the page itself: a canvas is the cheapest image compositor to hand.
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
        `${i + 1}/${input.shots.length}  p=${input.shots[i].p.toFixed(4)}`,
        cx + 4,
        cy + h + 15,
      );
    }
    return c.toDataURL("image/png");
  },
  { shots, width: WIDTH, height: HEIGHT, cols: COLS },
);
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.from(sheet.split(",")[1], "base64"));
console.log(
  `sheet ${OUT}  ${FRAMES} frames  p ${from.toFixed(4)} -> ${to.toFixed(4)}  ${WIDTH}x${HEIGHT}`,
);
await browser.close();
