import { expect, test } from "@playwright/test";
import { scrollAtComposition } from "@/lib/spatial/passageScroll";
import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";

for (const [source, target] of [
  ["software-factory", "kivilcim"],
  ["kivilcim", "jointledger"],
  ["jointledger", "dropspot"],
] as const) {
  for (const width of [1440, 390]) {
    test(`the moving plate registers with ${target} and releases at ${width}px`, async ({
      page,
    }) => {
      const mobile = width < 1024;
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      const spacer = page.locator("[data-route-spacer]");
      const field = page.locator(`[data-signal-passage="${target}"]`);
      const from = sceneFocusProgress(source, mobile);
      const to = sceneFocusProgress(target, mobile);
      const seek = (fraction: number) =>
        spacer.evaluate(
          (el, p) => {
            scrollTo(
              0,
              el.getBoundingClientRect().top + scrollY + p * (el.clientHeight - innerHeight),
            );
          },
          scrollAtComposition(from + (to - from) * fraction, mobile),
        );

      await seek(0.48);
      // A programmatic seek still travels through the original touch camera governor.
      await expect(field).toBeVisible({ timeout: 15000 });
      const moving = field.locator(":scope > img");
      const original = page
        .locator(`[data-scene="${target}"] [data-project-ground-source] img`)
        .first();
      expect(await moving.getAttribute("src")).toEqual(await original.getAttribute("src"));
      // In the brief overlap after registration, both copies must own the same box.
      await seek(0.14 + 0.82 * 0.98);
      await expect
        .poll(
          async () => {
            const a = await moving.boundingBox();
            const b = await original.boundingBox();
            if (!a || !b) return Infinity;
            return Math.max(
              Math.abs(a.x - b.x),
              Math.abs(a.y - b.y),
              Math.abs(a.width - b.width),
              Math.abs(a.height - b.height),
            );
          },
          { timeout: 10000 },
        )
        .toBeLessThan(2);
      await seek(1);
      await expect(field).toBeHidden();
      await expect(original).toHaveCSS("opacity", "1");
      await seek(0.5);
      await expect(field).toBeVisible();
      await seek(0);
      await expect(field).toBeHidden();
    });
  }
}
test("reduced motion keeps the original static project route", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-signal-passage]")).toHaveCount(0);
  await expect(page.locator('a[href="/work/dropspot"]').first()).toBeVisible();
});
