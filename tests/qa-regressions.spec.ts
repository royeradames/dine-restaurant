import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Regression checks for the October 8 width-sweep findings (overflow, overlap, tight-spacing,
// small-text, meta-identity). Each fails on the shipped layout and passes once it is fixed.

const widths = [320, 340, 360, 375, 560, 768, 770, 900, 1024, 1190, 1200, 1440, 1920];

/** In-flow children that cross the edge of a visible-overflow parent (the sweep's `overflow` rule, simplified). */
const spills = (page: Page) =>
  page.evaluate(() => {
    const outOfFlow = (el: Element, stop: Element) => {
      for (let n: Element | null = el; n && n !== stop; n = n.parentElement) {
        if (["absolute", "fixed"].includes(getComputedStyle(n).position)) return true;
      }
      return false;
    };
    const found: string[] = [];
    for (const parent of document.body.querySelectorAll("*")) {
      const style = getComputedStyle(parent);
      if (style.overflowX !== "visible" || style.display === "contents" || parent.scrollWidth <= parent.clientWidth + 1) continue;
      const box = parent.getBoundingClientRect();
      if (!box.width) continue;
      for (const child of parent.querySelectorAll("button, input, a, span, p, h1, h2, h3, li")) {
        if (outOfFlow(child, parent) || child.closest(".sr-only, [hidden]")) continue;
        const r = child.getBoundingClientRect();
        if (r.width && (r.right > box.right + 1 || r.left < box.left - 1)) found.push(`${child.textContent?.trim().slice(0, 30)} in ${parent.className.toString().slice(0, 40)}`);
      }
    }
    return [...new Set(found)];
  });

/** Text line boxes and image or control boxes painted inside an element. */
const inkOverlap = (page: Page, first: string, second: string) =>
  page.evaluate(([a, b]) => {
    const ink = (root: Element) => {
      const boxes: DOMRect[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.nodeValue?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) if (r.width > 0.5 && r.height > 0.5) boxes.push(r);
      }
      for (const control of root.querySelectorAll("img, svg, input, textarea, button, video")) {
        const r = control.getBoundingClientRect();
        if (r.width > 1 && r.height > 1 && getComputedStyle(control).visibility !== "hidden") boxes.push(r);
      }
      return boxes;
    };
    const left = ink(document.querySelector(a)!);
    const right = ink(document.querySelector(b)!);
    for (const x of left) for (const y of right) {
      const w = Math.min(x.right, y.right) - Math.max(x.left, y.left);
      const h = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
      if (w > 2 && h > Math.max(4, 0.3 * Math.min(x.height, y.height))) return `${Math.round(w)}x${Math.round(h)}px at y=${Math.round(y.top)}`;
    }
    return null;
  }, [first, second] as const);

for (const path of ["/", "/booking"]) {
  test(`${path} keeps every control and label inside its box from 320 to 1920 px`, async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await spills(page), `spill at ${width}px`).toEqual([]);
    }
  });

  test(`${path} keeps text at 16px or more at 320 px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(path);
    const small = await page.evaluate(() => {
      const found: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement!;
        if (!node.nodeValue?.trim() || parent.closest("script, style, noscript, [hidden], [data-sweep-allow-small]")) continue;
        const style = getComputedStyle(parent);
        if (style.display === "none" || style.visibility === "hidden" || !parent.getClientRects().length) continue;
        if (parseFloat(style.fontSize) < 16) found.push(`${style.fontSize} "${node.nodeValue.trim().slice(0, 30)}"`);
      }
      return found;
    });
    expect(small).toEqual([]);
  });

  test(`${path} declares og:site_name and WebSite JSON-LD`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Dine restaurant");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.map((text) => JSON.parse(text)["@type"])).toContain("WebSite");
  });
}

// The card sits over the decorative photo by design. The sweep's overlap finding came from the photo
// living inside <header>; with the photo moved behind both, header and card share no ink at any width.
test("the booking card overlaps only the decorative photo, never the header", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/booking");
    expect(await inkOverlap(page, "header", "main"), `at ${width}px`).toBeNull();
  }
});

test("empty-submit errors sit in the flow with room around them at every width", async ({ page }) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/booking");
    await page.getByRole("button", { name: "Make reservation" }).click();
    await expect(page.locator("#booking-name-error")).toBeVisible();
    const clashes = await page.evaluate(() => {
      const found: string[] = [];
      const form = document.querySelector("form")!;
      const errors = [...form.querySelectorAll("[id$='-error']")];
      const others = [...form.querySelectorAll("input, button, p, span")].filter((el) => !errors.some((e) => e === el || e.contains(el)) && el.getClientRects().length && !el.closest(".sr-only"));
      for (const error of errors) {
        if (getComputedStyle(error).position === "absolute") found.push(`${error.id} is absolutely positioned`);
        const box = error.getBoundingClientRect();
        for (const other of others) {
          const r = other.getBoundingClientRect();
          const across = Math.min(r.right, box.right) - Math.max(r.left, box.left);
          if (across <= 4 || !r.height) continue;
          const gap = Math.max(box.top - r.bottom, r.top - box.bottom);
          if (gap < 4) found.push(`${error.id} is ${Math.round(gap)}px from "${other.textContent?.trim().slice(0, 20) || other.id}"`);
        }
      }
      return found;
    });
    expect(clashes, `at ${width}px`).toEqual([]);
  }
});
