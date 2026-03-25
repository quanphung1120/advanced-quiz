import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export function createNodeConfig({
  ignores = ["dist", "coverage"],
  rules = {},
  tsconfigRootDir,
} = {}) {
  return defineConfig([
    globalIgnores(ignores),
    {
      files: ["**/*.{ts,mts,cts}"],
      extends: [js.configs.recommended, tseslint.configs.recommended],
      languageOptions: {
        ecmaVersion: 2022,
        globals: globals.node,
        parserOptions: {
          tsconfigRootDir,
        },
      },
      rules,
    },
  ]);
}
