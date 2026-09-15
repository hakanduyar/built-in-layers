import { expect, test, type Page } from "@playwright/test";
import { ROUTE_STATIONS } from "@/lib/spatial/routeNavigation";

// V14.9 NAVIGATION GATE browser contracts.
//
// What is under test is behaviour a browser has to produce: that a click and an
// arrow key really move the camera along the real route, that the navigator's
// active station observes camera presentation (or lower document position), not the
// control that was pressed, and -- the contract the owner's brief is most
// explicit about -- that free scrolling still works exactly as it did, before
// and after a navigation.
//
// Deliberately NOT tested here: art direction, tick geometry, timings.

const NAV = "[data-route-navigator]";
const RAIL = "[data-nav-rail]";
const READOUT = "[data-nav-readout]";

/** Wait until the document AND the presented camera have stopped moving. Navigation is a real smooth
 *  scroll through the real route, so every assertion about where the reader
 *  ended up has to wait for the journey to finish rather than for a timeout. */
async function settle(page: Page) {
  // Reset the counters first. Reusing them across calls let a second settle()
  // return on its first poll -- while the click it was waiting on had not yet
  // started moving the document -- which is a flaky test, not a slow page.
  await page.evaluate(() => {
    const w = window as unknown as { __navLast?: string; __navStill?: number };
    w.__navLast = undefined;
    w.__navStill = 0;
  });
  await page.waitForTimeout(150);
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __navLast?: string; __navStill?: number };
      const y = `${Math.round(window.scrollY)}:${document.querySelector<HTMLElement>('[data-camera-plane="world"]')?.style.transform ?? ""}`;
      if (w.__navLast === y) w.__navStill = (w.__navStill ?? 0) + 1;
      else w.__navStill = 0;
      w.__navLast = y;
      return (w.__navStill ?? 0) > 3;
    },
    undefined,
    { timeout: 15000, polling: 100 },
  );
}

async function enterRoute(page: Page) {
  await page.goto("/");
  await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
  // Any movement past the top brings the navigator in.
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 200);
  await expect(page.locator(NAV)).toBeVisible();
  await settle(page);
}

async function activeStation(page: Page): Promise<string | null> {
  return page.locator(READOUT).getAttribute("data-nav-readout");
}

test.describe("V14.9: the route navigator", () => {
  test("the rail stays out of the first frame and arrives once the reader moves", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
    // At rest at the top the rail is present but not visible, so the hero's
    // first painted frame is what it was before this gate and no station is
    // focusable over it.
    await expect(page.locator(RAIL)).toBeHidden();
    await page.mouse.move(700, 400);
    await page.mouse.wheel(0, 200);
    await expect(page.locator(RAIL)).toBeVisible();
  });

  test("the rail is centred on the frame", async ({ page }) => {
    await enterRoute(page);
    const rail = await page.locator(`${RAIL} ol`).boundingBox();
    const width = page.viewportSize()!.width;
    expect(rail).not.toBeNull();
    // Centred to within a couple of pixels of the frame's own middle.
    expect(Math.abs(rail!.x + rail!.width / 2 - width / 2)).toBeLessThan(3);
  });

  test("the two arrows sit on the frame's edges, not in the rail", async ({ page }) => {
    await enterRoute(page);
    const width = page.viewportSize()!.width;
    const previous = await page.locator('[data-nav-step="previous"]').boundingBox();
    const next = await page.locator('[data-nav-step="next"]').boundingBox();
    expect(previous).not.toBeNull();
    expect(next).not.toBeNull();
    expect(previous!.x).toBeLessThan(width * 0.08);
    expect(next!.x + next!.width).toBeGreaterThan(width * 0.92);
    // ...and they are no longer children of the rail.
    await expect(page.locator(`${RAIL} [data-nav-step]`)).toHaveCount(0);
  });

  test("offers one station per real destination and nothing else", async ({ page }) => {
    await enterRoute(page);
    const ids = await page
      .locator("[data-nav-station]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-nav-station")));
    expect(ids).toEqual(ROUTE_STATIONS.map((station) => station.id));
    // The navigator adds no scenes to the world: the route still has its nine.
    await expect(page.locator("[data-scene]")).toHaveCount(9);
  });

  test("names the reader's position, and exactly one station is current", async ({ page }) => {
    await enterRoute(page);
    await expect(page.locator(`${NAV} [aria-current="true"]`)).toHaveCount(1);
    const readout = await activeStation(page);
    const current = await page
      .locator(`${NAV} [aria-current="true"]`)
      .getAttribute("data-nav-station");
    expect(readout).toBe(current);
  });

  test("a station click travels to that station", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="tail"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("tail");
    await expect(page.locator('[data-nav-station="tail"]')).toHaveAttribute("aria-current", "true");
  });

  test("a station click reaches the lower world across the cut", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="about"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("about");
    // It really arrived: the section is on screen, not merely reported.
    await expect(page.locator('[data-drift-block="about"]')).toBeInViewport();
  });

  test("travel is progressive, not a teleport", async ({ page }) => {
    await enterRoute(page);
    const samples: number[] = [];
    await page.evaluate(() => {
      const w = window as unknown as { __ys?: number[] };
      w.__ys = [];
      const push = () => {
        w.__ys!.push(window.scrollY);
        if (w.__ys!.length < 400) requestAnimationFrame(push);
      };
      requestAnimationFrame(push);
    });
    await page.locator('[data-nav-station="handoff"]').click();
    await settle(page);
    samples.push(
      ...(await page.evaluate(() => (window as unknown as { __ys: number[] }).__ys ?? [])),
    );
    const moved = samples.filter((y, i) => i > 0 && y !== samples[i - 1]);
    // A jump would produce one change; a real journey produces many frames of
    // intermediate positions.
    expect(moved.length).toBeGreaterThan(5);
  });
});

test.describe("V14.9: previous and next", () => {
  test("step one station along the route in each direction", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="jointledger"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("jointledger");

    await page.locator('[data-nav-step="next"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("dropspot");

    await page.locator('[data-nav-step="previous"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("jointledger");
  });

  test("name their destination, and stop at the ends of the journey", async ({ page }) => {
    await enterRoute(page);
    await expect(page.locator('[data-nav-step="next"]')).toHaveAttribute(
      "aria-label",
      /^Next section: .+/,
    );
    // At the first station there is nowhere back to.
    await page.locator(`[data-nav-station="${ROUTE_STATIONS[0]!.id}"]`).click();
    await settle(page);
    await expect(page.locator('[data-nav-step="previous"]')).toBeDisabled();

    const last = ROUTE_STATIONS[ROUTE_STATIONS.length - 1]!;
    await page.locator(`[data-nav-station="${last.id}"]`).click();
    await settle(page);
    await expect(page.locator('[data-nav-step="next"]')).toBeDisabled();
  });
});

test.describe("V14.9: the keyboard", () => {
  test("ArrowRight and ArrowLeft move one station", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="kivilcim"]').click();
    await settle(page);

    await page.locator("body").press("ArrowRight");
    await settle(page);
    expect(await activeStation(page)).toBe("jointledger");

    await page.locator("body").press("ArrowLeft");
    await settle(page);
    expect(await activeStation(page)).toBe("kivilcim");
  });

  test("leaves the browser's own scrolling keys alone", async ({ page }) => {
    await enterRoute(page);
    const before = await page.evaluate(() => window.scrollY);
    await page.locator("body").press("ArrowDown");
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => window.scrollY);
    // ArrowDown is the reader's own free scrolling and is not intercepted.
    expect(after).toBeGreaterThan(before);
  });
});

test.describe("V14.9: navigation and free scroll coexist", () => {
  test("free scrolling updates the navigator", async ({ page }) => {
    await enterRoute(page);
    const start = await activeStation(page);
    await page.mouse.move(700, 400);
    for (let i = 0; i < 30; i += 1) await page.mouse.wheel(0, 240);
    await settle(page);
    expect(await activeStation(page)).not.toBe(start);
  });

  test("the reader can resume free scrolling immediately after navigating", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="dropspot"]').click();
    await settle(page);
    const afterNav = await page.evaluate(() => window.scrollY);

    await page.mouse.move(700, 400);
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, 240);
    await settle(page);
    const afterWheel = await page.evaluate(() => window.scrollY);
    expect(afterWheel).toBeGreaterThan(afterNav);

    // ...and back up again: nothing has latched the reader to a station.
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, -240);
    await settle(page);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(afterWheel);
  });
});

test.describe("V14.14: the instrument's clearance and its destination preview", () => {
  test("claims a clearance only where the page's own content runs under it", async ({ page }) => {
    await enterRoute(page);
    // Through the route the camera's 14vh inset already leaves the band empty.
    await expect(page.locator("[data-nav-clearance]")).toHaveCount(0);

    await page.locator('[data-nav-station="field-notes"]').click();
    await settle(page);
    await expect(page.locator("[data-nav-clearance]")).toHaveCount(1);
  });

  test("leaves no lower-world text colliding with the instrument's own marks", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="field-notes"]').click();
    await settle(page);

    // Every piece of page text that reaches the band the readout and rail
    // occupy must be inside the clearance, not sharing pixels with the marks.
    const uncovered = await page.evaluate(() => {
      const rail = document.querySelector("[data-nav-rail] ol");
      const readout = document.querySelector("[data-nav-readout]");
      const clearance = document.querySelector("[data-nav-clearance] > div");
      if (!rail || !readout || !clearance) return ["missing instrument"];
      const r = rail.getBoundingClientRect();
      const o = readout.getBoundingClientRect();
      const c = clearance.getBoundingClientRect();
      const band = {
        top: Math.min(r.top, o.top),
        bottom: Math.max(r.bottom, o.bottom),
        left: Math.min(r.left, o.left),
        right: Math.max(r.right, o.right),
      };
      const bad: string[] = [];
      for (const el of document.querySelectorAll("main *, footer *")) {
        if (el.closest("[data-route-navigator]")) continue;
        if (!el.textContent?.trim() || el.children.length) continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        if (b.bottom < band.top || b.top > band.bottom) continue;
        if (b.right < band.left || b.left > band.right) continue;
        const covered =
          Math.max(b.top, band.top) >= c.top &&
          Math.min(b.bottom, band.bottom) <= c.bottom &&
          Math.max(b.left, band.left) >= c.left &&
          Math.min(b.right, band.right) <= c.right;
        if (!covered) bad.push(el.textContent.trim().slice(0, 40));
      }
      return bad;
    });
    expect(uncovered).toEqual([]);
  });

  test("names a destination under the pointer, and nowhere else", async ({ page }) => {
    await enterRoute(page);
    const preview = page.locator('[data-nav-preview="jointledger"]');
    // Present for nobody until the reader is on the tick.
    expect(await preview.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");

    await page.locator('[data-nav-station="jointledger"]').hover();
    await expect.poll(async () => preview.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    expect((await preview.textContent())?.trim()).toBe("03 JointLedger");
  });

  test("names a destination on keyboard focus too, without disturbing its accessible name", async ({
    page,
  }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="about"]').focus();
    await expect
      .poll(async () =>
        page.locator('[data-nav-preview="about"]').evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe("1");
    // The visible preview is decorative: the tick keeps one accessible name.
    await expect(page.locator('[data-nav-station="about"]')).toHaveAccessibleName("08, About");
  });
});

test.describe("V14.10: the first-load cue", () => {
  test("suggests left/right once, then never again this session", async ({ page }) => {
    await page.goto("/");
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
    // Only an available direction may advertise movement.
    await expect(page.locator('[data-nav-step="next"][data-nav-cue="true"]')).toHaveCount(1);
    await expect(page.locator('[data-nav-step="previous"]')).toBeDisabled();
    await expect(page.locator('[data-nav-step="previous"]')).not.toHaveAttribute(
      "data-nav-cue",
      "true",
    );
    expect(
      await page
        .locator('[data-nav-step="previous"]')
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe("none");
    const disabledChevron = page.locator('[data-nav-step="previous"] > span').first();
    const beforeHover = await disabledChevron.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    await page.locator('[data-nav-step="previous"]').hover();
    await page.waitForTimeout(300);
    expect(await disabledChevron.evaluate((element) => getComputedStyle(element).transform)).toBe(
      beforeHover,
    );

    // It gets out of the way the moment the reader moves.
    await page.mouse.move(700, 400);
    await page.mouse.wheel(0, 200);
    await expect(page.locator('[data-nav-cue="true"]')).toHaveCount(0);

    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page);
    await expect(page.locator('[data-nav-cue="true"]')).toHaveCount(0);

    // ...and it does not come back on the next page load in the same session.
    await page.goto("/");
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
    await page.waitForTimeout(400);
    await expect(page.locator('[data-nav-cue="true"]')).toHaveCount(0);
  });
});

test.describe("V14.9: the navigator is desktop-only", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("does not exist on a phone", async ({ page }) => {
    await page.goto("/");
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);
    await expect(page.locator(NAV)).toHaveCount(0);
  });
});

test.describe("V14.9: reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("stands down where there is no camera route to address", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(400);
    await expect(page.locator(NAV)).toHaveCount(0);
  });
});
