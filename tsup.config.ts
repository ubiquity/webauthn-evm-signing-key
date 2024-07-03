import { defineConfig } from "tsup"

export default defineConfig({
    clean: true,
    entry: ["src/index.ts"],
    format: ["esm"],
    sourcemap: true,
    minify: false,
    target: "esnext",
    outDir: "dist",
})