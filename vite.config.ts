import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite will copy files from this directory to the root of dist/
  publicDir: 'public',
  // Use root base path to ensure absolute assets work
  base: '/'
})