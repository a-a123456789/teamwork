import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MembershipsModule } from '../memberships/memberships.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AuthController } from './auth.controller';
import { AuthSessionsService } from './auth-sessions.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'teamwork-dev-secret-change-me',
        signOptions: {
          expiresIn: configService.get<number>('ACCESS_TOKEN_TTL_SECONDS') ?? 60 * 15,
        },
      }),
    }),
    UsersModule,
    WorkspacesModule,
    MembershipsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthSessionsService, JwtStrategy],
  exports: [AuthService, AuthSessionsService],
})
export class AuthModule {}
