// V8 evidence tool (§19): natural-scroll recordings. Drives the page with REAL
// wheel events at a human cadence -- not scrollTo jumps -- so what is recorded
// is the governed journey a reader actually gets, at the viewports the owner
// named.
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const OUT = "docs/review/v8-responsive/recordings";
mkdirSync(OUT, { recursive: true });

const RUNS = [
  { name: "laptop-1536x864", width: 1536, height: 864, wheel: 120, ticks: 190 },
  { name: "desktop-1920x1080", width: 1920, height: 1080, wheel: 120, ticks: 190 },
  { name: "mobile-390", width: 390, height: 780, wheel: 90, ticks: 210 },
];

const browser = await chromium.launch();
for (const run of RUNS) {
  const context = await browser.newContext({
    viewport: { width: run.width, height: run.height },
    recordVideo: { dir: OUT, size: { width: run.width, height: run.height } },
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page
    .locator("section[aria-label='Spatial system tour'] .sticky")
    .waitFor({ state: "attached", timeout: 30000 });
  await page.waitForTimeout(400);
  for (let i = 0; i < run.ticks; i += 1) {
    await page.mouse.wheel(0, run.wheel);
    await page.waitForTimeout(55);
  }
  await page.waitForTimeout(1500);
  const reached = await page.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    docH: document.documentElement.scrollHeight,
    atEnd: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8,
  }));
  const video = page.video();
  await context.close();
  const path = await video.path();
  // Renamed here, while the run that produced it is still in scope: naming the
  // files afterwards by directory order would attach a viewport label to
  // whichever hash happened to sort first, which is exactly how evidence stops
  // being evidence.
  const named = `${OUT}/${run.name}.webm`;
  renameSync(path, named);
  console.log(`${run.name.padEnd(18)} ${JSON.stringify(reached)}  ->  ${named}`);
}
await browser.close();
