import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('defaults invite configuration from the app url', () => {
    const result = validateEnvironment({});

    expect(result['NODE_ENV']).toBe('development');
    expect(result['APP_URL']).toBe('http://localhost:3000');
    expect(result['INVITE_BASE_URL']).toBe('http://localhost:3000');
    expect(result['INVITE_TTL_DAYS']).toBe(30);
    expect(result['SHARE_LINK_TTL_DAYS']).toBe(14);
    expect(result['THROTTLE_TTL_MS']).toBe(60000);
    expect(result['THROTTLE_LIMIT']).toBe(500);
    expect(result['ACCESS_TOKEN_TTL_SECONDS']).toBe(900);
    expect(result['REFRESH_TOKEN_TTL_SECONDS']).toBe(2592000);
    expect(result['AUTH_COOKIE_SAME_SITE']).toBe('lax');
    expect(result['AUTH_COOKIE_SECURE']).toBe(false);
  });

  it('uses configured invite values when they are valid', () => {
    const result = validateEnvironment({
      APP_URL: 'https://app.example.com',
      INVITE_BASE_URL: 'https://invite.example.com/base',
      INVITE_TTL_DAYS: '45',
      SHARE_LINK_TTL_DAYS: '10',
    });

    expect(result['APP_URL']).toBe('https://app.example.com/');
    expect(result['INVITE_BASE_URL']).toBe('https://invite.example.com/base');
    expect(result['INVITE_TTL_DAYS']).toBe(45);
    expect(result['SHARE_LINK_TTL_DAYS']).toBe(10);
  });

  it('rejects an invalid invite base url', () => {
    expect(() =>
      validateEnvironment({
        INVITE_BASE_URL: 'not-a-url',
      }),
    ).toThrow('Invalid URL: not-a-url');
  });

  it('rejects a non-positive invite ttl', () => {
    expect(() =>
      validateEnvironment({
        INVITE_TTL_DAYS: '0',
      }),
    ).toThrow('Invalid positive integer: 0');
  });

  it('rejects a non-positive share link ttl', () => {
    expect(() =>
      validateEnvironment({
        SHARE_LINK_TTL_DAYS: '-1',
      }),
    ).toThrow('Invalid positive integer: -1');
  });

  it('rejects an invalid node environment', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'staging',
      }),
    ).toThrow('Invalid NODE_ENV: staging');
  });

  it('uses production throttle defaults when NODE_ENV is production', () => {
    const result = validateEnvironment({
      NODE_ENV: 'production',
    });

    expect(result['THROTTLE_LIMIT']).toBe(20);
    expect(result['THROTTLE_TTL_MS']).toBe(60000);
    expect(result['AUTH_COOKIE_SECURE']).toBe(true);
  });

  it('accepts explicit throttle overrides', () => {
    const result = validateEnvironment({
      THROTTLE_LIMIT: '100000',
      THROTTLE_TTL_MS: '60000',
    });

    expect(result['THROTTLE_LIMIT']).toBe(100000);
    expect(result['THROTTLE_TTL_MS']).toBe(60000);
  });

  it('rejects non-positive throttle values', () => {
    expect(() =>
      validateEnvironment({
        THROTTLE_LIMIT: '0',
      }),
    ).toThrow('Invalid positive integer: 0');
  });

  it('accepts auth token ttl and cookie overrides', () => {
    const result = validateEnvironment({
      ACCESS_TOKEN_TTL_SECONDS: '600',
      REFRESH_TOKEN_TTL_SECONDS: '1209600',
      AUTH_COOKIE_SAME_SITE: 'none',
      AUTH_COOKIE_SECURE: 'true',
      AUTH_COOKIE_DOMAIN: '.example.com',
    });

    expect(result['ACCESS_TOKEN_TTL_SECONDS']).toBe(600);
    expect(result['REFRESH_TOKEN_TTL_SECONDS']).toBe(1209600);
    expect(result['AUTH_COOKIE_SAME_SITE']).toBe('none');
    expect(result['AUTH_COOKIE_SECURE']).toBe(true);
    expect(result['AUTH_COOKIE_DOMAIN']).toBe('.example.com');
  });

  it('rejects invalid auth cookie same-site values', () => {
    expect(() =>
      validateEnvironment({
        AUTH_COOKIE_SAME_SITE: 'invalid',
      }),
    ).toThrow('Invalid AUTH_COOKIE_SAME_SITE: invalid');
  });

  it('rejects invalid booleans', () => {
    expect(() =>
      validateEnvironment({
        AUTH_COOKIE_SECURE: 'yes',
      }),
    ).toThrow('Invalid boolean: yes');
  });
});
