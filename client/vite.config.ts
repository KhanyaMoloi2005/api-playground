import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Read the repo-root .env so the proxy targets the same host/port the
  // server uses. The '' prefix loads all vars, not only VITE_* ones. These
  // values are used here in Node only and are NOT exposed to browser code.
  const env = loadEnv(mode, '..', '');
  const serverHost = env.SERVER_HOST || '127.0.0.1';
  const serverPort = env.SERVER_PORT || '3001';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      // The browser calls same-origin `/api/...`; Vite forwards it to Express.
      // This avoids CORS entirely during development.
      proxy: {
        '/api': `http://${serverHost}:${serverPort}`,
      },
    },
  };
});
