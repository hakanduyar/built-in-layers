// V13 MOBILE GATE — TOUCH TARGET PROBE (M4)
//
// Three measurements, one script, against a running build:
//
//   1. INVENTORY  every element carrying `touch-link` and its hit box, then
//      every remaining interactive element under 44px, flagged "inline" when
//      it sits inside a running sentence (exempt under WCAG 2.5.8).
//   2. LAYOUT     a full-page screenshot as built (twice, for the noise floor),
//      then the M4 classes stripped from the live DOM and a third screenshot.
//      `touch-link` promises "the hit box grows, the layout does not", and the
//      pixel diff between the second and third capture is that promise
//      measured. The strip is verified (the header wordmark must shrink) so a
//      zero diff cannot be a strip that never happened.
//   3. MENU       the mobile navigation open: each row's box, its <li>, and the
//      text's own rect, as built and stripped.
//
// PROBE_BASE (default http://127.0.0.1:3210), PROBE_PAGES, PROBE_WIDTHS (bare
// widths), PROBE_MODE (inventory | layout | menu | all, default all). Output is
// text on stdout; the gate keeps it in docs/review/v13-mobile-gate/after/.
import { chromium } from "@playwright/test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadSharp() {
  for (const spec of [
    "sharp",
    `${process.cwd()}/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp`,
  ]) {
    try {
      return require(spec);
    } catch {
      /* try the next location */
    }
  }
  return null;
}
const sharp = loadSharp();

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3210";
const PAGES = (
  process.env.PROBE_PAGES ?? "/,/work,/work/kivilcim,/work/dropspot,/about,/notes,/lab,/nope"
).split(",");
const WIDTHS = (process.env.PROBE_WIDTHS ?? "320,375,768").split(",").map(Number);
const MODE = process.env.PROBE_MODE ?? "all";
const run = (mode) => MODE === "all" || MODE === mode;

const CLASSES = ["touch-link", "max-lg:touch-link", "max-lg:inline-block"];
const INTERACTIVE =
  "a[href], button, [role=tab], summary, input, select, textarea, [tabindex]:not([tabindex='-1'])";

function context(browser, width) {
  const height = width < 1024 ? (width <= 430 ? 812 : 1024) : 900;
  return browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    hasTouch: width < 1024,
    isMobile: width < 1024,
    reducedMotion: "reduce",
  });
}

/** Walk the page so reveal-on-scroll content is settled, then return to the top. */
async function settle(page) {
  const height = page.viewportSize().height;
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += height * 0.8) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

function stripClasses(page) {
  return page.evaluate((classes) => {
    let n = 0;
    for (const el of document.querySelectorAll(classes.map((c) => "." + CSS.escape(c)).join(","))) {
      el.classList.remove(...classes);
      n++;
    }
    return n;
  }, CLASSES);
}

async function inventory(page, width, path) {
  const { touched, small } = await page.evaluate((selector) => {
    const fmt = (v) => Math.round(v * 100) / 100;
    const touched = [];
    const small = [];
    for (const el of document.querySelectorAll(selector)) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      const text = (el.getAttribute("aria-label") ?? el.textContent ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 34);
      const row = {
        w: fmt(r.width),
        h: fmt(r.height),
        tag: el.tagName.toLowerCase(),
        text,
        top: Math.round(r.top + window.scrollY),
      };
      if (/(^| )(max-lg:)?touch-link( |$)/.test(el.className ?? "")) touched.push(row);
      if (r.height < 44 || r.width < 44) {
        const parent = el.parentElement;
        const inline =
          parent &&
          ["P", "LI", "SPAN", "DD", "H1", "H2", "H3"].includes(parent.tagName) &&
          (parent.textContent ?? "").trim().length > (el.textContent ?? "").trim().length + 8;
        small.push({ ...row, inline: Boolean(inline) });
      }
    }
    return { touched, small };
  }, INTERACTIVE);
  const line = (r, flag = "") =>
    `    ${String(r.w).padStart(7)} x ${String(r.h).padEnd(6)} ${flag}${r.tag.padEnd(3)} "${r.text}"  @${r.top}`;
  console.log(`\n== ${width}px ${path}`);
  console.log(`  touch-link targets (${touched.length}):`);
  for (const r of touched) console.log(line(r));
  const standalone = small.filter((r) => !r.inline).length;
  console.log(
    `  remaining under 44px: ${standalone} standalone, ${small.length - standalone} inline-sentence (exempt, WCAG 2.5.8)`,
  );
  for (const r of small) console.log(line(r, r.inline ? "inline " : "  --   "));
}

async function pixelDiff(a, b) {
  const A = await sharp(a).raw().toBuffer({ resolveWithObject: true });
  const B = await sharp(b).raw().toBuffer({ resolveWithObject: true });
  if (A.info.width !== B.info.width || A.info.height !== B.info.height) {
    return { px: -1, size: `${A.info.width}x${A.info.height} vs ${B.info.width}x${B.info.height}` };
  }
  const ch = A.info.channels;
  let px = 0;
  for (let i = 0; i < A.data.length; i += ch) {
    for (let c = 0; c < ch; c++) {
      if (A.data[i + c] !== B.data[i + c]) {
        px++;
        break;
      }
    }
  }
  return { px, size: `${A.info.width}x${A.info.height}` };
}

async function layout(page, width, path) {
  if (!sharp) {
    console.log(`${width} ${path}: sharp unavailable, layout diff skipped`);
    return;
  }
  const a1 = await page.screenshot({ fullPage: true });
  await page.waitForTimeout(150);
  const a2 = await page.screenshot({ fullPage: true });
  const stripped = await stripClasses(page);
  // Chromium reflects the class change in computed style a beat later (the
  // padding is lh-based); wait, then prove the strip took before capturing.
  await page.waitForTimeout(400);
  const wordmark = await page.evaluate(() => {
    const el = document.querySelector("header a[href='/']");
    return { pad: getComputedStyle(el).paddingTop, h: el.getBoundingClientRect().height };
  });
  const b = await page.screenshot({ fullPage: true });
  const noise = await pixelDiff(a1, a2);
  const change = await pixelDiff(a2, b);
  console.log(
    `${String(width).padStart(4)} ${path.padEnd(16)} stripped=${String(stripped).padStart(2)} wordmark after strip ${wordmark.h}px/pad ${wordmark.pad}  noise(A1,A2)=${noise.px}px  A2-vs-B=${change.px}px  ${change.size}`,
  );
}

async function menu(page, width) {
  await page.click("#mobile-nav-trigger");
  await page.waitForSelector("#mobile-nav-panel[open]");
  const measure = () =>
    page.evaluate(() => {
      const fmt = (v) => Math.round(v * 100) / 100;
      return [...document.querySelectorAll("#mobile-nav-panel nav a")].map((a) => {
        const r = a.getBoundingClientRect();
        const li = a.parentElement.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(a);
        const t = range.getBoundingClientRect();
        return {
          label: a.textContent.trim(),
          box: [r.x, r.y, r.width, r.height].map(fmt),
          li: [li.y, li.height].map(fmt),
          text: [t.x, t.y, t.width, t.height].map(fmt),
        };
      });
    });
  const built = await measure();
  await stripClasses(page);
  await page.waitForTimeout(400);
  const stripped = await measure();
  console.log(`== ${width}`);
  for (let i = 0; i < built.length; i++) {
    const a = built[i];
    const b = stripped[i];
    const same = JSON.stringify(a.text) === JSON.stringify(b.text);
    console.log(
      `  ${a.label.padEnd(6)} box ${b.box.join("x")} -> ${a.box.join("x")}   li ${b.li.join("/")} -> ${a.li.join("/")}   text ${b.text.join(",")} -> ${a.text.join(",")}  ${same ? "text unchanged" : "TEXT MOVED"}`,
    );
  }
}

const browser = await chromium.launch();
if (run("inventory")) {
  console.log(
    "INVENTORY: every touch-link box, then every remaining sub-44 element ('@' = document y)",
  );
  for (const width of WIDTHS) {
    const ctx = await context(browser, width);
    for (const path of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await settle(page);
      await inventory(page, width, path);
      await page.close();
    }
    await ctx.close();
  }
}
if (run("layout")) {
  console.log(
    "\nLAYOUT: pixel diff, as built (A2) vs the M4 classes stripped (B); A1/A2 = noise floor",
  );
  for (const width of WIDTHS) {
    const ctx = await context(browser, width);
    for (const path of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await settle(page);
      await layout(page, width, path);
      await page.close();
    }
    await ctx.close();
  }
}
if (run("menu")) {
  console.log("\nMENU: row hit box / <li> / text rect, stripped -> as built");
  for (const width of WIDTHS.filter((w) => w < 768)) {
    const ctx = await context(browser, width);
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await menu(page, width);
    await ctx.close();
  }
}
await browser.close();
