import { FIXED_NOW, test } from "./fixtures";

// Review captures for design comparison: SCREENS=1 npx playwright test screens
test.skip(!process.env.SCREENS, "set SCREENS=1 to capture review screenshots");

const widths = [375, 400, 768, 1440];

for (const width of widths) {
  test(`capture pages at ${width}px`, async ({ page }) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.setViewportSize({ width, height: 900 });
    for (const [path, name] of [["/", "home"], ["/booking", "booking"]] as const) {
      await page.goto(path);
      await page.evaluate(async () => {
        // Load lazy images before the full-page capture.
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
      });
      await page.screenshot({ path: `screenshots/${name}-${width}.png`, fullPage: true });
    }

    await page.goto("/booking");
    await page.getByRole("button", { name: "Make reservation" }).click();
    await page.getByLabel("Name", { exact: true }).fill("John Apples");
    await page.getByLabel("Month", { exact: true }).fill("08");
    await page.getByLabel("Day", { exact: true }).fill("15");
    await page.getByRole("combobox", { name: "AM or PM" }).click();
    await page.screenshot({ path: `screenshots/booking-errors-${width}.png`, fullPage: true });

    await page.goto("/booking");
    for (const [label, value] of [["Name", "John Apples"], ["Email", "john@example.com"], ["Month", "10"], ["Day", "15"], ["Year", "2026"], ["Hour", "07"], ["Minute", "30"]]) {
      await page.getByLabel(label, { exact: true }).fill(value);
    }
    await page.getByRole("button", { name: "Make reservation" }).click();
    await page.getByRole("heading", { name: "Demo booking checked" }).waitFor();
    await page.screenshot({ path: `screenshots/booking-success-${width}.png`, fullPage: true });

    await page.goto("/");
    for (const tab of ["Special Events", "Social Events"]) {
      await page.getByRole("tab", { name: tab }).click();
      const section = page.locator("section").filter({ has: page.getByRole("tablist") });
      await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode().catch(() => undefined))));
      await section.screenshot({ path: `screenshots/events-${tab.toLowerCase().replace(" ", "-")}-${width}.png` });
    }
  });
}
