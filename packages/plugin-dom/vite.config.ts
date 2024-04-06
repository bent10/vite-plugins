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
      external: ['htmlparser2']
    }
  },
  test: {
    globals: true,
    include: ['test/**/*.test.ts']
  }
})
