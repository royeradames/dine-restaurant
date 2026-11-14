import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const pages = ["/", "/booking"] as const;

/** Visible elements that own text, with their computed font size and a short label. */
const textSizes = (page: Page) =>
  page.evaluate(() => {
    const smallAllowed = (element: Element) =>
      Boolean(element.closest("footer, [id$='-error'], #people-note"));
    return [...document.querySelectorAll("body *")]
      .filter((element) => {
        if (element.closest("[hidden], noscript, script, style")) return false;
        const ownText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        if (!ownText) return false;
        const box = element.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        const style = getComputedStyle(element);
        // Visually hidden (sr-only) labels are clipped to 1px and never read on screen.
        return style.visibility !== "hidden" && !(box.width <= 1 && box.height <= 1);
      })
      .map((element) => ({
        text: element.textContent!.trim().slice(0, 40),
        size: parseFloat(getComputedStyle(element).fontSize),
        smallAllowed: smallAllowed(element),
      }));
  });

for (const path of pages) {
  test(`${path} never scrolls sideways from 375 to 1920 px`, async ({ page }) => {
    for (const width of [375, 400, 600, 768, 1024, 1199, 1200, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test(`${path} keeps text at its designed sizes at 400, 768 and 1440 px`, async ({ page }) => {
    for (const width of [400, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      if (path === "/booking") {
        // Show the inline errors too, so their size is measured.
        await page.getByRole("button", { name: "Make reservation" }).click();
        await expect(page.getByText("This field is required").first()).toBeVisible();
      }
      const sizes = await textSizes(page);
      expect(sizes.length).toBeGreaterThan(5);
      const tiny = sizes.filter((entry) => entry.size < 12);
      expect(tiny, `text under 12px at ${width}px`).toEqual([]);
      const small = sizes.filter((entry) => entry.size < 16 && !entry.smallAllowed);
      expect(small, `undesigned text under 16px at ${width}px`).toEqual([]);
    }
  });
}

test("each page has a unique title and description", async ({ page }) => {
  const seen = new Map<string, string>();
  for (const path of pages) {
    await page.goto(path);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length).toBeGreaterThan(50);
    expect(seen.has(title), `duplicate title ${title}`).toBe(false);
    seen.set(title, path);
  }
  expect([...seen.keys()]).toEqual(["Dine restaurant | Exquisite dining since 1989", "Reservations | Dine restaurant"]);
});
