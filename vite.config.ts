import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore — node-модуль для keepAlive-агента
import https from 'node:https';

// Агент с keepAlive: десятки тайлов ходят по нескольким живым соединениям,
// вместо сотни свежих TLS-рукопожатий (которые CDN ронял)
const cdnAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 32,
  keepAliveMsecs: 10000,
});

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wwtiles': {
        target: 'https://game-cdn.appsample.com',
        changeOrigin: true,
        agent: cdnAgent,
        timeout: 15000,        // не висим вечно: 15 сек максимум
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