import type { RequestHandler } from 'express';
import { HttpError } from '../errors';
import { config } from '../config';

export const requireClientToken: RequestHandler = (req, _res, next) => {
  if (!config.clientToken) {
    next();
    return;
  }
  const header = req.headers.authorization;
  const expected = `Bearer ${config.clientToken}`;
  if (!header || header !== expected) {
    next(new HttpError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization bearer token'));
    return;
  }
  next();
};
