import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/

 




export default defineConfig({
      plugins: [react(), tailwindcss(),],

  server: {
    host: '117.250.212.182',
    port: 5176,
    strictPort: true,
    hmr: {
      host: '117.250.212.182',
      port: 5176
    }
  }
})