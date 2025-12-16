import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Hardcoded API Key
  const apiKey = 'AIzaSyCIuCXgjAQ91rGtTLHGjDWCdFPX5Oz7R7I';

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