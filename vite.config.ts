import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ViteSitemap from 'vite-plugin-sitemap';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    ViteSitemap({
      hostname: 'https://quisells.com',
    })
  ],
  server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
      secure: false,
    },
  },
},
})
