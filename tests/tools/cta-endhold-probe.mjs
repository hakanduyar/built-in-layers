// V9 (§15): is the CTA's end-hold real dead scroll, or did the recording simply
// stop scrolling?
//
// A video cannot answer that, because it does not record input. This drives real
// wheel events and records, per tick, how much INPUT was delivered against how
// much the page and the world actually moved. Dead scroll is input that buys no
// movement; a route that has simply ended is input that buys no movement because
// there is nowhere left to go -- and the two are told apart by whether the
// document is already at its maximum scroll offset.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.PROBE_OUT ?? "docs/review/v9-release/metrics";
const W = Number(process.env.PROBE_W ?? 1536);
const H = Number(process.env.PROBE_H ?? 864);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: W, height: H } });
const page = await context.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const ticks = [];
let atEndSince = null;
for (let i = 0; i < 700; i += 1) {
  const before = await page.evaluate(() => ({
    y: window.scrollY,
    max: document.documentElement.scrollHeight - window.innerHeight,
  }));
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(45);
  const after = await page.evaluate(() => ({
    y: window.scrollY,
    max: document.documentElement.scrollHeight - window.innerHeight,
  }));
  const moved = after.y - before.y;
  const atMax = after.y >= after.max - 1;
  ticks.push({ i, input: 100, moved: Math.round(moved), y: Math.round(after.y), atMax });
  if (atMax) {
    atEndSince = atEndSince ?? i;
    // Keep pushing past the end to prove the page really has nowhere to go.
    if (i - atEndSince > 12) break;
  }
}

const maxY = Math.max(...ticks.map((t) => t.y));
// A stall is input that produced no movement while the page still HAD somewhere
// to go. That is the only thing that qualifies as dead scroll.
const stalls = ticks.filter((t) => t.moved <= 1 && !t.atMax);
const runs = [];
let run = null;
for (const t of ticks) {
  const stalled = t.moved <= 1 && !t.atMax;
  if (stalled) {
    run = run ?? { fromTick: t.i, y: t.y, ticks: 0, input: 0 };
    run.ticks += 1;
    run.input += t.input;
  } else if (run) {
    runs.push(run);
    run = null;
  }
}
if (run) runs.push(run);

const tail = ticks.filter((t) => t.atMax);
const result = {
  viewport: `${W}x${H}`,
  totalTicks: ticks.length,
  maxScrollY: maxY,
  reachedEnd: tail.length > 0,
  ticksSpentAtEnd: tail.length,
  inputWastedAtEnd: tail.length * 100,
  stallTicksBeforeEnd: stalls.length,
  stallRuns: runs,
};
writeFileSync(`${OUT}/cta-endhold-${W}x${H}.json`, JSON.stringify({ ...result, ticks }, null, 2));
console.log(JSON.stringify(result, null, 1));
await browser.close();
