import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The dev server proxies /api to the Flask backend so the frontend can call
// fetch('/api/...') with no CORS or base-URL configuration. For a deployed
// backend, set VITE_API_BASE and read it in src/api.js.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
