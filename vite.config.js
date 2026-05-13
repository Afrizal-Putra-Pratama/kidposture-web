import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // Tambahkan ini

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Tambahkan ini
  ],
  server: {
  }
})