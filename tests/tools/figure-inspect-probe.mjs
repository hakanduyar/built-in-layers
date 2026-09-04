// V13 MOBILE GATE — FIGURE INSPECTOR PROBE (A11Y-1 / ART-1)
//
// Two listings, one script, against one or two running builds:
//
//   1. NAMES   every INSPECT control on a page at a phone width: its visible
//              text, its aria-label (the accessible name when present), the
//              asset its figure shows. A11Y-1 asked for a name that identifies
//              the figure; the listing shows how many controls a page has, how
//              many distinct names, and how many distinct assets -- a figure
//              shown twice (the hero lead repeats a layer figure) is expected
//              to be named twice.
//   2. SCALE   the /work index thumbnails at a list of widths: rendered width
//              over intrinsic width, and whether the figure's control is
//              displayed. ART-1 asked what the index does with a 1600-unit
//              diagram drawn at a fifth of its size; the listing is the scale
//              at every width and where the control renders.
//
// PROBE_BASE_A (optional, a baseline), PROBE_BASE_B (default
// http://127.0.0.1:3210, the candidate), PROBE_PAGES, PROBE_WIDTH (default 375),
// PROBE_WIDTHS (bare widths for the scale listing, default 320,375,430,768,1024,1440),
// PROBE_MODE (names | scale | all, default all). Output is text on stdout; the
// gate keeps it in docs/review/v13-mobile-gate/after/.
import { chromium } from "@playwright/test";

const BASE_A = process.env.PROBE_BASE_A;
const BASE_B = process.env.PROBE_BASE_B ?? "http://127.0.0.1:3210";
const PAGES = (
  process.env.PROBE_PAGES ??
  "/work,/work/software-factory,/work/kivilcim,/work/jointledger,/work/dropspot,/work/professional-systems"
).split(",");
const WIDTH = Number(process.env.PROBE_WIDTH ?? 375);
const WIDTHS = (process.env.PROBE_WIDTHS ?? "320,375,430,768,1024,1440").split(",").map(Number);
const MODE = process.env.PROBE_MODE ?? "all";
const run = (mode) => MODE === "all" || MODE === mode;

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

/** Every INSPECT control on the page, with the figure it belongs to. */
function listControls() {
  return [...document.querySelectorAll("[data-figure-inspect]")].map((button) => {
    const image = button.closest("figure")?.querySelector("img");
    return {
      label: button.getAttribute("aria-label"),
      text: button.textContent?.trim() ?? "",
      asset: (image?.getAttribute("src") ?? "").split("/").pop() ?? "",
      displayed: getComputedStyle(button).display !== "none",
    };
  });
}

/** The /work index thumbnails: rendered over intrinsic width, control displayed or not. */
function listThumbnails() {
  return [...document.querySelectorAll("main li figure img")].map((image) => {
    const control = image.closest("figure")?.querySelector("[data-figure-inspect]");
    return {
      asset: (image.getAttribute("src") ?? "").split("/").pop() ?? "",
      rendered: Math.round(image.getBoundingClientRect().width),
      intrinsic: Number(image.getAttribute("width")),
      control: control ? getComputedStyle(control).display !== "none" : false,
    };
  });
}

const browser = await chromium.launch();
const builds = [BASE_A && ["A (baseline)", BASE_A], ["B (candidate)", BASE_B]].filter(Boolean);

if (run("names")) {
  console.log(`INSPECT CONTROLS AT ${WIDTH}px — visible text, accessible name, asset`);
  for (const [label, base] of builds) {
    console.log(`\n--- ${label}: ${base}`);
    const ctx = await context(browser, WIDTH);
    const page = await ctx.newPage();
    for (const path of PAGES) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      const controls = await page.evaluate(listControls);
      const names = new Set(controls.map((c) => c.label ?? c.text));
      const assets = new Set(controls.map((c) => c.asset));
      console.log(
        `${path}: ${controls.length} control(s), ${names.size} distinct name(s), ${assets.size} distinct asset(s)${controls.some((c) => !c.displayed) ? ", some not displayed" : ""}`,
      );
      for (const c of controls) {
        console.log(
          `   ${c.asset}  text="${c.text}"  ${c.label === null ? "(no aria-label)" : `aria-label="${c.label}"`}`,
        );
      }
    }
    await ctx.close();
  }
}

if (run("scale")) {
  console.log("\nINDEX THUMBNAILS ON /work — rendered/intrinsic width (scale), control displayed?");
  for (const [label, base] of builds) {
    console.log(`\n--- ${label}: ${base}`);
    for (const width of WIDTHS) {
      const ctx = await context(browser, width);
      const page = await ctx.newPage();
      await page.goto(`${base}/work`, { waitUntil: "networkidle" });
      const rows = await page.evaluate(listThumbnails);
      console.log(
        `${String(width).padStart(4)}px: ${rows
          .map(
            (r) =>
              `${r.asset} ${r.rendered}/${r.intrinsic} (${(r.rendered / r.intrinsic).toFixed(2)}) ${r.control ? "INSPECT" : "no control"}`,
          )
          .join(" | ")}`,
      );
      await ctx.close();
    }
  }
}

await browser.close();
