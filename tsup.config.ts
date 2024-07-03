import { defineConfig } from "tsup"

export default defineConfig({
    clean: true,
    entry: ["static/index.ts"],
    format: ["esm"],
    sourcemap: true,
    minify: false,
    target: "esnext",
    outDir: "static/dist",
})