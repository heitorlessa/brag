// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import oxlint from "eslint-plugin-oxlint";

export default withNuxt(
  // Disable ESLint rules that oxlint already handles.
  oxlint.configs.flat,
  {
    ignores: [
      ".nuxt/**",
      ".output/**",
      ".claude/**",
      "dist/**",
      "coverage/**",
      // Generated file — linted via oxlint only.
      "app/local-db/migrations.generated.ts",
    ],
  },
  {
    files: ["**/*.ts", "**/*.vue"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
    },
  },
  {
    // Nuxt sets stylistic: false — these warnings are noise, not bugs.
    files: ["**/*.vue"],
    rules: {
      "vue/html-self-closing": "off",
      "max-lines": "off",
      "import/no-unassigned-import": ["warn", { allow: ["**/*.css"] }],
    },
  }
);
