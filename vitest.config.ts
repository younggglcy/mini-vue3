import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

function resolvePath(path: string) {
  return resolve(__dirname, path)
}

export default defineConfig({
  test: {
    environment: 'jsdom'
  },
  resolve: {
    alias: [
      {
        find: /^@mini-vue3\/(.*?)$/,
        replacement: resolvePath('/packages/$1/src')
      },
      {
        find: 'mini-vue3',
        replacement: resolvePath('/packages/vue/src')
      }
    ]
  }
})
