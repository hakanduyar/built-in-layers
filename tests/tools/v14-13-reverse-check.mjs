// V14.13: is the reverse residual bounded COAST, or forward debt being paid off?
// Two readings of the same gesture: reversing while the queue is still draining,
// and reversing after it has drained. Debt would survive the wait; coast cannot.
import { chromium } from "@playwright/test";
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const [W, H] = (process.env.VP ?? "1536x864").split("x").map(Number);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
await page.waitForTimeout(300);

async function run(settleMs) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.mouse.move(W / 2, H / 2);
  for (let i = 0; i < 14; i += 1) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(settleMs);
  const before = await page.evaluate(() => window.scrollY);
  let worst = 0,
    reversedAfter = null,
    notches = 0;
  const t0 = Date.now();
  for (let i = 0; i < 30 && reversedAfter === null; i += 1) {
    await page.mouse.wheel(0, -400);
    notches += 1;
    await page.waitForTimeout(50);
    const y = await page.evaluate(() => window.scrollY);
    worst = Math.max(worst, y - before);
    if (y < before - 2) reversedAfter = Date.now() - t0;
  }
  return { settleMs, wrongWayPx: Math.round(worst), notches, ms: reversedAfter };
}

console.log("while the queue is still draining:", JSON.stringify(await run(0)));
console.log("after the queue has drained:      ", JSON.stringify(await run(600)));
await browser.close();
