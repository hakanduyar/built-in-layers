import { expect, test } from "@playwright/test";

test("a shared atlas selection survives a visit to its actual project", async ({ page }) => {
  await page.goto("/cinematic#atlas-dropspot");
  const plate = page.getByRole("link", { name: "Preview: DropSpot" });
  await expect(plate).toHaveAttribute("aria-current", "true");
  await expect(plate).toBeInViewport();
  await page.getByRole("link", { name: "Open project" }).click();
  await expect(page).toHaveURL(/\/work\/dropspot$/);
  await page.goBack();
  await expect(plate).toHaveAttribute("aria-current", "true");
});

test("a viewer can play, pause, change cuts and retain playback preferences", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/cinematic");
  await page.getByRole("button", { name: "Play film" }).click();
  await expect(page.getByRole("button", { name: "Pause film" })).toBeVisible();
  await page.getByRole("button", { name: "Sound off" }).click();
  await page.getByRole("button", { name: "Pause film" }).click();
  await page.getByRole("link", { name: "B · The absence" }).click();
  await expect(page.getByRole("button", { name: "Play film" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sound on" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the homepage opens the study and both edits are addressable by keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Film study/ }).click();
  await expect(page.getByRole("heading", { name: "The opening move." })).toBeVisible();
  const cutB = page.getByRole("link", { name: "B · The absence" });
  await cutB.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/cut=b/);
  await expect(page.locator("video")).toHaveAttribute("poster", "/cinematic/chess-b.webp");
  await page.goBack();
  await expect(page.locator("video")).toHaveAttribute("poster", "/cinematic/chess-a.webp");
});

test("a reduced-motion visit starts with a poster and offers the project atlas", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/cinematic?cut=b&lang=tr");
  await expect(page.getByRole("heading", { name: "Açılış hamlesi." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Filmi oynat" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ses kapalı" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.locator("video")).not.toHaveAttribute("src", /.+/);
  await page.getByRole("link", { name: "Projeleri keşfet" }).click();
  await expect(page).toHaveURL(/#atlas$/);
  await expect(page.locator("#atlas").getByRole("link").first()).toBeVisible();
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/cut=b&lang=en/);
  await expect(page.getByRole("heading", { name: "The opening move." })).toBeVisible();
});
