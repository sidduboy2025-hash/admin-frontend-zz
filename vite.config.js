import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/

 




export default defineConfig({
      plugins: [react(), tailwindcss(),],

  server: {
    host: '192.168.0.24',
    port: 5176,
    strictPort: true,
    hmr: {
      host: '192.168.0.24',
      port: 5176
    }
  }
})