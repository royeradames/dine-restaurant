import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The starter ships every photo pre-sized at 1x and 2x for each breakpoint,
      // so pages use art-directed <picture> elements instead of next/image.
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([".next/**", "next-env.d.ts", "playwright-report/**", "test-results/**", "screenshots/**", "reference/**"]),
]);
