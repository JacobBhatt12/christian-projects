import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "storage", test: /node_modules\/dexie\// },
            { name: "validation", test: /node_modules\/zod\// },
          ],
        },
      },
    },
  },
});
