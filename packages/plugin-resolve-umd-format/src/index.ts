import type { Plugin } from 'vite'

/**
 * Vite plugin that use `.js` extension for the UMD format.
 */
export default function umdFormatResolver(): Plugin {
  // related issue: https://github.com/vitejs/vite/issues/9089
  return {
    name: 'vite:plugin-resolve-umd-format',
    generateBundle(_, bundle) {
      for (const key in bundle) {
        const info = bundle[key]

        if (info.type === 'chunk' && info.fileName.endsWith('.umd.cjs')) {
          info.fileName = info.fileName.replace(/\.cjs$/, '.js')
        }
      }
    }
  }
}
