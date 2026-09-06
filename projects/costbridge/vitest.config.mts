import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/search.ts", "lib/savings.ts", "lib/validation.ts"],
    },
  },
});
