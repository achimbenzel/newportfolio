import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["build", ".react-router", "public", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      // role="list" bewusst erlaubt: Safari entfernt sonst die Listen-Semantik bei list-style: none
      "jsx-a11y/no-redundant-roles": ["error", { ul: ["list"], ol: ["list"] }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@sanity/client", "@sanity/image-url"],
              message:
                "Sanity nur in ~/lib/sanity/*.server.ts verwenden (siehe docs/02-regeln.md).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/lib/sanity/**"],
    rules: { "no-restricted-imports": "off" },
  },
);
