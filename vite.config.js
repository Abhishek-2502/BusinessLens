import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // listen on all interfaces
    port: 5173, // ✅ fixed port
    strictPort: true, // fail if port is taken
    watch: {
      usePolling: true, // useful in Docker
    },
    // ✅ add your Frontend domains here
    allowedHosts: [
      "34.68.223.130:5173",  // GCP VM external IP
      "127.0.0.1:5173", // for local development k8s
      "localhost", // for local development nginx
      "localhost:5173", // for local development react
      "192.168.49.2:30080", // for local development minikube
    ],
  },
});
