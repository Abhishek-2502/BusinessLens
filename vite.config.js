import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // ✅ listen on all interfaces
    strictPort: true,  // fail instead of trying another port
    watch: {
      usePolling: true // useful in Docker for file changes
    }
  }
})
