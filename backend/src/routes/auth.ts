import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import {
  createEmailUser,
  getUserByEmail,
  getOrCreateOAuthUser,
  toPublicUser,
} from '../db/users';
import { signSession } from '../services/jwt';
import {
  verifyAppleIdToken,
  verifyFacebookAccessToken,
  verifyGoogleIdToken,
} from '../services/oauth';
import { HttpError } from '../errors';

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(200),
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const oauthBody = z.discriminatedUnion('provider', [
  z.object({ provider: z.literal('google'), idToken: z.string().min(1) }),
  z.object({ provider: z.literal('apple'), idToken: z.string().min(1) }),
  z.object({ provider: z.literal('facebook'), accessToken: z.string().min(1) }),
]);

const BCRYPT_ROUNDS = 10;

const publicRouter = Router();

publicRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerBody.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    const user = createEmailUser({
      email: body.email,
      passwordHash,
      displayName: body.displayName,
    });
    const token = signSession(user.id);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) {
      next(
        new HttpError(400, 'VALIDATION', e.issues[0]?.message ?? 'Invalid request')
      );
      return;
    }
    next(e);
  }
});

publicRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginBody.parse(req.body);
    const user = getUserByEmail(body.email);
    if (!user || !user.password_hash) {
      next(new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
      return;
    }
    const match = await bcrypt.compare(body.password, user.password_hash);
    if (!match) {
      next(new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
      return;
    }
    const token = signSession(user.id);
    res.json({ token, user: toPublicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) {
      next(
        new HttpError(400, 'VALIDATION', e.issues[0]?.message ?? 'Invalid request')
      );
      return;
    }
    next(e);
  }
});

publicRouter.post('/oauth', async (req, res, next) => {
  try {
    const body = oauthBody.parse(req.body);
    let profile: { providerUserId: string; email: string | null; displayName: string | null };
    if (body.provider === 'google') {
      profile = await verifyGoogleIdToken(body.idToken);
      const user = getOrCreateOAuthUser({
        provider: 'google',
        providerUserId: profile.providerUserId,
        email: profile.email,
        displayName: profile.displayName,
      });
      const token = signSession(user.id);
      res.json({ token, user: toPublicUser(user) });
      return;
    }
    if (body.provider === 'apple') {
      profile = await verifyAppleIdToken(body.idToken);
      const user = getOrCreateOAuthUser({
        provider: 'apple',
        providerUserId: profile.providerUserId,
        email: profile.email,
        displayName: profile.displayName,
      });
      const token = signSession(user.id);
      res.json({ token, user: toPublicUser(user) });
      return;
    }
    profile = await verifyFacebookAccessToken(body.accessToken);
    const user = getOrCreateOAuthUser({
      provider: 'facebook',
      providerUserId: profile.providerUserId,
      email: profile.email,
      displayName: profile.displayName,
    });
    const token = signSession(user.id);
    res.json({ token, user: toPublicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) {
      next(
        new HttpError(400, 'VALIDATION', e.issues[0]?.message ?? 'Invalid request')
      );
      return;
    }
    next(e);
  }
});

export function meHandler(req: Request, res: Response) {
  res.json({ user: req.appUser });
}

export { publicRouter as authPublicRouter };
