import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  // Priority: Check system environment variables (Netlify) first, then loaded .env variables
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    // Vite will copy files from this directory to the root of dist/
    publicDir: 'public',
    // Use root base path to ensure absolute assets work
    base: '/',
    define: {
      // Expose API_KEY to the client-side code by replacing process.env.API_KEY with the string value
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  }
})