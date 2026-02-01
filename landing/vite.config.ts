import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/packet-painter/',
  build: {
    outDir: path.resolve(__dirname, '../docs'),
    emptyOutDir: true,
  },
})
