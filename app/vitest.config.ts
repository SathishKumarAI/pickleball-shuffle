import { defineConfig } from "vitest/config";

// Unit tests for the pure game/card logic in lib/ (backlog F251, F253).
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "lib/**/*.test.tsx"],
  },
});
