import { test as base, expect } from "@playwright/test";

/**
 * Every test fails on uncaught page errors, console errors or any request that
 * leaves the app's own origin (fonts and images must all be self-hosted).
 */
export const test = base.extend<{ pageProblems: string[] }>({
  pageProblems: [
    async ({ page, baseURL }, use) => {
      const origin = new URL(baseURL ?? "http://127.0.0.1:4411").origin;
      const problems: string[] = [];
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error") problems.push(`console: ${message.text()}`);
      });
      page.on("request", (request) => {
        const url = request.url();
        if (url.startsWith("data:") || url.startsWith("blob:")) return;
        if (new URL(url).origin !== origin) problems.push(`external request: ${url}`);
      });
      await use(problems);
      expect(problems, "page errors or external requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** A fixed "now" so past-date rules are deterministic: Wednesday 7 October 2026, 10:00 local time. */
export const FIXED_NOW = new Date(2026, 9, 7, 10, 0, 0);
