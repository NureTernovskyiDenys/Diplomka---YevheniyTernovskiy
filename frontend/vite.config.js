import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/nest': {
        target: 'https://diplomka-yevheniy-ternovskiy-woad.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/live': {
        target: 'https://diplomka-yevheniy-ternovskiy-woad.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
