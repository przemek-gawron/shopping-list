import { OAuth2Client } from 'google-auth-library';
import * as jose from 'jose';
import { config } from '../config';
import { HttpError } from '../errors';

const appleJwks = jose.createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
const googleClient = new OAuth2Client();

export interface OAuthProfile {
  providerUserId: string;
  email: string | null;
  displayName: string | null;
}

export async function verifyGoogleIdToken(idToken: string): Promise<OAuthProfile> {
  if (config.googleClientIds.length === 0) {
    throw new HttpError(503, 'OAUTH_NOT_CONFIGURED', 'Google sign-in is not configured on the server');
  }
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.googleClientIds,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new HttpError(401, 'OAUTH_ERROR', 'Invalid Google token');
  }
  return {
    providerUserId: payload.sub,
    email: payload.email ?? null,
    displayName: payload.name ?? payload.email?.split('@')[0] ?? null,
  };
}

export async function verifyAppleIdToken(idToken: string): Promise<OAuthProfile> {
  if (!config.appleClientId) {
    throw new HttpError(503, 'OAUTH_NOT_CONFIGURED', 'Apple sign-in is not configured on the server');
  }
  let payload: jose.JWTPayload;
  try {
    const result = await jose.jwtVerify(idToken, appleJwks, {
      issuer: 'https://appleid.apple.com',
      audience: config.appleClientId,
    });
    payload = result.payload;
  } catch {
    throw new HttpError(401, 'OAUTH_ERROR', 'Invalid Apple token');
  }
  const sub = payload.sub;
  if (!sub) {
    throw new HttpError(401, 'OAUTH_ERROR', 'Invalid Apple token');
  }
  const email =
    typeof payload.email === 'string'
      ? payload.email
      : null;
  return {
    providerUserId: sub,
    email,
    displayName: email ? email.split('@')[0] : 'Apple',
  };
}

export async function verifyFacebookAccessToken(accessToken: string): Promise<OAuthProfile> {
  if (!config.facebookAppId || !config.facebookAppSecret) {
    throw new HttpError(503, 'OAUTH_NOT_CONFIGURED', 'Facebook sign-in is not configured on the server');
  }
  const appToken = `${config.facebookAppId}|${config.facebookAppSecret}`;
  const debugUrl = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(
    accessToken
  )}&access_token=${encodeURIComponent(appToken)}`;
  const debugRes = await fetch(debugUrl);
  const debugJson = (await debugRes.json()) as {
    data?: { is_valid?: boolean; app_id?: string; user_id?: string };
    error?: { message?: string };
  };
  const data = debugJson.data;
  if (!data?.is_valid || data.app_id !== config.facebookAppId || !data.user_id) {
    throw new HttpError(401, 'OAUTH_ERROR', 'Invalid Facebook token');
  }
  const meUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(
    accessToken
  )}`;
  const meRes = await fetch(meUrl);
  const me = (await meRes.json()) as { id?: string; name?: string; email?: string; error?: { message?: string } };
  if (me.error || !me.id) {
    throw new HttpError(401, 'OAUTH_ERROR', 'Could not read Facebook profile');
  }
  return {
    providerUserId: me.id,
    email: me.email ?? null,
    displayName: me.name ?? me.email?.split('@')[0] ?? null,
  };
}
