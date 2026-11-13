import { expect, test } from "./fixtures";

const SITE_NAME = "Dine restaurant";
// Next writes the root canonical and og:url without a trailing slash; JSON-LD uses the same string.
const HOME_URL = "https://dine-restaurant.royeradames.com";

const meta = (property: string) => `meta[property="${property}"]`;

test("home declares one site name in the logo, og:site_name and WebSite JSON-LD", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(meta("og:site_name"))).toHaveAttribute("content", SITE_NAME);
  await expect(page.locator(meta("og:type"))).toHaveAttribute("content", "website");
  await expect(page.locator(meta("og:url"))).toHaveAttribute("content", HOME_URL);
  await expect(page.locator(meta("og:title"))).toHaveAttribute("content", await page.title());
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", HOME_URL);
  await expect(page.locator("header").getByRole("img", { name: SITE_NAME, exact: true })).toBeVisible();

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const websites = blocks.map((text) => JSON.parse(text)).filter((data) => data["@type"] === "WebSite");
  expect(websites).toEqual([
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, alternateName: "Dine", url: HOME_URL },
  ]);
});

test("booking keeps the same site name and its own Open Graph title and URL", async ({ page }) => {
  await page.goto("/booking");
  await expect(page.locator(meta("og:site_name"))).toHaveAttribute("content", SITE_NAME);
  await expect(page.locator(meta("og:title"))).toHaveAttribute("content", "Reservations | Dine restaurant");
  await expect(page.locator(meta("og:url"))).toHaveAttribute("content", "https://dine-restaurant.royeradames.com/booking");
  await expect(page.locator(meta("og:description"))).toHaveAttribute(
    "content",
    (await page.locator('meta[name="description"]').getAttribute("content")) ?? "",
  );
  // The QA meta-identity check wants the same WebSite block on every page, not only the home page.
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks.map((text) => JSON.parse(text)).filter((data) => data["@type"] === "WebSite")).toEqual([
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, alternateName: "Dine", url: HOME_URL },
  ]);
});
