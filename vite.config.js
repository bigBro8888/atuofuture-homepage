import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        agents: resolve(__dirname, 'agents/index.html'),
        aiToken: resolve(__dirname, 'ai-token/index.html'),
        hardware: resolve(__dirname, 'hardware/index.html'),
        agentDetail: resolve(__dirname, 'agent-detail/index.html'),
        order: resolve(__dirname, 'order/index.html'),
        about: resolve(__dirname, 'about/index.html'),
      },
    },
  },
  server: {
    open: true,
  },
})
