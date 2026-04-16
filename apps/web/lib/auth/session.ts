import {
  LEGACY_ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
  LEGACY_ACCESS_TOKEN_COOKIE_NAME,
  LEGACY_ACCESS_TOKEN_STORAGE_KEY,
} from './session-constants';

export function getLegacyStoredAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = window.localStorage.getItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY);
  return token && token.trim().length > 0 ? token : null;
}

export function setLegacyStoredAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedToken = token.trim();

  if (normalizedToken.length === 0) {
    return;
  }

  window.localStorage.setItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY, normalizedToken);
  writeLegacyAccessTokenCookie(normalizedToken);
}

export function clearLegacyStoredAccessToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY);
  clearLegacyAccessTokenCookie();
}

function writeLegacyAccessTokenCookie(token: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const secureAttribute =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${LEGACY_ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${String(LEGACY_ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS)}; SameSite=Lax${secureAttribute}`;
}

function clearLegacyAccessTokenCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const secureAttribute =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${LEGACY_ACCESS_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secureAttribute}`;
}
