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
      await expect
        .poll(
          async () =>
            Math.abs(
              Number(await field.evaluate((e) => e.style.getPropertyValue("--travel"))) -
                (0.48 - 0.14) / 0.82,
            ),
          { timeout: 15000 },
        )
        .toBeLessThan(0.005);
      const outgoingOriginal = page
        .locator(`[data-scene="${source}"] [data-project-ground-source] img`)
        .first();
      await expect(outgoingOriginal).toHaveCSS("opacity", "0");
      const archive = field.locator("[data-depth-corridor]");
      await expect(archive).toHaveCSS("opacity", "1", { timeout: 15000 });
      await expect(archive).toHaveCSS("isolation", "isolate");
      await expect(archive).toHaveCSS("z-index", "0");
      const images = await archive
        .locator("[data-archive-frame]")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-archive-frame")));
      // A loop repeats each reel once; every logical slot has its own photo.
      expect(new Set(images).size).toBe(mobile ? 144 : 216);
      expect(images.length).toBe(new Set(images).size * 2);
      const visibleArchive = await archive.evaluate((root) => {
        const photos: { rail: number; left: number; right: number; top: number; bottom: number }[] =
          [];
        Array.from(root.children).forEach((rail, index) => {
          const window = rail.firstElementChild!;
          if (
            getComputedStyle(rail).visibility === "hidden" ||
            getComputedStyle(window).visibility === "hidden" ||
            Number(getComputedStyle(rail).opacity) * Number(getComputedStyle(window).opacity) < 0.1
          )
            return;
          const clip = window.getBoundingClientRect();
          for (const exposure of rail.querySelectorAll("[data-archive-frame]")) {
            const r = exposure.firstElementChild!.getBoundingClientRect();
            const box = {
              rail: index,
              left: Math.max(0, clip.left, r.left),
              right: Math.min(innerWidth, clip.right, r.right),
              top: Math.max(0, clip.top, r.top),
              bottom: Math.min(innerHeight, clip.bottom, r.bottom),
            };
            if (box.right - box.left > 4 && box.bottom - box.top > 4) photos.push(box);
          }
        });
        let overlaps = 0;
        photos.forEach((a, index) => {
          for (const b of photos.slice(index + 1)) {
            if (
              a.rail !== b.rail &&
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
            )
              overlaps++;
          }
        });
        return { count: photos.length, overlaps };
      });
      expect(visibleArchive.count).toBeGreaterThan(5);
      expect(visibleArchive.overlaps).toBe(0);
      const moving = field.locator("[data-signal-landing]");
      await expect(moving).toHaveCSS("z-index", "1");
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
      await expect(outgoingOriginal).toHaveCSS("opacity", "1");
    });
  }
}
test("reduced motion keeps the original static project route", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-signal-passage]")).toHaveCount(0);
  await expect(page.locator('a[href="/work/dropspot"]').first()).toBeVisible();
});
