import { defineConfig } from 'vite'
import mpa from 'vite-plugin-marked-mpa'

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
