'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ApiError, getWorkspaceInvitations, getWorkspaceShareLink } from '@/lib/api/client';
import {
  InvitationsPage,
  InvitationsPageSkeleton,
} from '@/components/invitations/invitations-page';
import { PageContainer } from '@/components/app-shell/page-container';
import { PageStatusCard } from '@/components/app-shell/page-state';
import { useAuthSession } from '@/lib/auth/auth-session-provider';
import { useAuthenticatedApiResource } from '@/lib/hooks/use-authenticated-api-resource';
import { readWorkspaceIdFromParams } from '@/lib/route-params';

export default function WorkspaceInvitationsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = readWorkspaceIdFromParams(params);
  const { auth, accessToken } = useAuthSession();
  const currentWorkspace = useMemo(
    () => auth.workspaces.find((workspace) => workspace.id === workspaceId) ?? null,
    [auth.workspaces, workspaceId],
  );
  const isOwner = currentWorkspace?.membership.role === 'owner';
  const invitationsQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:invitations`,
    load: (accessToken) => getWorkspaceInvitations(workspaceId, accessToken),
  });
  const shareLinkQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:share-link`,
    load: (accessToken) => getWorkspaceShareLink(workspaceId, accessToken),
  });

  const error = invitationsQuery.status === 'error' ? invitationsQuery.error : null;
  const isForbidden = error instanceof ApiError && error.status === 403;
  const shareLinkError = shareLinkQuery.status === 'error' ? shareLinkQuery.error : null;
  const showShareLinkError =
    isOwner && shareLinkQuery.status === 'error' && !(shareLinkError instanceof ApiError && shareLinkError.status === 403);
  const isPageLoading =
    invitationsQuery.status === 'loading' || (isOwner && shareLinkQuery.status === 'loading');

  return (
    <PageContainer>
      {isPageLoading ? <InvitationsPageSkeleton /> : null}

      {isForbidden ? (
        <PageStatusCard
          title="Owner access required"
          description="Only workspace owners can view and manage invitations."
          tone="warning"
        />
      ) : null}

      {invitationsQuery.status === 'error' && !isForbidden ? (
        <PageStatusCard
          title="Invitations unavailable"
          description="Workspace invitations could not be loaded right now."
          tone="danger"
        />
      ) : null}

      {showShareLinkError ? (
        <PageStatusCard
          title="Workspace share link unavailable"
          description="The reusable workspace invite link could not be loaded right now."
          tone="warning"
        />
      ) : null}

      {invitationsQuery.status === 'success' && (!isOwner || shareLinkQuery.status !== 'loading') ? (
        <InvitationsPage
          workspaceId={workspaceId}
          invitations={invitationsQuery.data.invitations}
          workspaceShareLink={shareLinkQuery.status === 'success' ? shareLinkQuery.data.shareLink : null}
          currentUserRole={currentWorkspace?.membership.role ?? null}
          accessToken={accessToken}
        />
      ) : null}
    </PageContainer>
  );
}
