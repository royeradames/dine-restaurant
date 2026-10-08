/** One site name, used by the visible logo, og:site_name and the WebSite JSON-LD. */
export const SITE_NAME = "Dine restaurant";
export const SITE_SHORT_NAME = "Dine";

/** Planned production home (<project>.royeradames.com); canonical and og:url resolve against it. */
export const SITE_URL = "https://dine-restaurant.royeradames.com";

/** Next replaces (not merges) a parent's openGraph, so every page spreads this in. */
export const baseOpenGraph = { siteName: SITE_NAME, type: "website", locale: "en_GB" } as const;
