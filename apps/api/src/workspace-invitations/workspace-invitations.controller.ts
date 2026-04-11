import { Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type {
  PublicWorkspaceInvitationLookup,
  PublicWorkspaceShareLinkLookup,
  WorkspaceInvitationSummary,
  WorkspaceMemberDetail,
  WorkspaceSummary,
} from '@teamwork/types';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { WorkspaceInvitationsService } from './workspace-invitations.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class WorkspaceInvitationsController {
  constructor(private readonly workspaceInvitationsService: WorkspaceInvitationsService) {}

  @Public()
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
  @Get('workspace-invitations/token/:token')
  async getInvitationByToken(
    @Param('token') token: string,
    @Req() request?: Request,
  ): Promise<PublicWorkspaceInvitationLookup> {
    return this.workspaceInvitationsService.getInvitationByToken(
      token,
      this.readAuditContext(request),
    );
  }

  @Public()
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
  @Get('workspace-share-links/token/:token')
  async getWorkspaceShareLinkByToken(
    @Param('token') token: string,
    @Req() request?: Request,
  ): Promise<PublicWorkspaceShareLinkLookup> {
    return this.workspaceInvitationsService.getWorkspaceShareLinkByToken(
      token,
      this.readAuditContext(request),
    );
  }

  @Get('users/me/invitations')
  async listMyInvitations(@CurrentUser() user: RequestUser): Promise<{
    invitations: Array<{
      invitation: WorkspaceInvitationSummary;
      workspace: WorkspaceSummary;
    }>;
  }> {
    return {
      invitations: await this.workspaceInvitationsService.listPendingInvitationsForEmail(
        user.email,
      ),
    };
  }

  @Post('workspaces/invitations/:invitationId/accept')
  async acceptInvitation(
    @CurrentUser() user: RequestUser,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ): Promise<{ membership: WorkspaceMemberDetail }> {
    return this.workspaceInvitationsService.acceptInvitation(invitationId, user);
  }

  @Post('workspace-invitations/token/:token/accept')
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  async acceptInvitationByToken(
    @CurrentUser() user: RequestUser,
    @Param('token') token: string,
    @Req() request?: Request,
  ): Promise<{ membership: WorkspaceMemberDetail }> {
    return this.workspaceInvitationsService.acceptInvitationByToken(
      token,
      user,
      this.readAuditContext(request, user.id),
    );
  }

  @Post('workspace-share-links/token/:token/accept')
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  async acceptWorkspaceShareLinkByToken(
    @CurrentUser() user: RequestUser,
    @Param('token') token: string,
    @Req() request?: Request,
  ): Promise<{ membership: WorkspaceMemberDetail }> {
    return this.workspaceInvitationsService.acceptWorkspaceShareLinkByToken(
      token,
      user,
      this.readAuditContext(request, user.id),
    );
  }

  private readAuditContext(
    request?: Request,
    actorUserId?: string,
  ): { actorUserId?: string; ipAddress?: string | null; userAgent?: string | null } {
    const rawUserAgent = request?.headers['user-agent'];

    return {
      ...(actorUserId ? { actorUserId } : {}),
      ipAddress: request?.ip ?? null,
      userAgent: Array.isArray(rawUserAgent) ? rawUserAgent.join(', ') : rawUserAgent ?? null,
    };
  }
}
