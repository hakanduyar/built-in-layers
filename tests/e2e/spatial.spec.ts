import { expect, test } from "@playwright/test";
// V6.3: two route constants are imported rather than restated, so the windows
// these tests search inside cannot drift out of the region they are meant to
// cover when the route is retuned. Both are plain numbers from a module with no
// JSX and no browser dependency.
import {
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_REVEAL_END,
  routeLegs,
  sceneFocusProgress,
} from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// docs/DESIGN_SYSTEM.md §18). Tests experience contracts, not CSS transform
// values: scenes own real viewport territory, evidence is not a thumbnail,
// the route change reads as an occlusion cut, THE JOURNEY CONTINUES
// AS A DIAGONAL ROUTE AFTER THE BREAK, the atmosphere is scene-scoped and
// reduced-motion-safe, fallbacks are complete, keyboard/AT access is
// preserved, and existing project routes stay untouched.
//
// Deliberately no assertions on exact world coordinates or transform
// matrices-as-such: those are art direction and must stay free to move.
// Where a number appears it is a deliberately loose art-direction bound
// (e.g. "not a thumbnail", "not microtext", "x genuinely moved").

const TOUR = "section[aria-label='Spatial system tour']";

async function measureRoute(page: import("@playwright/test").Page, viewportHeight: number) {
  // `page.goto`'s load event does not guarantee hydration has finished, and
  // before it does the fallback (not the camera) is in the DOM -- wait for
  // the enhanced camera before measuring anything.
  await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
  const spacerHeight = await page.evaluate(
    (selector) => document.querySelector(`${selector} > div`)?.getBoundingClientRect().height ?? 0,
    TOUR,
  );
  const sectionTop = await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  }, TOUR);
  return { start: sectionTop, end: sectionTop + spacerHeight - viewportHeight, spacerHeight };
}

/** Extracts tx/ty from a computed `matrix(a, b, c, d, tx, ty)`. Parsed in
 *  Node -- `DOMMatrix` is browser-only, not available in the test process. */
function matrixTranslate(transform: string): { x: number; y: number } {
  const match = /matrix\(([^)]+)\)/.exec(transform);
  if (!match) return { x: 0, y: 0 };
  const parts = match[1]!.split(",");
  return {
    x: Number.parseFloat(parts[4]!.trim()) || 0,
    y: Number.parseFloat(parts[5]!.trim()) || 0,
  };
}

/**
 * Scrolls to a progress point and waits for the scroll-driven transform to
 * SETTLE -- two identical consecutive reads. Motion updates via a scroll+rAF
 * pipeline, so an immediate read can still return the previous position.
 *
 * Deliberately not "wait until it changes": a scroll that lands inside a
 * scene's dwell window legitimately leaves the camera where it was, and an
 * earlier version of this helper hung for its whole timeout on exactly that
 * case (sampling route one at progress 0.05, inside the hero's hold).
 */
async function worldTranslateAt(page: import("@playwright/test").Page, y: number) {
  // Wait on the browser's own scroll event and two subsequent frames, rather
  // than on a timeout. Motion updates the camera from that event via a rAF
  // pipeline, so this is the causal signal that THIS scroll has been
  // processed; a fixed delay was not enough on WebKit under parallel load
  // and silently produced stale (and in one case zeroed) measurements.
  await page.evaluate(
    (target) =>
      new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          window.removeEventListener("scroll", onScroll);
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        };
        const onScroll = () => finish();
        window.addEventListener("scroll", onScroll);
        window.scrollTo(0, Math.round(target));
        // A scroll to the position we are already at fires no event.
        setTimeout(finish, 500);
      }),
    y,
  );

  // V6.8: SETTLE IS NOW JUDGED IN THE PAGE, ON CONSECUTIVE rAF FRAMES, not on
  // wall-clock polls from the test process. The old helper accepted two identical
  // 60ms-spaced reads, and under parallel WebKit load that is satisfiable by
  // STARVATION -- two polls catching the same not-yet-painted frame while the
  // opening glide (GLIDE_MAX_RATE) is still mid-flight, which returned a moving
  // camera as "settled" and failed three tests with nonsense geometry. Counting
  // real rendered frames cannot be fooled that way: the glide writes on every
  // frame, so eight consecutive unchanged frames only exist once the camera has
  // actually arrived. Assertions fed by this helper are unchanged.
  const settled = await page.evaluate(
    (selector) =>
      new Promise<string | null>((resolve) => {
        const world = document.querySelector(`${selector} [data-camera-plane="world"]`);
        if (!world) return resolve(null);
        let last: string | null = null;
        let stable = 0;
        let frames = 0;
        const tick = () => {
          frames += 1;
          const t = getComputedStyle(world).transform;
          if (t === last && t !== "none") {
            stable += 1;
            if (stable >= 8) return resolve(t);
          } else {
            stable = 0;
            last = t;
          }
          // Hard ceiling so a pathological page cannot hang the suite: ~20s of
          // frames, after which the last reading is returned and the assertion
          // speaks for itself.
          if (frames > 1200) return resolve(t === "none" ? null : t);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    TOUR,
  );
  return settled === null ? null : matrixTranslate(settled);
}

async function worldTranslateXAt(page: import("@playwright/test").Page, y: number) {
  const point = await worldTranslateAt(page, y);
  return point === null ? null : point.x;
}

test.describe("Spatial V4: page identity unaffected", () => {
  test("h1 is still exactly the approved name; exactly one h1", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText("Hakan Duyar");
    await expect(h1).toHaveCount(1);
  });
});

test.describe("Spatial V4: scenes are composed from real loader data, not cards", () => {
  test("no ProjectCard list markup exists anywhere in the spatial world", async ({ page }) => {
    await page.goto("/");
    // ProjectCard renders each project as an <li>. A scene is not a list
    // item among siblings -- this is the structural contract that keeps V1's
    // rejected "tiny floating cards" from creeping back in.
    await expect(page.locator(`${TOUR} li`)).toHaveCount(0);
  });

  test("each project scene renders its real title, description, tech, and honest asset caption", async ({
    page,
  }) => {
    await page.goto("/");
    const tour = page.locator(TOUR);

    await expect(tour.getByRole("link", { name: /Kıvılcım/ })).toHaveAttribute(
      "href",
      "/work/kivilcim",
    );
    await expect(tour.getByRole("link", { name: "DropSpot" })).toHaveAttribute(
      "href",
      "/work/dropspot",
    );
    await expect(
      tour.getByText("A local-first system for planning, focus, and personal growth."),
    ).toBeAttached();
    await expect(
      tour.getByText("A fair claim and waitlist system for limited-stock product drops."),
    ).toBeAttached();
    // Real loader-fed tech lists, not retyped copy.
    await expect(tour.getByText(/Dexie/)).toBeAttached();
    await expect(tour.getByText(/PostgreSQL/).first()).toBeAttached();
    // D-019 honesty: the diagram scene must still say it is not a screenshot.
    await expect(tour.getByText(/Verified architecture diagram/i).first()).toBeAttached();
  });

  test("Kıvılcım keeps its Turkish orthography -- never CSS-uppercased into KIVILCIM", async ({
    page,
  }) => {
    await page.goto("/");
    const title = page.locator(TOUR).getByRole("link", { name: /Kıvılcım/ });
    await expect(title).toHaveText(/Kıvılcım/);
    await expect(title).not.toHaveCSS("text-transform", "uppercase");
  });
});

test.describe("Spatial V4: scene framing owns real viewport territory", () => {
  test("the focal evidence plate is viewport-scale, not a thumbnail, and titles are not microtext", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    // Kıvılcım's focal moment.
    await worldTranslateXAt(page, start + (end - start) * 0.3);

    const plate = page.locator(`${TOUR} img`).first();
    const box = await plate.boundingBox();
    expect(box, "expected a bounding box for the focal evidence plate").not.toBeNull();
    if (box) {
      // V1's cards capped images near 384px (~27% of a 1440px viewport).
      // A scene's evidence has to genuinely occupy the frame. Loose lower
      // bound on purpose -- this asserts "not a thumbnail", not a layout.
      expect(box.width).toBeGreaterThan(1440 * 0.45);
    }

    const titleSize = await page
      .locator(`${TOUR} h3`)
      .first()
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    expect(titleSize).toBeGreaterThan(36);
  });

  test("total route length stays controlled -- no return to V1's 600vh blind spacer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { spacerHeight } = await measureRoute(page, 900);
    expect(spacerHeight).toBeGreaterThan(900);
    // V6.3 raised the ceiling from 4.5 to 5.2 viewports, in step with
    // ROUTE_LENGTH_VH going 410 -> 474 to pay for the exit traverse. The reasoning
    // and the alternative are recorded in full on the matching unit test in
    // tests/unit/spatial-route.test.ts and in the V6.3 report; it is called out
    // rather than quietly widened. 5.2 still fails well before V1's 600vh spacer,
    // which is the thing this bound exists to prevent returning.
    // V7: four project scenes + SYSTEMS (was two projects). 640vh over ten
    // segments is ~64vh/segment — still a third of V1's per-scene cost.
    expect(spacerHeight).toBeLessThan(900 * 6.6);
  });
});

test.describe("Spatial V4: atmosphere", () => {
  test("V1's ember canvas is gone entirely", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(`${TOUR} canvas`)).toHaveCount(0);
  });

  // V6.5: the same contract -- enhanced-only atmosphere is genuinely present --
  // asserted against the current mechanism. The structural plane behind SYSTEMS is
  // the element that only exists under default motion.
  test("the SYSTEMS structural plane exists under default motion", async ({ page }) => {
    await page.goto("/");
    await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
    await expect(page.locator("[data-systems-cut]")).toHaveCount(1);
    // ...and the word itself is a single intact layer, in both trees.
    await expect(page.locator('[data-systems-layer="surface"]')).toHaveCount(1);
  });
});

test.describe("Spatial V4: no inaccessible transformed content", () => {
  test("off-camera content stays attached to the DOM so keyboard/AT users can reach it", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(TOUR).getByRole("link", { name: "DropSpot" })).toBeAttached();
  });

  test("focusing a not-yet-reached project link re-centers the camera so focus becomes visible", async ({
    page,
  }) => {
    await page.goto("/");
    // This contract is about the enhanced camera specifically, so wait for
    // it to exist. Without this the test can focus during hydration, while
    // the linear fallback is still mounted, and then assert against a
    // camera that only appeared afterwards -- a race in the test, not in
    // the component (it surfaced only on WebKit, only under full-suite
    // parallel load).
    await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
    const dropspotLink = page.locator(TOUR).getByRole("link", { name: "DropSpot" });
    await dropspotLink.focus();
    await expect(dropspotLink).toBeInViewport({ timeout: 10_000 });
  });

  test("Tab reaches project links with a visible focus state", async ({ page }) => {
    await page.goto("/");
    // Same reason as the test above: focusing before hydration finishes puts
    // focus on the fallback's link, which is then detached when the camera
    // tree replaces it. Surfaced only under full-suite parallel load.
    await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
    const kivilcimLink = page.locator(TOUR).getByRole("link", { name: /Kıvılcım/ });
    await kivilcimLink.focus();
    await expect(kivilcimLink).toBeFocused();
    const outline = await kivilcimLink.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(outline).not.toBe("0px");
  });
});

test.describe("Spatial V4: the route change reads as an occlusion cut", () => {
  test("world position after the break differs sharply from a continuation of the approach", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    const beforeCut = await worldTranslateXAt(page, start + (end - start) * 0.8);
    const afterBreak = await worldTranslateXAt(page, start + (end - start) * 0.92);
    expect(beforeCut).not.toBeNull();
    expect(afterBreak).not.toBeNull();
    if (beforeCut !== null && afterBreak !== null) {
      // The whole route travels left-to-right; the reposition lands far back
      // to the left. Nothing about this reads as the camera continuing on.
      expect(Math.abs(afterBreak - beforeCut)).toBeGreaterThan(400);
    }
  });

  // V8: this test is settle-bound, not assertion-bound -- it sweeps 17 samples
  // across the cut and waits at each for the camera's two-stage lag filter to
  // arrive, which the V6.6 and V7 notes above already record as taking seconds
  // from a cold jump. It has been inside the default 30s budget only by margin,
  // and V8's shorter route (ROUTE_LENGTH_VH 640 -> 600) moved BREAK_CUT, which
  // moved every sample. The budget is raised; not one assertion is touched.
  test("every break rail closes onto the frame at the cut, so no gap exposes the jump", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    test.setTimeout(120_000);
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    // The break is built from converging rails, not one sweeping panel
    // (V2's most conventional device). Several rails, closing from
    // alternating sides -- and at the cut all of them must be home.
    const rails = page.locator(`${TOUR} [data-break-rail]`);
    expect(await rails.count()).toBeGreaterThan(3);

    // The cut is DERIVED from route geometry in V4, so the test locates it
    // rather than hardcoding a progress value that silently goes stale when
    // the route is retuned. Sweep the collision region and take the frame
    // where the rails are closest to home.
    //
    // V6.3: the SEARCH WINDOW was itself hardcoded at [0.55, 0.70] -- which is
    // precisely the staleness the comment above set out to avoid, one level up.
    // The exit traverse moved BREAK_CUT from 0.577 to 0.506, the sweep no longer
    // contained the cut at all, and the test reported a 1440px gap at a point in
    // the route where the rails are legitimately wide open. The window is now
    // derived from the same constant the implementation uses, so it tracks any
    // future retune automatically.
    //
    // V6.6: the per-sample wait is a SETTLE POLL rather than a fixed 120ms. The rail
    // positions are a function of FILTERED progress, and the filter is a two-stage
    // lag driven from rAF -- so on a loaded machine (this was caught at a load
    // average of ~10, where rAF itself is starved) 120ms is not enough for the
    // filter to arrive, every sample reads a position the camera is still
    // travelling through, and the test reports a 1440px gap at the exact progress
    // where the rails are in fact home. That is the test measuring the filter's
    // convergence rate, not the geometry it exists to protect. The assertion below
    // is unchanged.
    const readWorst = () =>
      page.evaluate((selector) => {
        const offsets = [...document.querySelectorAll(`${selector} [data-break-rail]`)].map(
          (rail) => {
            const m = /matrix\(([^)]+)\)/.exec(getComputedStyle(rail).transform);
            return Math.abs(m ? Number.parseFloat(m[1]!.split(",")[4]!) : 0);
          },
        );
        return offsets.length ? Math.max(...offsets) : Number.POSITIVE_INFINITY;
      }, TOUR);

    let best = Number.POSITIVE_INFINITY;
    for (let p = BREAK_CUT - 0.04; p <= BREAK_CUT + 0.04; p += 0.005) {
      await page.evaluate((y) => window.scrollTo(0, Math.round(y)), start + (end - start) * p);
      let worst = await readWorst();
      let stable = 0;
      for (let attempt = 0; attempt < 80; attempt += 1) {
        await page.waitForTimeout(120);
        const next = await readWorst();
        stable = Math.abs(next - worst) < 0.5 ? stable + 1 : 0;
        worst = next;
        // V7: the route-wide progression ceiling means arrival can take a few
        // seconds from a cold jump, and near-arrival rail motion can dip under
        // the threshold briefly; require a longer proven-stable run before
        // trusting a sample. Assertion unchanged.
        if (stable >= 5 && attempt >= 8) break;
      }
      best = Math.min(best, worst);
    }
    // At the cut every rail is home, so the route's jump happens behind an
    // opaque frame and is never witnessed.
    expect(best).toBeLessThan(80);
  });

  test("rails converge from alternating sides rather than sweeping one way", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    // V6.7: DERIVED from the break window instead of the literal 0.7375 it used to
    // be. That literal predates two route retunes and had drifted to a progress
    // WELL PAST the reveal, where every rail is simply parked at its off-frame
    // resting offset -- so the test passed on parked geometry rather than on the
    // convergence its own name describes. Sampling 40% of the way through the
    // closing measures the rails actually converging, which is strictly what this
    // contract is about, and it tracks any future retune.
    const closing = BREAK_COVER_START + (BREAK_CUT - BREAK_COVER_START) * 0.4;
    await page.evaluate((y) => window.scrollTo(0, Math.round(y)), start + (end - start) * closing);

    // V6.7: settle-poll instead of a fixed 350ms, for the same reason the other two
    // break tests already do. The rails' transforms are written by Motion from a
    // rAF pipeline; under load on WebKit they had not been written at all when this
    // read, so `matrix(...)` did not match and every rail reported 0 -- which reads
    // as "no rail is off-frame on either side" and fails a contract about parked
    // geometry that was never actually violated. The assertions are unchanged.
    const read = () =>
      page.evaluate((selector) => {
        return [...document.querySelectorAll(`${selector} [data-break-rail]`)].map((rail) => {
          const m = /matrix\(([^)]+)\)/.exec(getComputedStyle(rail).transform);
          return m ? Number.parseFloat(m[1]!.split(",")[4]!) : 0;
        });
      }, TOUR);
    let offsets = await read();
    let stable = 0;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      await page.waitForTimeout(120);
      const next = await read();
      stable = JSON.stringify(next) === JSON.stringify(offsets) ? stable + 1 : 0;
      offsets = next;
      if (stable >= 2) break;
    }
    expect(offsets.some((value) => value > 1)).toBe(true);
    expect(offsets.some((value) => value < -1)).toBe(true);
  });
});

// The central V3 requirement (§5): after the collision the route must not
// drop into a straight-down / normal vertical flow. Both axes have to keep
// moving, and the new route has to be visibly a different one.
test.describe("Spatial V4: the route continues after the collision", () => {
  test("post-collision camera moves on BOTH axes on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    const at = (p: number) => worldTranslateAt(page, start + (end - start) * p);
    const landing = await at(0.79);
    const middle = await at(0.9);
    const final = await at(0.99);

    expect(landing).not.toBeNull();
    expect(middle).not.toBeNull();
    expect(final).not.toBeNull();
    if (!landing || !middle || !final) return;

    const xs = [landing.x, middle.x, final.x];
    const ys = [landing.y, middle.y, final.y];
    const deltaX = Math.max(...xs) - Math.min(...xs);
    const deltaY = Math.max(...ys) - Math.min(...ys);

    // Not "x moved a little": the second route is a real diagonal.
    expect(deltaX, "post-collision deltaX").toBeGreaterThan(200);
    expect(deltaY, "post-collision deltaY").toBeGreaterThan(100);
  });

  test("the second route runs at a visibly different slope from the first", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    // Sampled where the camera is genuinely travelling on each route, not
    // inside a dwell window at either end -- and, critically, ENTIRELY ON ONE
    // SIDE of the cut. Route one must be sampled strictly before the cut, and
    // route two strictly after BREAK_REVEAL_END
    // (0.6474). An earlier version of this test ended its "route one" span at
    // 0.64, which is past BREAK_CUT (0.6214), so the span crossed the
    // discontinuity and measured the reposition rather than route one: it
    // reported a slope of -3.0 for a route whose real slope is +0.76. That was
    // never a property of the camera -- `routeSlope(1)`/`routeSlope(2)` have
    // always been +0.76/-0.37, i.e. genuinely opposite -- it was the sample
    // window straddling the cut, and it measured the same wrong thing on V4.
    //
    // V6.3 HIT THE SAME BUG AGAIN, at two new boundaries, because the windows
    // were still literal numbers. The exit traverse moved the collision to
    // 0.444 and BREAK_CUT to 0.506, so the hardcoded "route one" span of
    // 0.16 -> 0.50 now ended INSIDE the impact; and route two's span of
    // 0.70 -> 0.99 ran past `handoff` into the traverse, which descends by
    // design, so it measured a route-two slope of the same sign as route one and
    // reported that the routes no longer diverge. The camera was right both
    // times; the windows were stale both times.
    //
    // So both are now derived. Route two is sampled across its THINKING leg
    // only -- reveal to `handoff` -- because that is the span this contract has
    // always been about: where the route goes after the cut, before it
    // leaves for the lower world. The traverse has its own assertions in the
    // unit suite.
    const handoffAt = sceneFocusProgress("handoff");
    const at = (p: number) => worldTranslateAt(page, start + (end - start) * p);
    const routeOneStart = await at(0.16);
    const routeOneEnd = await at(BREAK_COVER_START - 0.04);
    const routeTwoStart = await at(BREAK_REVEAL_END + 0.05);
    const routeTwoEnd = await at(handoffAt - 0.01);

    if (!routeOneStart || !routeOneEnd || !routeTwoStart || !routeTwoEnd) {
      throw new Error("expected four world transforms");
    }

    const slopeOne =
      (routeOneEnd.y - routeOneStart.y) / (routeOneEnd.x - routeOneStart.x || Number.NaN);
    const slopeTwo =
      (routeTwoEnd.y - routeTwoStart.y) / (routeTwoEnd.x - routeTwoStart.x || Number.NaN);

    expect(Number.isFinite(slopeOne)).toBe(true);
    expect(Number.isFinite(slopeTwo)).toBe(true);
    // Opposite sign: one descends to the right, the other climbs.
    expect(Math.sign(slopeOne)).not.toBe(Math.sign(slopeTwo));
    expect(Math.abs(slopeTwo - slopeOne)).toBeGreaterThan(0.2);
  });

  test("normal document flow is delayed until after the second-route teaser", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const tour = page.locator(TOUR);

    // The thinking region is reached inside the world, not after it: the
    // teaser lives in the spatial section, the ordinary sections do not.
    await expect(tour.getByRole("heading", { name: "Built in Layers" })).toBeAttached();
    for (const label of ["Surface", "Flow", "System"]) {
      await expect(tour.getByText(label, { exact: true }).first()).toBeAttached();
    }
    await expect(tour.getByRole("link", { name: "See every system" })).toBeAttached();
    await expect(tour.getByText("Back on the surface")).toBeAttached();

    // ...and the ordinary homepage still begins only after the tour ends.
    await expect(page.getByRole("heading", { name: "Selected systems" })).toBeAttached();
    const tourBottom = await tour.evaluate(
      (el) => el.getBoundingClientRect().bottom + window.scrollY,
    );
    const nextSectionTop = await page
      .getByRole("heading", { name: "Selected systems" })
      .evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    expect(nextSectionTop).toBeGreaterThan(tourBottom - 1);
  });

  test("real wheel input always moves the camera -- no dead zones", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
    await page.mouse.move(720, 450);

    // Driven with genuine wheel events rather than scrollTo, because the
    // defect V4 exists to fix was only visible under real scroll input: V3
    // measured a median of 0.00 camera px per scroll px here.
    const readWorld = () =>
      page.evaluate((selector) => {
        const el = document.querySelector(`${selector} [data-camera-plane="world"]`);
        const m = el ? /matrix\(([^)]+)\)/.exec(getComputedStyle(el).transform) : null;
        const p = m ? m[1]!.split(",") : null;
        return { x: p ? Number.parseFloat(p[4]!) : 0, y: p ? Number.parseFloat(p[5]!) : 0 };
      }, TOUR);

    // Get past the section's own lead-in so the route has actually started.
    for (let i = 0; i < 4; i += 1) {
      await page.mouse.wheel(0, 80);
      await page.waitForTimeout(90);
    }

    let stalls = 0;
    let steps = 0;
    let previous = await readWorld();
    for (let i = 0; i < 26; i += 1) {
      await page.mouse.wheel(0, 90);
      await page.waitForTimeout(180);
      const now = await readWorld();
      const moved = Math.hypot(now.x - previous.x, now.y - previous.y);
      const progressed = await page.evaluate(() => window.scrollY);
      if (progressed > 0) {
        steps += 1;
        if (moved < 4) stalls += 1;
      }
      previous = now;
    }

    expect(steps).toBeGreaterThan(15);
    // The collision hold is a real stationary window and may legitimately
    // account for a couple of these; a parked-scene design produced far more.
    expect(stalls, `${stalls} of ${steps} wheel steps moved the camera < 4px`).toBeLessThan(5);
  });

  test("depth planes move at different rates, and the world plane is authoritative", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);
    await worldTranslateAt(page, start + (end - start) * 0.3);

    const rates = await page.evaluate((selector) => {
      const read = (el: Element | null) => {
        const m = el ? /matrix\(([^)]+)\)/.exec(getComputedStyle(el).transform) : null;
        return m ? Number.parseFloat(m[1]!.split(",")[4]!) : 0;
      };
      const planes = [...document.querySelectorAll(`${selector} .sticky > div > div`)];
      const world = document.querySelector(`${selector} [data-camera-plane="world"]`);
      return { all: planes.map(read), world: read(world) };
    }, TOUR);

    // At least one plane behind the world and one in front of it.
    expect(rates.all.some((x) => Math.abs(x) < Math.abs(rates.world) - 50)).toBe(true);
    expect(rates.all.some((x) => Math.abs(x) > Math.abs(rates.world) + 50)).toBe(true);
  });

  test("depth planes add no duplicate screen-reader content", async ({ page }) => {
    await page.goto("/");
    await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
    const tour = page.locator(TOUR);

    // The parallax material echoes real titles as cropped shapes. Those
    // echoes exist in the DOM, so the contract is that they are out of the
    // ACCESSIBILITY tree -- assert with role queries, which respect
    // aria-hidden, not with text queries, which do not.
    await expect(tour.getByRole("heading", { level: 1 })).toHaveText("Hakan Duyar");
    await expect(tour.getByRole("link", { name: /Kıvılcım/ })).toHaveCount(1);
    await expect(tour.getByRole("link", { name: "DropSpot" })).toHaveCount(1);

    // Every plane that is NOT the world plane exists purely for depth, so
    // all of its content must be out of the accessibility tree.
    const exposed = await page.evaluate((selector) => {
      const planes = [...document.querySelectorAll(`${selector} .sticky > div > div`)].filter(
        (plane) => plane.getAttribute("data-camera-plane") !== "world",
      );
      return planes
        .flatMap((plane) => [...plane.children])
        .filter((child) => child.getAttribute("aria-hidden") !== "true").length;
    }, TOUR);
    expect(exposed).toBe(0);
  });

  test("the travel space carries orientation structure, sparsely", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });

    // Rails are drawn for every travelled leg -- present, but few. This is
    // an orientation system, not a particle field or a visible grid.
    // V4 draws each rail as a polyline sampled from the real camera curve,
    // not a straight chord, so the route can be a spline and the orientation
    // marks still describe the path the camera actually takes.
    //
    // V6.6 SPLIT THIS INTO TWO BOUNDS RATHER THAN RELAXING ONE. The SYSTEMS
    // surface cut draws the real route again, inside itself, as the thing found
    // under the opened page -- so a single lumped count of every polyline in the
    // sticky frame now mixes two subsystems with different jobs and different
    // budgets. Bounding them separately is strictly tighter than the old single
    // bound: the rails keep the <20 they always had (they are still 19, exactly as
    // before this pass), and the cut's drawing gets its own hard ceiling of 2 so it
    // cannot quietly grow into the grid this test exists to prevent.
    const allPolylines = await page.locator(`${TOUR} .sticky svg polyline`).count();
    const cutPolylines = await page
      .locator(`${TOUR} .sticky [data-systems-cut] svg polyline`)
      .count();
    const railCount = allPolylines - cutPolylines;
    // V6.7: DERIVED, not a literal ceiling. Route one gained the acquisition-descent
    // leg (JOB 1), so the rail count moved 19 -> 20 and a `< 20` bound failed for a
    // legitimate reason. A literal has now gone stale three times in this file's
    // history; asserting the exact number of legs the route actually has is both
    // tighter than the ceiling it replaces and immune to the next coordinate.
    expect(railCount).toBeGreaterThan(2);
    // One rail per travelled leg, plus the work branch and the two directional
    // fields' marks. Bounded RELATIVE TO THE ROUTE so that adding a coordinate --
    // which V6.7 did, with the acquisition descent -- moves the bound by exactly one
    // instead of failing. The previous literal `< 20` has now gone stale three times.
    // At V6.6 this was 9 legs and 19 rails; at V6.7 it is 10 and 20.
    expect(railCount).toBeLessThanOrEqual(routeLegs().length + 10);
    // The section drawing is one line per route, and may never be more.
    expect(cutPolylines).toBeLessThanOrEqual(2);
    await expect(page.locator(`${TOUR} canvas`)).toHaveCount(0);
  });
});

test.describe("Spatial V4: reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("renders a designed linear composition -- no camera, no atmosphere, all real content", async ({
    page,
  }) => {
    await page.goto("/");
    const tour = page.locator(TOUR);
    await expect(tour.getByRole("link", { name: /Kıvılcım/ })).toBeVisible();
    await expect(tour.getByRole("link", { name: "DropSpot" })).toBeVisible();
    await expect(tour.getByText("See every system")).toBeVisible();
    // Route two's beats survive as real composed sections, not as motion.
    await expect(tour.getByRole("heading", { name: "Built in Layers" })).toBeVisible();
    await expect(tour.getByText("architecture, data, and constraints")).toBeVisible();
    await expect(
      tour.getByText("I design clear interfaces and build the systems that make them work."),
    ).toBeVisible();
    // No pinned camera, no canvas, no drifting fragments, and no world
    // grammar (rails would describe a camera path that does not exist here).
    await expect(tour.locator(".sticky")).toHaveCount(0);
    await expect(tour.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-systems-cut]")).toHaveCount(0);
    await expect(page.locator("[data-destination-surface]")).toHaveCount(0);
    await expect(tour.locator("[data-break-rail]")).toHaveCount(0);
    // No parallax planes and therefore no depth motion at all.
    await expect(tour.locator("[data-camera-plane]")).toHaveCount(0);
    // Still a composed scene, not a stripped dump: the evidence plates and
    // their honest captions survive.
    expect(await tour.locator("img").count()).toBeGreaterThanOrEqual(2);
    await expect(tour.getByText(/Verified architecture diagram/i).first()).toBeVisible();
  });

  test("no horizontal overflow at 320/375/768/1024/1440px under reduced motion", async ({
    page,
  }) => {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Spatial V4: no JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("hero, real project content, and navigation remain usable without JS", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hakan Duyar");
    const tour = page.locator(TOUR);
    await expect(tour.getByRole("link", { name: /Kıvılcım/ })).toHaveAttribute(
      "href",
      "/work/kivilcim",
    );
    await expect(tour.getByRole("link", { name: "DropSpot" })).toHaveAttribute(
      "href",
      "/work/dropspot",
    );
    await expect(tour.getByRole("link", { name: "See every system" })).toHaveAttribute(
      "href",
      "/work",
    );
    for (const item of ["Home", "Work", "Notes", "Lab", "About"]) {
      await expect(page.getByRole("link", { name: item }).first()).toBeVisible();
    }
  });
});

test.describe("Spatial V4: mobile choreography", () => {
  test("mobile camera stays on a single vertical axis while desktop travels diagonally", async ({
    page,
  }) => {
    async function translateXAtFocalScene(width: number, height: number) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      const { start, end } = await measureRoute(page, height);
      return worldTranslateXAt(page, start + (end - start) * 0.55);
    }

    const desktopX = await translateXAtFocalScene(1440, 900);
    const mobileX = await translateXAtFocalScene(375, 812);

    expect(desktopX).not.toBeNull();
    expect(mobileX).not.toBeNull();
    if (desktopX !== null && mobileX !== null) {
      expect(Math.abs(desktopX)).toBeGreaterThan(50);
      expect(mobileX).toBe(0);
    }
  });

  test("project scenes stay readable at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 812);
    await worldTranslateXAt(page, start + (end - start) * 0.3);

    const titleSize = await page
      .locator(`${TOUR} h3`)
      .first()
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    expect(titleSize).toBeGreaterThan(24);

    const plate = await page.locator(`${TOUR} img`).first().boundingBox();
    expect(plate).not.toBeNull();
    if (plate) expect(plate.width).toBeGreaterThan(375 * 0.6);
  });

  test("mobile still breaks and reaches route two -- same world, different camera", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 812);

    const beforeBreak = await worldTranslateAt(page, start + (end - start) * 0.68);
    const afterBreak = await worldTranslateAt(page, start + (end - start) * 0.79);
    if (!beforeBreak || !afterBreak) throw new Error("expected mobile world transforms");

    // The reposition is a real discontinuity vertically, and x stays pinned
    // to the single axis: a large diagonal at 375px costs readability and
    // buys nothing (§17).
    expect(beforeBreak.x).toBe(0);
    expect(afterBreak.x).toBe(0);
    expect(Math.abs(afterBreak.y - beforeBreak.y)).toBeGreaterThan(400);
  });
});

test.describe("Spatial V4: existing project routes are unaffected", () => {
  for (const slug of ["kivilcim", "dropspot", "jointledger", "professional-systems"]) {
    test(`/work/${slug} still renders correctly`, async ({ page }) => {
      const response = await page.goto(`/work/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("the Work index lists all five projects in owner order (D-021)", async ({ page }) => {
    await page.goto("/");
    // V7: with the route-wide progression ceiling, let the camera actually
    // arrive at the handoff before clicking — the link's on-screen position is
    // a function of the governed visual value now.
    const { end } = await measureRoute(page, 900);
    await worldTranslateAt(page, end);
    await page.locator(TOUR).getByRole("link", { name: "See every system" }).click();
    await expect(page).toHaveURL(/\/work$/);
    const links = page.locator("main li a[href^='/work/']");
    await expect(links).toHaveCount(5);
    await expect(links.nth(0)).toHaveAttribute("href", "/work/software-factory");
    await expect(links.nth(1)).toHaveAttribute("href", "/work/kivilcim");
    await expect(links.nth(2)).toHaveAttribute("href", "/work/jointledger");
    await expect(links.nth(3)).toHaveAttribute("href", "/work/dropspot");
    await expect(links.nth(4)).toHaveAttribute("href", "/work/professional-systems");
  });
});

test.describe("Spatial V4: responsive", () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px (default motion)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
