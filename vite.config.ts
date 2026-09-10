import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, 'out'),
  server: {
    port: 5173,
    host: true,
    open: false,
  },
  build: {
    outDir: resolve(__dirname, 'dist-vite'),
  },
})
