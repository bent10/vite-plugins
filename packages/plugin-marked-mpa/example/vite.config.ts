import { defineConfig } from 'vite'
import mpa from '../src/index'

export default defineConfig({
  plugins: [
    mpa({
      root: 'example',
      frontmatter: {
        dataPrefix: 'page'
      }
    })
  ],
  build: {
    outDir: 'example/dist'
  }
})
