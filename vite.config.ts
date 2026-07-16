import { defineConfig } from "vite";

// GitHub Pages sirve bajo /rentometro/: sin esta base, los assets darian 404.
// Si algun dia hay dominio propio (rentometro.es), cambiar base a "/".
export default defineConfig({
  base: "/rentometro/",
});
