/**
 * Types shared between the client and server.
 *
 * This package contains only types for now. Both sides import it with
 * `import type`, so it is erased at compile time and never loaded at runtime.
 */

/** Response body of `GET /api/health`. */
export interface HealthResponse {
  status: 'ok';
}

/**
 * Shape of every error the backend returns for its own API routes.
 * (Not to be confused with error *responses from target APIs*, which are
 * returned as normal inspectable results in a later milestone.)
 */
export interface ApiErrorResponse {
  error: {
    /** Stable machine-readable code, e.g. `NOT_FOUND`. */
    code: string;
    /** Human-readable explanation, safe to show in the UI. */
    message: string;
  };
}
