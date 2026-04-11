import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JwtAccessTokenPayload } from '@teamwork/types';
import { AuthSessionsService } from './auth-sessions.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const now = '2026-03-26T00:00:00.000Z';

  const userSummary = {
    id: 'user-1',
    sessionId: 'session-1',
    email: 'alice@example.com',
    displayName: 'Alice',
    createdAt: now,
    updatedAt: now,
  };

  const payload: JwtAccessTokenPayload = {
    sub: 'user-1',
    sessionId: 'session-1',
    email: 'alice@example.com',
    displayName: 'Alice',
    createdAt: now,
    updatedAt: now,
    type: 'access',
  };

  let strategy: JwtStrategy;
  let authSessionsService: {
    assertSessionIsActive: jest.Mock;
  };

  beforeEach(async () => {
    authSessionsService = {
      assertSessionIsActive: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
        {
          provide: AuthSessionsService,
          useValue: authSessionsService,
        },
      ],
    }).compile();

    strategy = moduleRef.get(JwtStrategy);
  });

  it('returns a user summary when required payload fields are present', async () => {
    const result = await strategy.validate(payload);

    expect(result).toEqual(userSummary);
    expect(authSessionsService.assertSessionIsActive).toHaveBeenCalledWith(
      'session-1',
      'user-1',
    );
  });

  it('throws UnauthorizedException when payload profile fields are missing', async () => {
    const invalidPayload: JwtAccessTokenPayload = {
      ...payload,
      displayName: '',
    };

    await expect(strategy.validate(invalidPayload)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
