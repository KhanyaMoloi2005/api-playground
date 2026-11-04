import { Router } from 'express';
import type { HealthResponse } from '@api-playground/shared';

export const healthRouter = Router();

/** GET /api/health: a cheap "is the server up?" check used by the client. */
healthRouter.get('/health', (_req, res) => {
  const body: HealthResponse = { status: 'ok' };
  res.json(body);
});
