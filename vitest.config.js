import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    include: /\.[jt]sx?$/,
    exclude: /node_modules/,
    loader: "jsx",
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: {
    environment: "jsdom",
    include: ["**/*.test.js"],
    setupFiles: ["./vitest.setup.js"],
  },
});
