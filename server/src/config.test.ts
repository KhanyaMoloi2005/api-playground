import { describe, expect, it } from 'vitest';
import { isLoopbackHost, loadConfig } from './config.js';

describe('loadConfig', () => {
  it('uses safe defaults when nothing is set', () => {
    expect(loadConfig({})).toEqual({ host: '127.0.0.1', port: 3001 });
  });

  it('reads and coerces values from the environment', () => {
    expect(loadConfig({ SERVER_HOST: 'localhost', SERVER_PORT: '4000' })).toEqual({
      host: 'localhost',
      port: 4000,
    });
  });

  it.each(['abc', '0', '70000', '3001.5'])('rejects invalid SERVER_PORT %j', (port) => {
    expect(() => loadConfig({ SERVER_PORT: port })).toThrow(/SERVER_PORT/);
  });
});

describe('isLoopbackHost', () => {
  it.each(['127.0.0.1', 'localhost', '::1'])('treats %s as loopback', (host) => {
    expect(isLoopbackHost(host)).toBe(true);
  });

  it.each(['0.0.0.0', '192.168.1.10', '::'])('treats %s as not loopback', (host) => {
    expect(isLoopbackHost(host)).toBe(false);
  });
});
