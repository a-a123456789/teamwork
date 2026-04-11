import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthPayload, RegisterResponse } from '@teamwork/types';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import {
  buildAuthCookieOptions,
  clearCookie,
  readBearerToken,
  readCookie,
  type AuthCookieConfig,
} from './auth-cookie.util';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE_NAME,
} from './auth-session.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RegisterResponse> {
    const result = await this.authService.register(dto, this.readSessionClientMetadata(request));
    this.setSessionCookies(response, result.accessToken, result.refreshToken);
    const { refreshToken, sessionId, ...payload } = result;
    void refreshToken;
    void sessionId;
    return payload;
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthPayload> {
    const result = await this.authService.login(dto, this.readSessionClientMetadata(request));
    this.setSessionCookies(response, result.accessToken, result.refreshToken);
    const { refreshToken, sessionId, ...payload } = result;
    void refreshToken;
    void sessionId;
    return payload;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.id);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    const refreshToken = readCookie(request, REFRESH_TOKEN_COOKIE_NAME);

    if (!refreshToken) {
      this.clearSessionCookies(response);
      throw new UnauthorizedException('Session refresh failed.');
    }

    try {
      const refreshedSession = await this.authService.refreshSession(
        refreshToken,
        this.readSessionClientMetadata(request),
      );
      this.setSessionCookies(response, refreshedSession.accessToken, refreshedSession.refreshToken);
      return { success: true };
    } catch (error) {
      this.clearSessionCookies(response);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    const accessToken = readBearerToken(request) ?? readCookie(request, ACCESS_TOKEN_COOKIE_NAME);
    const refreshToken = readCookie(request, REFRESH_TOKEN_COOKIE_NAME);

    await this.authService.logout({
      accessToken,
      refreshToken,
    });
    this.clearSessionCookies(response);

    return { success: true };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logoutAll(
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    await this.authService.logoutAll(user.id);
    this.clearSessionCookies(response);

    return { success: true };
  }

  private setSessionCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    response.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      accessToken,
      buildAuthCookieOptions(
        this.readAuthCookieConfig(),
        this.configService.get<number>('ACCESS_TOKEN_TTL_SECONDS') ??
          DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
      ),
    );
    response.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      buildAuthCookieOptions(
        this.readAuthCookieConfig(),
        this.configService.get<number>('REFRESH_TOKEN_TTL_SECONDS') ??
          DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
      ),
    );
  }

  private clearSessionCookies(response: Response): void {
    const cookieConfig = this.readAuthCookieConfig();
    clearCookie(response, ACCESS_TOKEN_COOKIE_NAME, cookieConfig);
    clearCookie(response, REFRESH_TOKEN_COOKIE_NAME, cookieConfig);
  }

  private readAuthCookieConfig(): AuthCookieConfig {
    const domain = this.configService.get<string>('AUTH_COOKIE_DOMAIN');

    return {
      sameSite:
        this.configService.get<'strict' | 'lax' | 'none'>('AUTH_COOKIE_SAME_SITE') ?? 'lax',
      secure: this.configService.get<boolean>('AUTH_COOKIE_SECURE') ?? false,
      ...(domain ? { domain } : {}),
    };
  }

  private readSessionClientMetadata(request: Request): {
    ipAddress?: string | null;
    userAgent?: string | null;
  } {
    const rawUserAgent = request.headers['user-agent'];

    return {
      ipAddress: request.ip ?? null,
      userAgent: Array.isArray(rawUserAgent) ? rawUserAgent.join(', ') : rawUserAgent ?? null,
    };
  }
}
