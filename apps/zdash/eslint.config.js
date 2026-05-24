import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
};

const nodeGlobals = {
  process: "readonly",
};

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { "allowConstantExport": true }],
      "no-unused-vars": ["error", { "varsIgnorePattern": "^[A-Z_]" }],
    },
  },
  {
    files: ["src/main.jsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
