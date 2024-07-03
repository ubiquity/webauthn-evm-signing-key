import { defineConfig } from "tsup"

export default defineConfig({
    clean: true,
    dts: true,
    sourcemap: true,
    minify: false,
    entry: ["src/index.ts"],
    format: ["esm"],
    target: "esnext",
    outDir: "dist",
})