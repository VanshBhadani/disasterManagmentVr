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
      '309a78e93302.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})
