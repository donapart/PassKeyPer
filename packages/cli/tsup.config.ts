import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  external: [
    '@inquirer/prompts',
    'commander',
    'chalk',
    'ora',
    'clipboardy',
    'conf'
  ],
  banner: {
    js: '#!/usr/bin/env node'
  }
});
