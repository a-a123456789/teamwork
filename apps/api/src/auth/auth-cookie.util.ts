import type { CookieOptions, Request, Response } from 'express';

export type AuthCookieSameSite = 'lax' | 'strict' | 'none';

export interface AuthCookieConfig {
  sameSite: AuthCookieSameSite;
  secure: boolean;
  domain?: string;
}

export function buildAuthCookieOptions(
  config: AuthCookieConfig,
  maxAgeSeconds: number,
): CookieOptions {
  return {
    httpOnly: true,
    sameSite: config.sameSite,
    secure: config.secure,
    path: '/',
    maxAge: maxAgeSeconds * 1000,
    ...(config.domain ? { domain: config.domain } : {}),
  };
}

export function clearCookie(response: Response, name: string, config: AuthCookieConfig): void {
  response.cookie(name, '', {
    httpOnly: true,
    sameSite: config.sameSite,
    secure: config.secure,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    ...(config.domain ? { domain: config.domain } : {}),
  });
}

export function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (const segment of cookieHeader.split(';')) {
    const trimmedSegment = segment.trim();
    if (trimmedSegment.length === 0) {
      continue;
    }

    const separatorIndex = trimmedSegment.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const cookieName = trimmedSegment.slice(0, separatorIndex).trim();

    if (cookieName !== name) {
      continue;
    }

    const rawValue = trimmedSegment.slice(separatorIndex + 1);

    try {
      const decodedValue = decodeURIComponent(rawValue);
      return decodedValue.trim().length > 0 ? decodedValue : null;
    } catch {
      return rawValue.trim().length > 0 ? rawValue : null;
    }
  }

  return null;
}

export function readBearerToken(request: Request): string | null {
  const authorizationHeader = request.headers.authorization;

  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/, 2);

  if (scheme?.toLowerCase() !== 'bearer') {
    return null;
  }

  return token && token.trim().length > 0 ? token : null;
}
