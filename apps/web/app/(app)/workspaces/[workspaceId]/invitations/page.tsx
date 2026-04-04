'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ApiError, getWorkspaceInvitations } from '@/lib/api/client';
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
  const invitationsQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:invitations`,
    load: (accessToken) => getWorkspaceInvitations(workspaceId, accessToken),
  });
  const currentWorkspace = useMemo(
    () => auth.workspaces.find((workspace) => workspace.id === workspaceId) ?? null,
    [auth.workspaces, workspaceId],
  );

  const error = invitationsQuery.status === 'error' ? invitationsQuery.error : null;
  const isForbidden = error instanceof ApiError && error.status === 403;

  return (
    <PageContainer>
      {invitationsQuery.status === 'loading' ? <InvitationsPageSkeleton /> : null}

      {isForbidden ? (
        <PageStatusCard
          title="Owner access required"
          description="The backend is enforcing invitation access for workspace owners. This shell preserves that response instead of masking it."
          tone="warning"
        />
      ) : null}

      {invitationsQuery.status === 'error' && !isForbidden ? (
        <PageStatusCard
          title="Invitations unavailable"
          description="The shell could not load invitations for this workspace."
          tone="danger"
        />
      ) : null}

      {invitationsQuery.status === 'success' && invitationsQuery.data.invitations.length === 0 ? (
        <InvitationsPage
          workspaceId={workspaceId}
          invitations={invitationsQuery.data.invitations}
          currentUserRole={currentWorkspace?.membership.role ?? null}
          accessToken={accessToken}
        />
      ) : null}

      {invitationsQuery.status === 'success' && invitationsQuery.data.invitations.length > 0 ? (
        <InvitationsPage
          workspaceId={workspaceId}
          invitations={invitationsQuery.data.invitations}
          currentUserRole={currentWorkspace?.membership.role ?? null}
          accessToken={accessToken}
        />
      ) : null}
    </PageContainer>
  );
}
