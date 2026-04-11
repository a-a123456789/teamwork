import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import type { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from './auth-session.constants';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const user: RequestUser = {
    id: 'user-1',
    email: 'alice@example.com',
    displayName: 'Alice',
    createdAt: '2026-03-26T00:00:00.000Z',
    updatedAt: '2026-03-26T00:00:00.000Z',
    sessionId: 'session-1',
  };

  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    me: jest.Mock;
    refreshSession: jest.Mock;
    logout: jest.Mock;
    logoutAll: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };
  let response: Pick<Response, 'cookie'>;
  let request: Pick<Request, 'headers' | 'ip'>;

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      me: jest.fn(),
      refreshSession: jest.fn(),
      logout: jest.fn(),
      logoutAll: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'ACCESS_TOKEN_TTL_SECONDS') {
          return 900;
        }
        if (key === 'REFRESH_TOKEN_TTL_SECONDS') {
          return 2592000;
        }
        if (key === 'AUTH_COOKIE_SAME_SITE') {
          return 'lax';
        }
        if (key === 'AUTH_COOKIE_SECURE') {
          return false;
        }
        return undefined;
      }),
    };
    response = {
      cookie: jest.fn(),
    };
    request = {
      ip: '127.0.0.1',
      headers: {},
    };

    controller = new AuthController(authService as never, configService as never);
  });

  it('is mounted at /auth', () => {
    expect(Reflect.getMetadata(PATH_METADATA, AuthController)).toBe('auth');
  });

  describe('register', () => {
    it('is public', () => {
      expect(
        Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype.register),
      ).toBe(true);
    });

    it('is a POST endpoint', () => {
      expect(
        Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.register),
      ).toBe(RequestMethod.POST);
    });

    it('delegates to authService.register and strips refresh fields from the response', async () => {
      const dto = { email: 'alice@example.com', password: 'password1', displayName: 'Alice' };
      authService.register.mockResolvedValueOnce({
        user: { id: 'user-1' },
        workspaces: [],
        workspace: { id: 'workspace-1' },
        memberships: [],
        accessToken: 'token',
        refreshToken: 'refresh-token',
        sessionId: 'session-1',
      });

      await expect(
        controller.register(dto as never, request as Request, response as Response),
      ).resolves.toEqual({
        user: { id: 'user-1' },
        workspaces: [],
        workspace: { id: 'workspace-1' },
        memberships: [],
        accessToken: 'token',
      });
      expect(authService.register).toHaveBeenCalledWith(dto, {
        ipAddress: '127.0.0.1',
        userAgent: null,
      });
      expect(response.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE_NAME,
        'token',
        expect.any(Object),
      );
      expect(response.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE_NAME,
        'refresh-token',
        expect.any(Object),
      );
    });
  });

  describe('login', () => {
    it('is public', () => {
      expect(
        Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype.login),
      ).toBe(true);
    });

    it('is a POST endpoint', () => {
      expect(
        Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.login),
      ).toBe(RequestMethod.POST);
    });

    it('delegates to authService.login and strips refresh fields from the response', async () => {
      const dto = { email: 'alice@example.com', password: 'password1' };
      authService.login.mockResolvedValueOnce({
        accessToken: 'token',
        refreshToken: 'refresh-token',
        sessionId: 'session-1',
        user: { id: 'user-1' },
        workspaces: [],
      });

      await expect(
        controller.login(dto as never, request as Request, response as Response),
      ).resolves.toEqual({
        accessToken: 'token',
        user: { id: 'user-1' },
        workspaces: [],
      });
      expect(authService.login).toHaveBeenCalledWith(dto, {
        ipAddress: '127.0.0.1',
        userAgent: null,
      });
    });
  });

  describe('me', () => {
    it('is protected by JwtAuthGuard', () => {
      expect(
        Reflect.getMetadata(GUARDS_METADATA, AuthController.prototype.me),
      ).toEqual([JwtAuthGuard]);
    });

    it('is a GET endpoint', () => {
      expect(
        Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.me),
      ).toBe(RequestMethod.GET);
    });

    it('delegates to authService.me with the current user id and returns the result', async () => {
      const responseBody = { user: { id: 'user-1' }, workspaces: [], activeWorkspace: null };
      authService.me.mockResolvedValueOnce(responseBody);

      await expect(controller.me(user)).resolves.toEqual(responseBody);
      expect(authService.me).toHaveBeenCalledWith('user-1');
    });
  });
});
