// sy-tomato-plugin/vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/contract/**/*.test.ts"],
    reporters: ["verbose"],
  },
});
