'use client';

import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/app-shell/page-container';
import { PageStatusCard, PageSurface } from '@/components/app-shell/page-state';
import { getWorkspaceDetails } from '@/lib/api/client';
import { useAuthenticatedApiResource } from '@/lib/hooks/use-authenticated-api-resource';
import { readWorkspaceIdFromParams } from '@/lib/route-params';

export default function WorkspaceBoardPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = readWorkspaceIdFromParams(params);
  const workspaceQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:board`,
    load: (accessToken) => getWorkspaceDetails(workspaceId, accessToken),
  });

  return (
    <PageContainer>
      {workspaceQuery.status === 'loading' ? <PageSurface variant="skeleton" /> : null}

      {workspaceQuery.status === 'error' ? (
        <PageStatusCard
          title="Workspace unavailable"
          description="The board shell could not resolve this workspace from the backend."
          tone="danger"
        />
      ) : null}

      {workspaceQuery.status === 'success' ? (
        <PageSurface
          eyebrow="Board shell"
          title={workspaceQuery.data.workspace.name}
          description="This route is connected to the real workspace details endpoint and ready for task board content."
        />
      ) : null}
    </PageContainer>
  );
}
