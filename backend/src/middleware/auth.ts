import type { RequestHandler } from 'express';
import { HttpError } from '../errors';
import { getUserById, toPublicUser } from '../db/users';
import { verifySession } from '../services/jwt';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization'));
    return;
  }
  const token = header.slice(7);
  try {
    const { userId } = verifySession(token);
    const user = getUserById(userId);
    if (!user) {
      next(new HttpError(401, 'UNAUTHORIZED', 'Invalid session'));
      return;
    }
    req.appUser = toPublicUser(user);
    next();
  } catch (e) {
    next(e);
  }
};
