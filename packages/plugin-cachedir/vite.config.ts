/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import cacheDir from './src/index'

export default defineConfig({
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
    include: ['test/*.test.ts']
  }
})
