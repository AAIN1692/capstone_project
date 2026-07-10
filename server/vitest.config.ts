import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      DB_PATH: ":memory:",
      CLIENT_ORIGIN: "http://localhost:5173",
    },
    testTimeout: 10000,
  },
});
