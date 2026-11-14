import { expect, test } from "./fixtures";

const eventTabs = ["Family Gathering", "Special Events", "Social Events"] as const;

test("home page has its own title, language, icons and the starter content", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Dine restaurant | Exquisite dining since 1989");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Exquisite dining since 1989");
  for (const heading of [
    "Enjoyable place for all the family",
    "The most locally sourced food",
    "A few highlights from our menu",
    "Ready to make a reservation?",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
  for (const dish of ["Seared Salmon Fillet", "Rosemary Filet Mignon", "Summer Fruit Chocolate Mousse"]) {
    await expect(page.getByRole("heading", { level: 3, name: dish })).toBeVisible();
  }
  await expect(page.getByText("Marthwaite, Sedbergh")).toBeVisible();
  await expect(page.getByText("Sat - Sun: 09:00 AM - 11:30 PM")).toBeVisible();

  const bookLinks = page.getByRole("link", { name: "Book a table" });
  await expect(bookLinks).toHaveCount(3);
  for (const link of await bookLinks.all()) await expect(link).toHaveAttribute("href", "/booking");

  const hero = page.locator("header img");
  await expect(hero).toHaveJSProperty("complete", true);
  expect(await hero.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test("event tabs switch by click and expose the selected event", async ({ page }) => {
  await page.goto("/");
  const tablist = page.getByRole("tablist", { name: "Event types" });
  await expect(tablist.getByRole("tab")).toHaveText(eventTabs.map((name) => name));

  for (const [index, name] of eventTabs.entries()) {
    await tablist.getByRole("tab", { name }).click();
    for (const [otherIndex, other] of eventTabs.entries()) {
      const tab = tablist.getByRole("tab", { name: other });
      await expect(tab).toHaveAttribute("aria-selected", String(otherIndex === index));
      await expect(tab).toHaveAttribute("tabindex", otherIndex === index ? "0" : "-1");
    }
    const panel = page.getByRole("tabpanel");
    await expect(panel).toHaveCount(1);
    await expect(panel).toHaveAccessibleName(new RegExp(`^${name}$`, "i"));
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText(name);
    await expect(page.getByRole("img", { name: /table|glasses|friends/ }).filter({ visible: true })).toHaveCount(1);
  }
});

test("event tabs follow the arrow, Home and End keys", async ({ page }) => {
  await page.goto("/");
  const tab = (name: string) => page.getByRole("tab", { name });
  await tab("Family Gathering").focus();

  await page.keyboard.press("ArrowRight");
  await expect(tab("Special Events")).toBeFocused();
  await expect(tab("Special Events")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("romantic dinner");

  await page.keyboard.press("ArrowDown");
  await expect(tab("Social Events")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tab("Family Gathering")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tab("Social Events")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(tab("Special Events")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tab("Family Gathering")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tab("Social Events")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("larger social event");

  // Tab leaves the tablist for the selected panel's link instead of visiting each tab.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel").getByRole("link", { name: "Book a table" })).toBeFocused();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the first event is shown and the others stay hidden", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("tab", { name: "Family Gathering" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
    await expect(page.getByRole("tabpanel")).toContainText("We love catering for entire families.");
    await expect(page.getByText("romantic dinner")).toBeHidden();
    await expect(page.getByRole("img", { name: "Family passing bread, salads and pasta around a farmhouse table" })).toBeVisible();
  });
});

test("buttons and tabs show their designed hover states", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const heroButton = page.locator("header").getByRole("link", { name: "Book a table" });
  await expect(heroButton).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await heroButton.hover();
  await expect(heroButton).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(heroButton).toHaveCSS("color", "rgb(17, 17, 17)");

  const eventButton = page.getByRole("tabpanel").getByRole("link", { name: "Book a table" });
  await expect(eventButton).toHaveCSS("background-color", "rgb(17, 17, 17)");
  await eventButton.hover();
  await expect(eventButton).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(eventButton).toHaveCSS("border-top-color", "rgb(17, 17, 17)");

  const inactiveTab = page.getByRole("tab", { name: "Social Events" });
  await expect(inactiveTab).toHaveCSS("color", "rgb(118, 118, 118)");
  await inactiveTab.hover();
  await expect(inactiveTab).toHaveCSS("color", "rgb(76, 76, 76)");
});
