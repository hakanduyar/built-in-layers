// V10 (§O): one take, three input regimes, so the cap is visible rather than
// argued: gentle wheel -> aggressive repeated wheel -> reverse.
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.OUT ?? "C:/Users/hakan/portfolio-review/v10/recordings";
const W = Number(process.env.PROBE_W ?? 1536);
const H = Number(process.env.PROBE_H ?? 864);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: OUT, size: { width: W, height: H } },
});
const page = await context.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// GENTLE: a reader taking it in.
for (let i = 0; i < 90; i += 1) {
  await page.mouse.wheel(0, 70);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(800);

// AGGRESSIVE: hard repeated spinning. The route must not be brute-forced.
for (let i = 0; i < 60; i += 1) {
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(16);
}
await page.waitForTimeout(2000);

// REVERSE: direction change must respond, not pay off debt first.
for (let i = 0; i < 40; i += 1) {
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(30);
}
await page.waitForTimeout(1500);

const video = page.video();
await context.close();
renameSync(await video.path(), `${OUT}/${W}x${H}--gentle-aggressive-reverse.webm`);
console.log(`recorded ${OUT}/${W}x${H}--gentle-aggressive-reverse.webm`);
await browser.close();
