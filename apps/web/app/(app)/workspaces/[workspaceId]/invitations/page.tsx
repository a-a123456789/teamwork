'use client';

import { useParams } from 'next/navigation';
import { ApiError, getWorkspaceInvitations } from '@/lib/api/client';
import { PageContainer } from '@/components/app-shell/page-container';
import { PageStatusCard, PageSurface } from '@/components/app-shell/page-state';
import { useAuthenticatedApiResource } from '@/lib/hooks/use-authenticated-api-resource';
import { readWorkspaceIdFromParams } from '@/lib/route-params';

export default function WorkspaceInvitationsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = readWorkspaceIdFromParams(params);
  const invitationsQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:invitations`,
    load: (accessToken) => getWorkspaceInvitations(workspaceId, accessToken),
  });

  const error = invitationsQuery.status === 'error' ? invitationsQuery.error : null;
  const isForbidden = error instanceof ApiError && error.status === 403;

  return (
    <PageContainer>
      {invitationsQuery.status === 'loading' ? <PageSurface variant="skeleton" /> : null}

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
        <PageStatusCard
          title="No pending invitations"
          description="Invitation management is wired to the real endpoint and ready for detailed owner workflows."
          tone="default"
        />
      ) : null}

      {invitationsQuery.status === 'success' && invitationsQuery.data.invitations.length > 0 ? (
        <PageSurface
          eyebrow="Connected"
          title={`${String(invitationsQuery.data.invitations.length)} pending invitation${
            invitationsQuery.data.invitations.length === 1 ? '' : 's'
          }`}
          description="The invitations route is using the real backend response and can accept richer management UI next."
        />
      ) : null}
    </PageContainer>
  );
}
