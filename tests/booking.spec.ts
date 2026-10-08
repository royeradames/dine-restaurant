import type { Page } from "@playwright/test";
import { expect, FIXED_NOW, test } from "./fixtures";

type Booking = { name: string; email: string; month: string; day: string; year: string; hour: string; minute: string };

const valid: Booking = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  month: "10",
  day: "15",
  year: "2026",
  hour: "07",
  minute: "30",
};

const field = (page: Page, label: string) => page.getByLabel(label, { exact: true });
const submit = (page: Page) => page.getByRole("button", { name: "Make reservation" }).click();

async function fill(page: Page, values: Partial<Booking>) {
  const labels: Record<keyof Booking, string> = {
    name: "Name",
    email: "Email",
    month: "Month",
    day: "Day",
    year: "Year",
    hour: "Hour",
    minute: "Minute",
  };
  for (const [key, value] of Object.entries(values) as [keyof Booking, string][]) {
    await field(page, labels[key]).fill(value);
  }
}

async function expectError(page: Page, label: string, message: string) {
  const input = field(page, label);
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription(message);
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto("/booking");
});

test("booking page has its own title, heading and the designed controls", async ({ page }) => {
  await expect(page).toHaveTitle("Reservations | Dine restaurant");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reservations");
  await expect(page.getByRole("link", { name: "Dine home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("group", { name: "Pick a date" }).getByRole("textbox")).toHaveCount(3);
  await expect(page.getByRole("group", { name: "Pick a time" }).getByRole("combobox", { name: "AM or PM" })).toHaveText("AM");
  await expect(page.getByRole("status")).toHaveText("4 people");
});

test("an empty submit shows every required message inline and focuses the name", async ({ page }) => {
  await submit(page);
  await expectError(page, "Name", "This field is required");
  await expectError(page, "Email", "This field is required");
  for (const label of ["Month", "Day", "Year"]) await expectError(page, label, "This field is incomplete");
  for (const label of ["Hour", "Minute"]) await expectError(page, label, "This field is incomplete");
  await expect(page.locator("#date-label")).toHaveCSS("color", "rgb(181, 73, 73)");
  await expect(field(page, "Name")).toBeFocused();
});

test("focus goes to the first invalid field and errors clear as they are fixed", async ({ page }) => {
  await fill(page, { name: "Ada", email: "ada@example.com", month: "10" });
  await submit(page);
  await expect(field(page, "Day")).toBeFocused();
  await expectError(page, "Day", "This field is incomplete");
  await expect(field(page, "Name")).not.toHaveAttribute("aria-invalid", "true");

  await fill(page, { day: "15", year: "2026" });
  await expect(field(page, "Month")).not.toHaveAttribute("aria-invalid", "true");
  await submit(page);
  await expect(field(page, "Hour")).toBeFocused();
  await fill(page, { hour: "7" });
  await submit(page);
  await expect(field(page, "Minute")).toBeFocused();
  await expectError(page, "Minute", "This field is incomplete");
});

test("email must be a valid address", async ({ page }) => {
  await fill(page, { ...valid, email: "ada@example" });
  await submit(page);
  await expectError(page, "Email", "Please use a valid email address");
  await expect(field(page, "Email")).toBeFocused();
  await fill(page, { email: "ada example.com" });
  await expectError(page, "Email", "Please use a valid email address");
  await fill(page, { email: valid.email });
  await expect(field(page, "Email")).not.toHaveAttribute("aria-invalid", "true");
});

const impossibleDates: { values: Partial<Booking>; focus: string }[] = [
  { values: { month: "13", day: "01", year: "2027" }, focus: "Month" },
  { values: { month: "00", day: "01", year: "2027" }, focus: "Month" },
  { values: { month: "02", day: "30", year: "2027" }, focus: "Day" },
  { values: { month: "02", day: "29", year: "2027" }, focus: "Day" },
  { values: { month: "04", day: "31", year: "2027" }, focus: "Day" },
  { values: { month: "01", day: "00", year: "2027" }, focus: "Day" },
  { values: { month: "01", day: "10", year: "202" }, focus: "Year" },
];

for (const { values, focus } of impossibleDates) {
  test(`rejects the impossible date ${values.month}/${values.day}/${values.year}`, async ({ page }) => {
    await fill(page, { ...valid, ...values });
    await submit(page);
    await expect(field(page, focus)).toBeFocused();
    await expectError(page, focus, "Please use a real date");
  });
}

test("accepts 29 February in a leap year", async ({ page }) => {
  await fill(page, { ...valid, month: "02", day: "29", year: "2028" });
  await submit(page);
  await expect(page.getByRole("heading", { name: "Demo booking checked" })).toBeFocused();
});

test("rejects past dates and earlier times today", async ({ page }) => {
  await fill(page, { ...valid, month: "10", day: "06", year: "2026" });
  await submit(page);
  await expectError(page, "Month", "Please pick today or a later date");
  await expect(field(page, "Month")).toBeFocused();

  await fill(page, { day: "07", hour: "09", minute: "59" });
  await expect(field(page, "Month")).not.toHaveAttribute("aria-invalid", "true");
  await expectError(page, "Hour", "Please pick a time later today");

  // 09:59 PM today is still ahead of 10:00 AM.
  const period = page.getByRole("combobox", { name: "AM or PM" });
  await period.click();
  await page.getByRole("option", { name: "PM" }).click();
  await expect(period).toHaveText("PM");
  await expect(field(page, "Hour")).not.toHaveAttribute("aria-invalid", "true");
});

const invalidTimes: { values: Partial<Booking>; focus: string }[] = [
  { values: { hour: "13", minute: "00" }, focus: "Hour" },
  { values: { hour: "00", minute: "30" }, focus: "Hour" },
  { values: { hour: "11", minute: "60" }, focus: "Minute" },
];

for (const { values, focus } of invalidTimes) {
  test(`rejects the invalid time ${values.hour}:${values.minute}`, async ({ page }) => {
    await fill(page, { ...valid, ...values });
    await submit(page);
    await expect(field(page, focus)).toBeFocused();
    await expectError(page, focus, "Please use a valid time");
  });
}

test("date and time boxes only take digits", async ({ page }) => {
  await field(page, "Month").pressSequentially("1a2b");
  await expect(field(page, "Month")).toHaveValue("12");
  await field(page, "Year").pressSequentially("20x261");
  await expect(field(page, "Year")).toHaveValue("2026");
});

test("a valid booking shows an honest demo confirmation and sends nothing", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") requests.push(`${request.method()} ${request.url()}`);
  });
  await fill(page, valid);
  await page.getByRole("button", { name: "Add one person" }).click();
  await submit(page);

  const heading = page.getByRole("heading", { name: "Demo booking checked" });
  await expect(heading).toBeFocused();
  const confirmation = page.getByRole("region", { name: "Demo booking checked" });
  await expect(confirmation).toContainText("Thanks, Ada Lovelace.");
  await expect(confirmation).toContainText("5 people on Thursday, 15 October 2026 at 07:30 AM");
  await expect(confirmation).toContainText("nothing was sent and no table is reserved");
  expect(requests).toEqual([]);
  await expect(page).toHaveURL(/\/booking$/);

  await page.getByRole("button", { name: "New booking" }).click();
  await expect(field(page, "Name")).toBeFocused();
  await expect(field(page, "Name")).toHaveValue("");
  await expect(page.getByRole("status")).toHaveText("4 people");
});

test("the people counter stays between 1 and 20", async ({ page }) => {
  const minus = page.getByRole("button", { name: "Remove one person" });
  const plus = page.getByRole("button", { name: "Add one person" });
  const count = page.getByRole("status");
  const note = page.locator("#people-note");

  for (let i = 0; i < 3; i++) await minus.click();
  await expect(count).toHaveText("1 person");
  await expect(minus).toHaveAttribute("aria-disabled", "true");
  await expect(note).toHaveText("");

  // At the limit the button stays focusable and explains why nothing happens.
  await minus.focus();
  await expect(minus).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(count).toHaveText("1 person");
  await expect(note).toHaveText("Online bookings are for 1 to 20 people.");

  await plus.click();
  await expect(note).toHaveText("");
  await expect(minus).not.toHaveAttribute("aria-disabled", "true");
  for (let i = 0; i < 18; i++) await plus.click();
  await expect(count).toHaveText("20 people");
  await expect(plus).toHaveAttribute("aria-disabled", "true");
  await plus.focus();
  await page.keyboard.press("Space");
  await expect(count).toHaveText("20 people");
  await expect(note).toHaveText("Online bookings are for 1 to 20 people.");
});

test("the AM/PM dropdown works by keyboard as designed", async ({ page }) => {
  const period = page.getByRole("combobox", { name: "AM or PM" });
  await period.focus();
  await page.keyboard.press("Enter");
  await expect(period).toHaveAttribute("aria-expanded", "true");
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  await expect(listbox.getByRole("option", { name: "AM" })).toHaveAttribute("aria-selected", "true");
  await expect(listbox).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await page.keyboard.press("ArrowDown");
  await expect(period).toHaveAttribute("aria-activedescendant", await listbox.getByRole("option", { name: "PM" }).getAttribute("id") ?? "");
  await page.keyboard.press("Enter");
  await expect(period).toHaveText("PM");
  await expect(period).toHaveAttribute("aria-expanded", "false");
  await expect(period).toBeFocused();

  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Home");
  await page.keyboard.press("Escape");
  await expect(period).toHaveText("PM");
  await expect(listbox).toBeHidden();

  await page.keyboard.press("a");
  await expect(period).toHaveText("AM");

  // The chevron keeps real padding from the control's right edge.
  const gap = await period.evaluate((button) => {
    const chevron = button.querySelector("img")!.getBoundingClientRect();
    return button.getBoundingClientRect().right - chevron.right;
  });
  expect(gap).toBeGreaterThanOrEqual(12);
});

test("a booking can be completed with the keyboard alone", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Dine home" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(field(page, "Name")).toBeFocused();
  await page.keyboard.type(valid.name);
  await page.keyboard.press("Tab");
  await page.keyboard.type(valid.email);
  for (const value of [valid.month, valid.day, valid.year, "8", "15"]) {
    await page.keyboard.press("Tab");
    await page.keyboard.type(value);
  }
  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox", { name: "AM or PM" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Remove one person" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Add one person" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Make reservation" })).toBeFocused();
  await page.keyboard.press("Enter");

  const confirmation = page.getByRole("region", { name: "Demo booking checked" });
  await expect(confirmation).toContainText("3 people on Thursday, 15 October 2026 at 08:15 PM");
  await expect(page.getByRole("heading", { name: "Demo booking checked" })).toBeFocused();
});

test("inputs and the submit button show their designed focus and hover states", async ({ page }) => {
  const name = field(page, "Name");
  await expect(name).toHaveCSS("border-bottom-color", "rgb(142, 142, 142)");
  await name.focus();
  await expect(name).toHaveCSS("border-bottom-color", "rgb(17, 17, 17)");

  const button = page.getByRole("button", { name: "Make reservation" });
  await expect(button).toHaveCSS("background-color", "rgb(17, 17, 17)");
  await button.hover();
  await expect(button).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(button).toHaveCSS("color", "rgb(17, 17, 17)");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the booking page explains that nothing can be sent", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reservations");
    await expect(page.getByText("Booking needs JavaScript to check your details.")).toBeVisible();
    await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  });
});

test("with JavaScript the no-script note stays hidden", async ({ page }) => {
  await expect(page.getByText("Booking needs JavaScript to check your details.")).toBeHidden();
});
