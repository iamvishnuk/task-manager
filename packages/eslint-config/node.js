import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"
import tseslint from "typescript-eslint"

import { config as baseConfig } from "./base.js"

/**
 * A custom ESLint configuration for Node.js apps (no React/Next.js).
 *
 * @type {import("eslint").Linter.Config}
 */
export const nodeConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
]
