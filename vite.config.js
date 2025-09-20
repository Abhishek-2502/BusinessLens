import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // listen on all interfaces
        strictPort: true,   // fail if port is taken
        watch: {
          usePolling: true  // useful in Docker
        },
        allowedHosts: [
          '34.68.223.130:5173' // ✅ add your Frontend domain
        ]
      }
})
