import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import onlyWarn from "eslint-plugin-only-warn";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "@repo/prettier-config";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-typescript"],
        },
      },
    },
    plugins: {
      turbo: turboPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "prettier/prettier": ["warn", prettierConfig]
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
];
