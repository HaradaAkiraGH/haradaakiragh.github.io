import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore — node-модуль для keepAlive-агента
import https from 'node:https';

const cdnAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 32,
  keepAliveMsecs: 10000,
});

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Наш API: /api/* -> localhost:4000
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // Тайлы игры
      '/wwtiles': {
        target: 'https://game-cdn.appsample.com',
        changeOrigin: true,
        agent: cdnAgent,
        timeout: 15000,
        proxyTimeout: 15000,
        rewrite: (path) => path.replace(/^\/wwtiles/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('origin');
          });
          proxy.on('error', (err) => {
            console.error('[proxy wwtiles]', err.message);
          });
        },
      },
    },
  },
});