import type { HealthResponse } from '@api-playground/shared';

/**
 * Thin wrapper around the backend API. Components call these functions
 * instead of using `fetch` directly, so URLs and error handling live in one place.
 */

export async function checkHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const res = await fetch('/api/health', { signal });
  if (!res.ok) {
    throw new Error(`Health check failed with HTTP ${res.status}`);
  }
  // We trust our own backend's response shape here. Responses from
  // user-targeted APIs will be treated as untrusted in later milestones.
  return (await res.json()) as HealthResponse;
}
