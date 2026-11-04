import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkHealth } from './api';

function mockFetch(response: Response) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('checkHealth', () => {
  it('calls /api/health and returns the parsed body', async () => {
    const fetchMock = mockFetch(Response.json({ status: 'ok' }));

    await expect(checkHealth()).resolves.toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.anything());
  });

  it('throws when the server responds with an error status', async () => {
    mockFetch(new Response('Bad Gateway', { status: 502 }));

    await expect(checkHealth()).rejects.toThrow('HTTP 502');
  });

  it('propagates network failures', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed')));

    await expect(checkHealth()).rejects.toThrow('fetch failed');
  });
});
