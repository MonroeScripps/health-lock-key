import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Allow third-party services (Base Account SDK, Coinbase, etc.)
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      // Additional headers for better compatibility
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
  // Enable SharedArrayBuffer for FHEVM
  optimizeDeps: {
    exclude: ['@zama-fhe/relayer-sdk']
  },
  // Define global variables for SharedArrayBuffer
  define: {
    global: 'globalThis',
  },
  // Ensure environment variables are properly loaded
  envPrefix: 'VITE_',
})
