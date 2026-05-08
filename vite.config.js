import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://telemedicine-backend-g93n.onrender.com",  // ✓ correct format
        changeOrigin: true,
      },
    },
  },
})
