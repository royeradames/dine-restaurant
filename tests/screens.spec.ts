import type { Page } from "@playwright/test";
import { test } from "./fixtures";

// Review captures for design comparison: SCREENS=1 npx playwright test screens
test.skip(!process.env.SCREENS, "set SCREENS=1 to capture review screenshots");

const widths = [375, 400, 768, 1440];

/** Loads every rendered image (lazy ones included) before a capture, without waiting on hidden ones. */
async function settleImages(page: Page) {
  await page.evaluate(async () => {
    const rendered = [...document.images].filter((image) => image.getClientRects().length > 0);
    for (const image of rendered) image.loading = "eager";
    await Promise.race([
      Promise.all(rendered.map((image) => (image.complete ? undefined : new Promise((done) => image.addEventListener("load", done, { once: true }))))),
      new Promise((done) => setTimeout(done, 5000)),
    ]);
  });
}

for (const width of widths) {
  test(`capture pages at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const [path, name] of [["/", "home"], ["/booking", "booking"]] as const) {
      await page.goto(path);
      await settleImages(page);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `screenshots/${name}-${width}.png`, fullPage: true });
    }

    await page.goto("/booking");
    await page.getByRole("button", { name: "Make reservation" }).click();
    await page.getByLabel("Name", { exact: true }).fill("John Apples");
    await page.getByLabel("Month", { exact: true }).fill("08");
    await page.getByLabel("Day", { exact: true }).fill("15");
    await page.getByRole("combobox", { name: "AM or PM" }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `screenshots/booking-errors-${width}.png`, fullPage: true });

    await page.goto("/booking");
    for (const [label, value] of [["Name", "John Apples"], ["Email", "john@example.com"], ["Month", "10"], ["Day", "15"], ["Year", "2027"], ["Hour", "07"], ["Minute", "30"]]) {
      await page.getByLabel(label, { exact: true }).fill(value);
    }
    await page.getByRole("button", { name: "Make reservation" }).click();
    await page.getByRole("heading", { name: "Demo booking checked" }).waitFor();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `screenshots/booking-success-${width}.png`, fullPage: true });

    await page.goto("/");
    for (const tab of ["Special Events", "Social Events"]) {
      await page.getByRole("tab", { name: tab }).click();
      const section = page.locator("section").filter({ has: page.getByRole("tablist") });
      await section.scrollIntoViewIfNeeded();
      await settleImages(page);
      await section.screenshot({ path: `screenshots/events-${tab.toLowerCase().replace(" ", "-")}-${width}.png` });
    }
  });
}
