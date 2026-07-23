// ESLint 9 flat config, scoped narrowly to ONE plugin:
// `eslint-plugin-react-you-might-not-need-an-effect`. Biome still owns
// everything else (formatting, imports, general lints).
//
// Why the dual-linter setup: biome has no equivalent to these rules yet
// and no plugin API, so we run ESLint alongside biome purely for this
// class of check. Config surface stays tiny on purpose.
//
// The plugin ships 10 rules covering the sync-via-effect anti-pattern
// class:
//   - no-derived-state             (state that could be computed inline)
//   - no-adjust-state-when-a-prop-changes (sync-prop-to-state via effect)
//   - no-initialize-state          (redundant re-init effect)
//   - no-event-handler             (effect doing an event handler's job)
//   - no-empty-effect, no-chain-state-updates, no-pass-live-state-to-parent,
//     no-pass-data-to-parent, no-manage-parent,
//     no-reset-all-state-when-a-prop-changes
//
// See .audit/README.md for the ratcheting policy and query recipes.

import tsParser from "@typescript-eslint/parser";
import youMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";

// Enable every rule the plugin ships, at 'error'. The plugin's own
// `configs.recommended` sets them to 'warn' — we want CI to fail on
// regressions so the counter has teeth.
const rules = Object.fromEntries(
  Object.keys(youMightNotNeedAnEffect.rules).map((name) => [
    `react-you-might-not-need-an-effect/${name}`,
    "error",
  ]),
);

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-you-might-not-need-an-effect": youMightNotNeedAnEffect,
    },
    rules,
  },
];
