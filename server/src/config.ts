import { z } from 'zod';

/**
 * Environment variables the server understands. Every value has a safe
 * default so the server runs without a `.env` file.
 */
const envSchema = z.object({
  SERVER_HOST: z.string().min(1).default('127.0.0.1'),
  // Env vars are always strings; `coerce` converts "3001" -> 3001.
  SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
});

export interface ServerConfig {
  host: string;
  port: number;
}

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

export function isLoopbackHost(host: string): boolean {
  return LOOPBACK_HOSTS.has(host);
}

/**
 * Parses and validates configuration. Takes `env` as a parameter (instead of
 * reading `process.env` directly) so tests can pass in their own values.
 * Throws with a readable message if any value is invalid.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return {
    host: result.data.SERVER_HOST,
    port: result.data.SERVER_PORT,
  };
}
