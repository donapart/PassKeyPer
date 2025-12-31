import { defineConfig } from 'tsup';
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: false, // Disabled due to type errors with Web Crypto API
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
});
//# sourceMappingURL=tsup.config.js.map