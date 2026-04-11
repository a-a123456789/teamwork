const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/teamwork';
const DEFAULT_JWT_SECRET = 'teamwork-dev-secret-change-me';
const DEFAULT_APP_URL = 'http://localhost:3000';
const DEFAULT_INVITE_TTL_DAYS = 30;
const DEFAULT_SHARE_LINK_TTL_DAYS = 14;
const DEFAULT_THROTTLE_TTL_MS = 60_000;
const DEFAULT_DEVELOPMENT_THROTTLE_LIMIT = 500;
const DEFAULT_PRODUCTION_THROTTLE_LIMIT = 20;
const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
type NodeEnvironment = 'development' | 'test' | 'production';
type AuthCookieSameSite = 'strict' | 'lax' | 'none';

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const appUrl = readUrl(config['APP_URL']) ?? DEFAULT_APP_URL;
  const nodeEnv = readNodeEnvironment(config['NODE_ENV']) ?? 'development';

  return {
    ...config,
    NODE_ENV: nodeEnv,
    DATABASE_URL: readString(config['DATABASE_URL']) ?? DEFAULT_DATABASE_URL,
    JWT_SECRET: readString(config['JWT_SECRET']) ?? DEFAULT_JWT_SECRET,
    JWT_EXPIRES_IN: readString(config['JWT_EXPIRES_IN']) ?? '15m',
    APP_URL: appUrl,
    INVITE_BASE_URL: readUrl(config['INVITE_BASE_URL']) ?? appUrl,
    INVITE_TTL_DAYS: readPositiveInteger(config['INVITE_TTL_DAYS']) ?? DEFAULT_INVITE_TTL_DAYS,
    SHARE_LINK_TTL_DAYS:
      readPositiveInteger(config['SHARE_LINK_TTL_DAYS']) ?? DEFAULT_SHARE_LINK_TTL_DAYS,
    THROTTLE_TTL_MS: readPositiveInteger(config['THROTTLE_TTL_MS']) ?? DEFAULT_THROTTLE_TTL_MS,
    THROTTLE_LIMIT:
      readPositiveInteger(config['THROTTLE_LIMIT']) ??
      resolveDefaultThrottleLimitForEnvironment(nodeEnv),
    ACCESS_TOKEN_TTL_SECONDS:
      readPositiveInteger(config['ACCESS_TOKEN_TTL_SECONDS']) ?? DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
    REFRESH_TOKEN_TTL_SECONDS:
      readPositiveInteger(config['REFRESH_TOKEN_TTL_SECONDS']) ??
      DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
    AUTH_COOKIE_SAME_SITE: readAuthCookieSameSite(config['AUTH_COOKIE_SAME_SITE']) ?? 'lax',
    AUTH_COOKIE_SECURE:
      readBoolean(config['AUTH_COOKIE_SECURE']) ?? (nodeEnv === 'production' ? true : false),
    AUTH_COOKIE_DOMAIN: readString(config['AUTH_COOKIE_DOMAIN']),
    PORT: Number.parseInt(readString(config['PORT']) ?? '3000', 10),
  };
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readUrl(value: unknown): string | undefined {
  const normalizedValue = readString(value);

  if (!normalizedValue) {
    return undefined;
  }

  try {
    return new URL(normalizedValue).toString();
  } catch {
    throw new Error(`Invalid URL: ${normalizedValue}`);
  }
}

function readPositiveInteger(value: unknown): number | undefined {
  const normalizedValue = readString(value);

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number.parseInt(normalizedValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Invalid positive integer: ${normalizedValue}`);
  }

  return parsedValue;
}

function readNodeEnvironment(value: unknown): NodeEnvironment | undefined {
  const normalizedValue = readString(value);

  if (!normalizedValue) {
    return undefined;
  }

  if (isNodeEnvironment(normalizedValue)) {
    return normalizedValue;
  }

  throw new Error(`Invalid NODE_ENV: ${normalizedValue}`);
}

function isNodeEnvironment(value: string): value is NodeEnvironment {
  return value === 'development' || value === 'test' || value === 'production';
}

function readBoolean(value: unknown): boolean | undefined {
  const normalizedValue = readString(value);

  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  throw new Error(`Invalid boolean: ${normalizedValue}`);
}

function readAuthCookieSameSite(value: unknown): AuthCookieSameSite | undefined {
  const normalizedValue = readString(value);

  if (!normalizedValue) {
    return undefined;
  }

  if (
    normalizedValue === 'strict' ||
    normalizedValue === 'lax' ||
    normalizedValue === 'none'
  ) {
    return normalizedValue;
  }

  throw new Error(`Invalid AUTH_COOKIE_SAME_SITE: ${normalizedValue}`);
}

function resolveDefaultThrottleLimitForEnvironment(nodeEnv: NodeEnvironment): number {
  if (nodeEnv === 'development' || nodeEnv === 'test') {
    return DEFAULT_DEVELOPMENT_THROTTLE_LIMIT;
  }

  return DEFAULT_PRODUCTION_THROTTLE_LIMIT;
}
