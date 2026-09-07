// V14.3 Gate E evidence tool: how present each lower-world section is as it
// ENTERS the viewport. Parks the page so a section's top sits at a fraction
// of the viewport height, lets the reveal and the register settle, and reads
// the computed opacity of the section's reveal wrapper, its register marks and
// (for About) the name -- the owner's "faded for too long" as numbers. Also
// prints the lower world's geometry: every section's top and height, the
// footer's top, the document's maximum scroll.
//
//   PROBE_BASE=http://127.0.0.1:3200 node tests/tools/entry-state-probe.mjs
import { chromium } from "@playwright/test";
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const [W, H] = (process.env.VP ?? "1440x900").split("x").map(Number);
const IDS = ["selected-systems", "how-i-build", "field-notes", "about"];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.goto(BASE, { waitUntil: "networkidle" });
await p.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
const routeEnd = await p.evaluate(() => {
  const s = document.querySelector("section[aria-label='Spatial system tour']");
  const sp = s.querySelector(":scope > div");
  const start = s.getBoundingClientRect().top + window.scrollY;
  return Math.round(start + sp.getBoundingClientRect().height - window.innerHeight);
});
await p.evaluate((y) => window.scrollTo(0, y), routeEnd);
await p.waitForTimeout(4000);
const geometry = await p.evaluate((ids) => {
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
  };
  const out = {
    docMax: document.documentElement.scrollHeight - window.innerHeight,
    footer: box(document.querySelector("footer")).top,
  };
  for (const id of ids) out[id] = box(document.querySelector(`[data-drift-block="${id}"]`));
  return out;
}, IDS);
console.log("geometry", JSON.stringify({ routeEnd, ...geometry }));
for (const id of IDS) {
  for (const f of [0.85, 0.65, 0.5, 0.3]) {
    const y = await p.evaluate(
      ({ id, f }) => {
        const el = document.querySelector(`[data-drift-block="${id}"]`);
        return Math.round(el.getBoundingClientRect().top + window.scrollY - window.innerHeight * f);
      },
      { id, f },
    );
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(700);
    const o = await p.evaluate((id) => {
      const el = document.querySelector(`[data-drift-block="${id}"]`);
      const op = (n) => (n ? Number(getComputedStyle(n).opacity).toFixed(3) : "-");
      const reg = el.querySelector("[data-node-register]");
      const arms = reg ? [...reg.querySelectorAll("span")].slice(0, 3).map(op) : [];
      return {
        reveal: op(el.querySelector("[data-reveal]")),
        arms,
        state: op(el.querySelector("[data-node-state]")),
        name: id === "about" ? op(el.querySelector("p.font-display")) : "-",
      };
    }, id);
    console.log(id.padEnd(17), `top@${f}vh`, JSON.stringify(o));
  }
}
await b.close();
