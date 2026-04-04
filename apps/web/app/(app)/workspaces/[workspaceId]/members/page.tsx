'use client';

import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/app-shell/page-container';
import { PageStatusCard, PageSurface } from '@/components/app-shell/page-state';
import { getWorkspaceMembers } from '@/lib/api/client';
import { useAuthenticatedApiResource } from '@/lib/hooks/use-authenticated-api-resource';
import { readWorkspaceIdFromParams } from '@/lib/route-params';

export default function WorkspaceMembersPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = readWorkspaceIdFromParams(params);
  const membersQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:members`,
    load: (accessToken) => getWorkspaceMembers(workspaceId, accessToken),
  });

  return (
    <PageContainer>
      {membersQuery.status === 'loading' ? <PageSurface variant="skeleton" /> : null}

      {membersQuery.status === 'error' ? (
        <PageStatusCard
          title="Members unavailable"
          description="The shell could not load workspace members from the backend."
          tone="danger"
        />
      ) : null}

      {membersQuery.status === 'success' && membersQuery.data.members.length === 0 ? (
        <PageStatusCard
          title="No members found"
          description="This workspace returned no members. The shell is ready for member management UI when that flow is implemented."
          tone="default"
        />
      ) : null}

      {membersQuery.status === 'success' && membersQuery.data.members.length > 0 ? (
        <PageSurface
          eyebrow="Connected"
          title={`${String(membersQuery.data.members.length)} workspace member${
            membersQuery.data.members.length === 1 ? '' : 's'
          }`}
          description="The members page is using the real workspace members endpoint and is ready for detailed controls."
        />
      ) : null}
    </PageContainer>
  );
}
