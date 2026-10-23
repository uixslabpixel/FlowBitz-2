import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { resolve } from "path";

const root = new URL(".", import.meta.url).pathname;
const noExternal = ["react-helmet-async", /react-syntax-highlighter/, /^@fortawesome\//, "lucide-react"];

export default defineConfig({
  site: "https://www.flowbitz.dev",
  srcDir: "./src/astro",
  publicDir: "./public",
  outDir: "./dist",
  integrations: [react()],
  server: { port: 3000 },
  vite: {
    // Keep the existing VITE_* env names (Supabase keys) readable in the browser.
    envPrefix: ["VITE_", "PUBLIC_"],
    resolve: {
      alias: {
        "@app": resolve(root, "src/app"),
        "@library": resolve(root, "src/library"),
        "@shared": resolve(root, "src/shared"),
      },
    },
    define: {
      "process.env.REACT_APP_VERSION": JSON.stringify(process.env.npm_package_version || "1.0.0"),
    },
    // CJS packages whose named exports Node can't see; bundle them for the server render.
    ssr: { noExternal },
    environments: {
      ssr: { resolve: { noExternal } },
      prerender: { resolve: { noExternal } },
    },
  },
});
