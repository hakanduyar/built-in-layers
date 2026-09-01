// FINAL DESKTOP GATE — current-state diagnostic.
//
// Measures the P0s that decide the architecture, in a real browser:
//   1. FOCUS ISOLATION  neighbouring primary scene bounds vs the viewport, at
//                       each primary destination's own focus.
//   2. SHARPNESS CAUSE  the accumulated transform scale on the ancestor chain
//                       of real text and a real screenshot.
//   3. GROUND           whether each project's ground brackets its project.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.PROBE_OUT ?? "docs/review/v11-desktop-freeze/metrics";
const TAG = process.env.PROBE_TAG ?? "before";
mkdirSync(OUT, { recursive: true });

const FOCUS = JSON.parse(
  readFileSync(process.env.FOCUS_FILE ?? "docs/review/v9-release/metrics/route-focus.json", "utf8"),
).desktop;

// The five primary destinations, in final order. `tail` is the SYSTEMS beat.
const PRIMARY = ["software-factory", "kivilcim", "jointledger", "dropspot", "tail"];
const VIEWPORTS = (process.env.PROBE_VIEWPORTS ?? "1366x768,1440x900,1536x864,1920x1080,2560x1440")
  .split(",")
  .map((s) => s.split("x").map(Number));

const browser = await chromium.launch();
const report = { tag: TAG, viewports: {} };

for (const [W, H] of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const range = await page.evaluate(() => {
    const s = document.querySelector("section[aria-label='Spatial system tour']");
    const sp = s.querySelector(":scope > div");
    const t = s.getBoundingClientRect().top + window.scrollY;
    return { start: t, end: t + sp.getBoundingClientRect().height - window.innerHeight };
  });

  const settle = (sel) =>
    page
      .waitForFunction(
        (s) => {
          const el = document.querySelector(s);
          if (!el) return true;
          const r = el.getBoundingClientRect();
          const k = Math.round(r.top) + ":" + Math.round(r.left);
          const w = window;
          const n = w.__gk === k ? (w.__gn ?? 0) + 1 : 0;
          w.__gk = k;
          w.__gn = n;
          return n >= 4;
        },
        sel,
        { timeout: 30000, polling: 90 },
      )
      .then(() =>
        page.evaluate(() => {
          window.__gk = undefined;
          window.__gn = 0;
        }),
      );

  const stops = [];
  for (const id of PRIMARY) {
    await page.evaluate(({ r, v }) => window.scrollTo(0, r.start + (r.end - r.start) * v), {
      r: range,
      v: FOCUS[id],
    });
    await settle('[data-scene="' + id + '"]');
    const m = await page.evaluate(
      ({ id, primary }) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // A scene's painted ink PLUS its ground plane.
        const boundsOf = (sid) => {
          const scene = document.querySelector('[data-scene="' + sid + '"]');
          if (!scene) return null;
          let L = 1e9,
            R = -1e9,
            T = 1e9,
            B = -1e9;
          const add = (r) => {
            L = Math.min(L, r.left);
            R = Math.max(R, r.right);
            T = Math.min(T, r.top);
            B = Math.max(B, r.bottom);
          };
          for (const n of scene.querySelectorAll("*")) {
            const r = n.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) continue;
            const cs = getComputedStyle(n);
            if (cs.visibility === "hidden" || Number(cs.opacity) < 0.04) continue;
            add(r);
          }
          const plane = document.querySelector('[data-project-plane="' + sid + '"]');
          if (plane && Number(getComputedStyle(plane).opacity) >= 0.04) {
            add(plane.getBoundingClientRect());
          }
          return L > R ? null : { L, R, T, B };
        };
        const overlapPx = (b) => {
          if (!b) return 0;
          const x = Math.max(0, Math.min(b.R, vw) - Math.max(b.L, 0));
          const y = Math.max(0, Math.min(b.B, vh) - Math.max(b.T, 0));
          return Math.round(x * y);
        };
        const i = primary.indexOf(id);
        const prev = i > 0 ? primary[i - 1] : null;
        const next = i < primary.length - 1 ? primary[i + 1] : null;
        const self = boundsOf(id);
        const pb = prev ? boundsOf(prev) : null;
        const nb = next ? boundsOf(next) : null;
        const gapTo = (b) =>
          !b || !self
            ? null
            : b.L > self.R
              ? Math.round(b.L - self.R)
              : b.R < self.L
                ? Math.round(self.L - b.R)
                : 0;
        return {
          id,
          selfBox: self
            ? {
                w: Math.round(self.R - self.L),
                h: Math.round(self.B - self.T),
                L: Math.round(self.L),
                T: Math.round(self.T),
              }
            : null,
          prev: prev ? { id: prev, overlapPx: overlapPx(pb), gap: gapTo(pb) } : null,
          next: next ? { id: next, overlapPx: overlapPx(nb), gap: gapTo(nb) } : null,
          clippedBelow: self ? Math.max(0, Math.round(self.B - vh)) : 0,
        };
      },
      { id, primary: PRIMARY },
    );
    stops.push(m);
  }

  // SHARPNESS: accumulated transform scale over the ancestor chain of real text
  // and a real screenshot. A non-integer scale on an ancestor of text is the
  // classic cause of "sharp when stopped, soft while moving".
  await page.evaluate(({ r, v }) => window.scrollTo(0, r.start + (r.end - r.start) * v), {
    r: range,
    v: FOCUS["kivilcim"],
  });
  await settle('[data-scene="kivilcim"]');
  const sharpness = await page.evaluate(() => {
    const chainScale = (el) => {
      let sx = 1;
      let sy = 1;
      const chain = [];
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const cs = getComputedStyle(n);
        const t = cs.transform;
        if (t && t !== "none") {
          const m = /matrix\(([^)]+)\)/.exec(t);
          if (m) {
            const p = m[1].split(",").map(Number);
            if (Math.abs(p[0] - 1) > 1e-4 || Math.abs(p[3] - 1) > 1e-4) {
              sx *= p[0];
              sy *= p[3];
              const tag = n.dataset.cameraPlane ? "[" + n.dataset.cameraPlane + "]" : "";
              chain.push(n.tagName.toLowerCase() + tag + "=" + p[0].toFixed(4));
            }
          }
        }
        if (cs.filter && cs.filter !== "none") chain.push("filter=" + cs.filter);
        if (cs.willChange && cs.willChange !== "auto") chain.push("will-change=" + cs.willChange);
      }
      return { scaleX: +sx.toFixed(4), scaleY: +sy.toFixed(4), chain };
    };
    const scene = document.querySelector('[data-scene="kivilcim"]');
    const heading = scene ? scene.querySelector("h3") : null;
    const body = scene
      ? [...scene.querySelectorAll("p")].find((p) => (p.textContent || "").length > 30)
      : null;
    const img = document.querySelector('[data-scene="kivilcim"] img');
    return {
      heading: heading ? chainScale(heading) : null,
      body: body ? chainScale(body) : null,
      image: img
        ? Object.assign(chainScale(img), {
            natural: img.naturalWidth + "x" + img.naturalHeight,
            rendered:
              Math.round(img.getBoundingClientRect().width) +
              "x" +
              Math.round(img.getBoundingClientRect().height),
          })
        : null,
    };
  });

  report.viewports[W + "x" + H] = { stops, sharpness };
  const fails = stops.filter((s) => (s.prev?.overlapPx ?? 0) > 0 || (s.next?.overlapPx ?? 0) > 0);
  console.log(
    W +
      "x" +
      H +
      "  focusIsolation=" +
      (fails.length === 0 ? "PASS" : "FAIL(" + fails.map((f) => f.id).join(",") + ")") +
      "  textScale=" +
      sharpness.heading?.scaleX +
      "  imgScale=" +
      sharpness.image?.scaleX +
      "  img=" +
      sharpness.image?.natural +
      "->" +
      sharpness.image?.rendered,
  );
  for (const s of stops) {
    console.log(
      "    " +
        s.id.padEnd(17) +
        " prevOverlap=" +
        String(s.prev?.overlapPx ?? "-").padStart(9) +
        " nextOverlap=" +
        String(s.next?.overlapPx ?? "-").padStart(9) +
        "  gapPrev=" +
        String(s.prev?.gap ?? "-").padStart(5) +
        " gapNext=" +
        String(s.next?.gap ?? "-").padStart(5) +
        "  clippedBelow=" +
        s.clippedBelow,
    );
  }
  if (sharpness.heading) console.log("    text chain: " + sharpness.heading.chain.join(" < "));
  await context.close();
}

writeFileSync(OUT + "/desktop-gate-" + TAG + ".json", JSON.stringify(report, null, 2));
await browser.close();
