// @ts-check
/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "dist/**",
      "node_modules/**",
      "**/*.min.js",
    ],
  },
];

export default config;

