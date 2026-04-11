import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { WorkspaceInvitationsController } from './workspace-invitations.controller';

describe('WorkspaceInvitationsController', () => {
  const user: RequestUser = {
    id: 'user-1',
    email: 'invitee@example.com',
    displayName: 'Invitee',
    createdAt: '2026-03-26T00:00:00.000Z',
    updatedAt: '2026-03-26T00:00:00.000Z',
  };

  let controller: WorkspaceInvitationsController;
  let workspaceInvitationsService: {
    getInvitationByToken: jest.Mock;
    getWorkspaceShareLinkByToken: jest.Mock;
    listPendingInvitationsForEmail: jest.Mock;
    acceptInvitation: jest.Mock;
    acceptInvitationByToken: jest.Mock;
    acceptWorkspaceShareLinkByToken: jest.Mock;
  };

  beforeEach(() => {
    workspaceInvitationsService = {
      getInvitationByToken: jest.fn(),
      getWorkspaceShareLinkByToken: jest.fn(),
      listPendingInvitationsForEmail: jest.fn(),
      acceptInvitation: jest.fn(),
      acceptInvitationByToken: jest.fn(),
      acceptWorkspaceShareLinkByToken: jest.fn(),
    };

    controller = new WorkspaceInvitationsController(workspaceInvitationsService as never);
  });

  it('is mounted at the app root and protected by jwt auth', () => {
    expect(Reflect.getMetadata(PATH_METADATA, WorkspaceInvitationsController)).toBe('/');
    expect(Reflect.getMetadata(GUARDS_METADATA, WorkspaceInvitationsController)).toEqual([
      JwtAuthGuard,
    ]);
  });

  it('public token lookup works without auth', () => {
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        WorkspaceInvitationsController.prototype.getInvitationByToken,
      ),
    ).toBe(true);
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        WorkspaceInvitationsController.prototype.getWorkspaceShareLinkByToken,
      ),
    ).toBe(true);
  });

  it('token accept requires auth', () => {
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        WorkspaceInvitationsController.prototype.acceptInvitationByToken,
      ),
    ).toBeUndefined();
  });

  it('accepts an invitation by token through the service', async () => {
    workspaceInvitationsService.acceptInvitationByToken.mockResolvedValueOnce({
      membership: { id: 'membership-1' },
    });

    await expect(controller.acceptInvitationByToken(user, 'plain-token')).resolves.toEqual({
      membership: { id: 'membership-1' },
    });
    expect(workspaceInvitationsService.acceptInvitationByToken).toHaveBeenCalledWith(
      'plain-token',
      user,
      {
        actorUserId: user.id,
        ipAddress: null,
        userAgent: null,
      },
    );
  });

  it('accepts a workspace share link by token through the service', async () => {
    workspaceInvitationsService.acceptWorkspaceShareLinkByToken.mockResolvedValueOnce({
      membership: { id: 'membership-1' },
    });

    await expect(controller.acceptWorkspaceShareLinkByToken(user, 'share-token')).resolves.toEqual(
      {
        membership: { id: 'membership-1' },
      },
    );
    expect(workspaceInvitationsService.acceptWorkspaceShareLinkByToken).toHaveBeenCalledWith(
      'share-token',
      user,
      {
        actorUserId: user.id,
        ipAddress: null,
        userAgent: null,
      },
    );
  });

  it('keeps the legacy invitation-id accept route wired through the service', async () => {
    workspaceInvitationsService.acceptInvitation.mockResolvedValueOnce({
      membership: { id: 'membership-1' },
    });

    await expect(controller.acceptInvitation(user, 'invitation-1')).resolves.toEqual({
      membership: { id: 'membership-1' },
    });
    expect(workspaceInvitationsService.acceptInvitation).toHaveBeenCalledWith(
      'invitation-1',
      user,
    );
  });
});
