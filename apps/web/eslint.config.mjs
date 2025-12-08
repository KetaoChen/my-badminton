import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "project/react-rules",
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-boolean-value": ["warn", "never"],
      "react/jsx-curly-brace-presence": [
        "warn",
        { props: "never", children: "never", propElementValues: "always" },
      ],
      "react/jsx-no-constructed-context-values": "warn",
      "react/jsx-no-target-blank": [
        "warn",
        { allowReferrer: false, enforceDynamicLinks: "always" },
      ],
      "react/jsx-pascal-case": "error",
      "react/no-array-index-key": "warn",
      "react/no-unstable-nested-components": "warn",
      "react/self-closing-comp": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
