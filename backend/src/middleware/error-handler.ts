import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }
  console.error('[backend] Unhandled error:', err);
  res.status(500).json({
    code: 'INTERNAL',
    message: err instanceof Error ? err.message : 'Internal server error',
  });
};
