'use client';

import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/app-shell/page-container';
import { PageStatusCard, PageSurface } from '@/components/app-shell/page-state';
import { getWorkspaceDetails } from '@/lib/api/client';
import { useAuthenticatedApiResource } from '@/lib/hooks/use-authenticated-api-resource';
import { readWorkspaceIdFromParams } from '@/lib/route-params';

export default function WorkspaceCalendarPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = readWorkspaceIdFromParams(params);
  const workspaceQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:calendar`,
    load: (accessToken) => getWorkspaceDetails(workspaceId, accessToken),
  });

  return (
    <PageContainer>
      {workspaceQuery.status === 'loading' ? <PageSurface variant="skeleton" /> : null}

      {workspaceQuery.status === 'error' ? (
        <PageStatusCard
          title="Calendar unavailable"
          description="The shell could not resolve this workspace for the calendar route."
          tone="danger"
        />
      ) : null}

      {workspaceQuery.status === 'success' ? (
        <PageSurface
          eyebrow="Calendar shell"
          title={workspaceQuery.data.workspace.name}
          description="This route is connected to real workspace data and ready for calendar-specific task views."
        />
      ) : null}
    </PageContainer>
  );
}
