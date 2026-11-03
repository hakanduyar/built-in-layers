import { expect, test } from "@playwright/test";
import { scrollAtComposition } from "@/lib/spatial/passageScroll";
import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";

test("left and right glide through the passage to its next anchor in either direction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const spacer = page.locator("[data-route-spacer]");
  const { top, span } = await spacer.evaluate((el) => ({
    top: el.getBoundingClientRect().top + scrollY,
    span: el.clientHeight - innerHeight,
  }));
  const offset = (p: number) => Math.round(top + span * scrollAtComposition(p));
  const a = sceneFocusProgress("kivilcim"),
    b = sceneFocusProgress("jointledger");
  const start = offset(a),
    end = offset(b);
  await page.evaluate((y) => scrollTo(0, y), start);
  await expect(page.locator('[data-nav-readout="kivilcim"]')).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-signal-passage="jointledger"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(end);
  await expect(page.locator('[data-nav-readout="jointledger"]')).toBeVisible();
  // Start reverse travel just inside the leg after its marker has changed.
  await page.evaluate((y) => scrollTo(0, y), offset(a + (b - a) * 0.76));
  await expect(page.locator('[data-signal-passage="jointledger"]')).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(start);
  await expect(page.locator('[data-nav-readout="kivilcim"]')).toBeVisible();
});
test("a fresh seek into the last passage reads one of the two projects", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/");
  const midpoint = (sceneFocusProgress("jointledger") + sceneFocusProgress("dropspot")) / 2;
  await page.locator("[data-route-spacer]").evaluate((el, fraction) => {
    scrollTo(
      0,
      el.getBoundingClientRect().top + scrollY + fraction * (el.clientHeight - innerHeight),
    );
  }, scrollAtComposition(midpoint));
  await expect(page.locator('[data-signal-passage="dropspot"]')).toBeVisible();
  await expect(page.locator("[data-nav-readout]")).toHaveAttribute(
    "data-nav-readout",
    /^(jointledger|dropspot)$/,
  );
});
