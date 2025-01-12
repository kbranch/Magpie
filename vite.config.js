import { fileURLToPath, URL } from 'node:url'
import del from "rollup-plugin-delete";

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
    ],
  },
  build: {
    outDir: 'vue-dist',
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        del({ targets: ['vue-dist/images', 'vue-dist/js', 'vue-dist/lib', 'vue-dist/multiworld', 'vue-dist/css', 'vue-dist/favicon.ico'], hook: 'generateBundle' })
      ]
    }
  },
  publicDir: 'static',
})
