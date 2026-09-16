import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite rebases imported/CSS assets, but not public URLs stored in content JSON
// or JSX strings. Rebase those emitted literals too, before chunk hashing.
function publicArtworkBase() {
  let base = '/';
  return {
    name: 'vireth-public-artwork-base',
    apply: 'build',
    configResolved(config) { base = config.base; },
    renderChunk(code) {
      if (base === '/') return null;
      return { code: code.replace(/(["'`(])\/assets\//g, (_, prefix) => `${prefix}${base}assets/`), map: null };
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), publicArtworkBase()],
});
