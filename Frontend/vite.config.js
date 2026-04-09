import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://worksphere-q6eg.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  optimizeDeps: {
    include: ['axios'],
  },
})

