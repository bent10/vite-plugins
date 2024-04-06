/// <reference types="vitest" />

import { defineConfig } from 'vite'
import cacheDir from 'vite-plugin-cachedir'

export default defineConfig({
  plugins: [cacheDir()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['node:fs', 'node:path', 'fast-glob', 'vite']
    }
  },
  test: {
    globals: true,
    include: ['test/**/*.test.ts']
  }
})
