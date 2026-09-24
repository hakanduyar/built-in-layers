// Final desktop gate: one named recording per required input profile.
// These are review artifacts, not pass/fail tests; quantitative cap/debt/reverse
// assertions live in scroll-contract-probe.mjs.
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.OUT ?? "docs/review/v12-codex-gate/recordings";
const W = Number(process.env.PROBE_W ?? 1536);
const H = Number(process.env.PROBE_H ?? 864);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const manifest = { viewport: `${W}x${H}`, recordings: [], consoleErrors: [] };

const wheelRun = async (page, count, deltaY, pauseMs) => {
  for (let i = 0; i < count; i += 1) {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(pauseMs);
  }
};

const scenarios = [
  ["slow", async (page) => wheelRun(page, 90, 55, 70)],
  ["medium", async (page) => wheelRun(page, 55, 180, 35)],
  ["very-aggressive", async (page) => wheelRun(page, 42, 1200, 16)],
  [
    "repeated-aggressive",
    async (page) => {
      for (let burst = 0; burst < 6; burst += 1) {
        await wheelRun(page, 14, 850, 16);
        await page.waitForTimeout(170);
      }
    },
  ],
  [
    "reverse",
    async (page) => {
      await wheelRun(page, 32, 520, 20);
      await page.waitForTimeout(220);
      await wheelRun(page, 30, -520, 24);
    },
  ],
  [
    "diagonal-to-vertical",
    async (page, range, focus) => {
      const start = focus.tail - (focus.tail - focus.dropspot) * 0.58;
      await page.evaluate(
        ({ range, start }) => window.scrollTo(0, range.start + (range.end - range.start) * start),
        { range, start },
      );
      await page.waitForTimeout(1200);
      await wheelRun(page, 95, 170, 35);
    },
  ],
];

const focus = JSON.parse(
  (await import("node:fs")).readFileSync(
    process.env.FOCUS_FILE ?? "docs/review/v9-release/metrics/route-focus.json",
    "utf8",
  ),
).desktop;

for (const [name, run] of scenarios) {
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page
    .locator("section[aria-label='Spatial system tour'] .sticky")
    .waitFor({ state: "attached", timeout: 30000 });
  await page.waitForTimeout(500);
  const range = await page.evaluate(() => {
    const section = document.querySelector("section[aria-label='Spatial system tour']");
    const spacer = section.querySelector(":scope > div");
    const start = section.getBoundingClientRect().top + window.scrollY;
    return { start, end: start + spacer.getBoundingClientRect().height - window.innerHeight };
  });
  await run(page, range, focus);
  await page.waitForTimeout(1500);
  const video = page.video();
  await context.close();
  const path = `${OUT}/${W}x${H}--${name}.webm`;
  renameSync(await video.path(), path);
  manifest.recordings.push(path);
  manifest.consoleErrors.push({ name, errors });
  console.log(`recorded ${path}`);
}

writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));
await browser.close();
