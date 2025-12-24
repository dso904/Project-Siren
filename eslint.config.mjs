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
    // Custom ignores for standalone Node.js scripts:
    "dns-server.js",
    "start-exhibition.bat",
  ]),
  // Custom rule overrides
  {
    rules: {
      // React hooks exhaustive-deps can be too strict for complex animations
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
