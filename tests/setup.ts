import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest.config.ts does not set `test.globals: true`, so
// @testing-library/react's automatic afterEach-cleanup detection (which
// only fires when `afterEach` already exists as a global) never registers.
// Without this, DOM trees from RTL's `render()` accumulate across every
// test in a file instead of unmounting between them -- required as of
// TASK-007's first real RTL-rendered interactive component test.
afterEach(() => {
  cleanup();
});
