import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { isLoopbackHost, loadConfig } from './config.js';

// Load the repo-root `.env` if present (Node's built-in loader, no dotenv).
// The path is relative to this file, so it works from both src/ and dist/.
const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const config = loadConfig();

if (!isLoopbackHost(config.host)) {
  console.warn(
    `WARNING: SERVER_HOST is "${config.host}". This server forwards HTTP requests and ` +
      'must not be reachable from other machines. Use 127.0.0.1 unless you know what you are doing.',
  );
}

const server = createApp().listen(config.port, config.host, () => {
  console.log(`API Playground server listening on http://${config.host}:${config.port}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
