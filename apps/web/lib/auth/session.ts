import { LEGACY_ACCESS_TOKEN_STORAGE_KEY } from './session-constants';

export function getLegacyStoredAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = window.localStorage.getItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY);
  return token && token.trim().length > 0 ? token : null;
}

export function clearLegacyStoredAccessToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY);
}
