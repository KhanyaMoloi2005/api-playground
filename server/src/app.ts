import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import type { ApiErrorResponse } from '@api-playground/shared';
import { healthRouter } from './routes/health.js';

/**
 * Builds the Express app without starting a network listener.
 * `index.ts` calls `listen()`; tests pass the app straight to Supertest.
 */
export function createApp(): express.Express {
  const app = express();

  // Don't advertise the framework in a response header.
  app.disable('x-powered-by');

  app.use('/api', healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/** Any route not matched above gets a JSON 404 in the shared error shape. */
const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ApiErrorResponse = {
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  };
  res.status(404).json(body);
};

/**
 * Last-resort error handler. Express 5 forwards both thrown errors and
 * rejected promises from async handlers here. The details are logged
 * server-side only; the browser gets a generic message and never a stack trace.
 */
const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  console.error('Unhandled error:', err);
  const body: ApiErrorResponse = {
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred' },
  };
  res.status(500).json(body);
};
