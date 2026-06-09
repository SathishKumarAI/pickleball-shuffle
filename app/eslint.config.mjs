import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // We intentionally load localStorage into state inside mount/open effects.
      // Reading localStorage during render would cause SSR hydration mismatches,
      // so the effect + setState pattern is the correct, SSR-safe approach here.
      // Keep it visible as a warning, but don't fail the build on it.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
