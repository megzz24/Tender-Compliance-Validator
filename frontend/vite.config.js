/*
Vite + React plugin. Proxy /api → localhost:8000
so frontend can call /api/... without CORS issues in dev. 
*/

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})