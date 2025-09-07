import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit after implementing optimizations
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // Data management and utilities
          "vendor-data": [
            "@tanstack/react-query",
            "@tanstack/react-table",
            "date-fns",
            "lodash",
            "uuid",
            "zod",
          ],

          // Form and validation
          "vendor-forms": ["react-hook-form", "@hookform/resolvers"],

          // Icons and styling
          "vendor-styling": [
            "lucide-react",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "tailwindcss-animate",
          ],

          // Charts and data visualization
          "vendor-charts": ["recharts"],

          // DND and interactions
          "vendor-interactions": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/utilities",
          ],

          // Additional utilities
          "vendor-utils": [
            "sonner",
            "vaul",
            "next-themes",
            "embla-carousel-react",
            "input-otp",
            "react-day-picker",
            "react-resizable-panels",
            "cmdk",
          ],
        },
      },
    },
  },
}));
