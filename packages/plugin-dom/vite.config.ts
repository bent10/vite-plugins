/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  cacheDir: '.cache/vite',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },

    rollupOptions: {
      external: ['htmlparser2']
    }
  },
  test: {
    globals: true,
    cache: { dir: '.cache/vitest' },
    include: ['test/**/*.test.ts']
  }
})
