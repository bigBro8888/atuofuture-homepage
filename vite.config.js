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
        hardwareProduct: resolve(__dirname, 'hardware/product/index.html'),
        agentDetail: resolve(__dirname, 'agent-detail/index.html'),
        order: resolve(__dirname, 'order/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        solutions: resolve(__dirname, 'solutions/index.html'),
        news: resolve(__dirname, 'news/index.html'),
        newsDetail: resolve(__dirname, 'news-detail/index.html'),
        appDownload: resolve(__dirname, 'app-download/index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
  server: {
    port: 5188,
    strictPort: true,
    host: '127.0.0.1',
    open: true,
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
