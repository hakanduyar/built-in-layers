// Production Chromium motion gate. No application instrumentation or clock mocks.
// PROBE_PHASE=before|after node tests/tools/v14-12-motion-probe.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const phase = process.env.PROBE_PHASE ?? "before";
// V14.13: the output root is overridable so a later gate can re-run this probe
// without overwriting the gate that recorded it.
const out = process.env.PROBE_ROOT ?? "docs/review/v14.12-motion";
const bulk = `C:/Users/hakan/portfolio-review/v14.12-motion/${phase}`;
mkdirSync(out, { recursive: true });
mkdirSync(bulk, { recursive: true });
const browser = await chromium.launch();
const result = {};
const round = (n) => Math.round(n * 100) / 100;
for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const geom = await page.evaluate(() => {
    const s = document.querySelector("[data-route-spacer]");
    return {
      start: scrollY + s.getBoundingClientRect().top,
      span: s.offsetHeight - innerHeight,
      docHeight: document.documentElement.scrollHeight,
    };
  });
  const cases = {};
  async function capture(name, start, action, wait = 2800) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), start);
    await page.waitForTimeout(6000);
    await page.evaluate(() => {
      window.motionFrames = [];
      window.motionEvents = [];
      window.motionRecording = true;
      window.motionOrigin = performance.now();
      window.motionWheel ??= (e) =>
        window.motionRecording &&
        window.motionEvents.push({ ms: performance.now() - window.motionOrigin, delta: e.deltaY });
      window.addEventListener("wheel", window.motionWheel, { passive: true });
      const sample = () => {
        if (!window.motionRecording) return;
        const nodes = [...document.querySelectorAll("[data-scene]")].map((e) => {
          const subject =
            e.querySelector("[data-project-ground-source]") ?? e.querySelector("h1,h2,h3,p") ?? e;
          const r = subject.getBoundingClientRect();
          let opacity = 1;
          for (let a = subject; a && a !== document.body; a = a.parentElement)
            opacity *= Number(getComputedStyle(a).opacity);
          return { id: e.dataset.scene, x: r.x, y: r.y, w: r.width, h: r.height, opacity };
        });
        window.motionFrames.push({
          ms: performance.now() - window.motionOrigin,
          scroll: scrollY,
          active: document.querySelector("[data-nav-readout]")?.dataset.navReadout,
          nodes,
        });
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await action();
    await page.waitForTimeout(wait);
    const data = await page.evaluate(() => {
      window.motionRecording = false;
      return { frames: window.motionFrames, events: window.motionEvents };
    });
    writeFileSync(`${bulk}/${width}-${name}.json`, JSON.stringify(data));
    const f = data.frames,
      end = f.at(-1);
    const lastEvent = data.events.at(-1)?.ms ?? 0;
    let stop = 0;
    for (let i = 1; i < f.length; i++) if (Math.abs(f[i].scroll - f[i - 1].scroll) > 0.1) stop = i;
    const subject =
      end.active && end.nodes.find((n) => n.id === end.active) ? end.active : "kivilcim";
    const node = (a) => a.nodes.find((n) => n.id === subject);
    const dist = (a, b) => Math.hypot(node(a).x - node(b).x, node(a).y - node(b).y);
    let settled = dist(f[stop], end) > 1 ? stop + 1 : stop,
      travel = 0;
    for (let i = stop + 1; i < f.length; i++) {
      travel += dist(f[i], f[i - 1]);
      if (dist(f[i], end) > 1) settled = i + 1;
    }
    const moving = f
      .slice(1)
      .map((a, i) => ({ a, b: f[i], dt: a.ms - f[i].ms }))
      .filter((x) => x.dt > 0);
    const visible = moving.filter(({ a }) => {
      const n = node(a);
      return n.opacity >= 0.8 && n.x < width && n.x + n.w > 0 && n.y < height && n.y + n.h > 0;
    });
    const speeds = visible.map(({ a, b, dt }) => (dist(a, b) / dt) * 1000).sort((a, b) => a - b);
    const firstNamed = {};
    for (const a of f)
      if (a.active && !firstNamed[a.active]) {
        const n = a.nodes.find((n) => n.id === a.active);
        firstNamed[a.active] = {
          ms: round(a.ms),
          rect: n,
          inFrame: n ? n.x < width && n.x + n.w > 0 && n.y < height && n.y + n.h > 0 : null,
        };
      }
    cases[name] = {
      subject,
      lastEventMs: round(lastEvent),
      documentStopMs: round(f[stop].ms),
      documentCoastAfterEventPx: round(
        end.scroll - (f.find((a) => a.ms >= lastEvent)?.scroll ?? end.scroll),
      ),
      cameraTailPx: round(travel),
      cameraTailMs: round(f[Math.min(settled, f.length - 1)].ms - f[stop].ms),
      tailDistanceToFinalPx: round(dist(f[stop], end)),
      visibleSubjectP95SpeedPxS: round(speeds[Math.floor(speeds.length * 0.95)] ?? 0),
      visibleSubjectTravelAfterStopPx: round(travel * (node(f[stop]).opacity >= 0.8 ? 1 : 0)),
      firstNamed,
      finalScroll: end.scroll,
      frameCount: f.length,
    };
    console.log(width, name, JSON.stringify(cases[name]));
  }
  const pos = (p) => geom.start + geom.span * p;
  for (const [name, delta, count, interval, start] of [
    ["slow-forward", 40, 12, 120, 0.17],
    ["aggressive-forward", 400, 18, 16, 0.17],
    ["slow-reverse", -40, 12, 120, 0.36],
    ["aggressive-reverse", -400, 18, 16, 0.36],
  ])
    await capture(name, pos(start), async () => {
      for (let i = 0; i < count; i++) {
        await page.mouse.wheel(0, delta);
        await page.waitForTimeout(interval);
      }
    });
  await capture("fast-document-stop", pos(0.17), async () => {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), pos(0.3));
  });
  await capture("reverse-during-input", pos(0.23), async () => {
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(16);
    }
    await page.mouse.wheel(0, -400);
  });
  await capture(
    "navigation-free-scroll",
    pos(0.17),
    async () => {
      await page.locator('[data-nav-station="kivilcim"]').click();
      await page.mouse.wheel(0, 180);
    },
    4500,
  );
  await capture("lower-native", geom.start + geom.span + height * 1.5, async () => {
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(35);
    }
  });
  result[`${width}x${height}`] = { geom, cases };
  writeFileSync(`${out}/${phase}.json`, JSON.stringify(result, null, 2));
  await page.close();
}
await browser.close();
