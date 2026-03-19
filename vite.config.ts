import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "@svgr/rollup";
import eslint from "vite-plugin-eslint";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig((config) => ({
  plugins: [react(), svgr(), eslint({ failOnError: false })],
  preview: {
    port: 5173,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  esbuild: {
    drop: config.mode === "production" ? ["console", "debugger"] : [],
  },
}));
