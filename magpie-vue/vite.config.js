import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: /\/static\/(.*)/, replacement: '/$1' },
    ],
  },
  build: {
    outDir: '../vue-dist/',
    emptyOutDir: true,
  },
  server: {
    watch: {
      ignored: ['**/static/**'],
    },
  },
})
