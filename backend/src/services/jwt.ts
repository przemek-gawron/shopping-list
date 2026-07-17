import jwt from 'jsonwebtoken';
import { config } from '../config';
import { HttpError } from '../errors';

export function signSession(userId: string): string {
  if (!config.jwtSecret) {
    throw new HttpError(503, 'AUTH_CONFIG', 'JWT_SECRET is not configured on the server');
  }
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '30d' });
}

export function verifySession(token: string): { userId: string } {
  if (!config.jwtSecret) {
    throw new HttpError(503, 'AUTH_CONFIG', 'Server JWT is not configured');
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new Error('Invalid payload');
    }
    return { userId: payload.sub };
  } catch (e) {
    if (e instanceof HttpError) {
      throw e;
    }
    throw new HttpError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}
