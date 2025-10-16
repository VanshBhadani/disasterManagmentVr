import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    include: ['three']
  },
  server: {
    allowedHosts: [
      '8634d0c1aa60.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})
