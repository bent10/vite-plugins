/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import cacheDir from './src/index'

export default defineConfig({
  // cacheDir: '.cache/vite',
  plugins: [cacheDir()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['node:path']
    }
  },
  test: {
    globals: true,
    // cache: { dir: '.cache/vitest' },
    include: ['test/**/*.test.ts']
  }
})
