'use client';

import { PageContainer } from '@/components/app-shell/page-container';
import { PageStatusCard, PageSurface } from '@/components/app-shell/page-state';
import { useAuthenticatedApiResource } from '@/lib/hooks/use-authenticated-api-resource';
import { listInboxTasks } from '@/lib/api/client';

export default function InboxPage() {
  const inboxQuery = useAuthenticatedApiResource({
    key: 'tasks:inbox',
    load: listInboxTasks,
  });

  return (
    <PageContainer>
      {inboxQuery.status === 'loading' ? (
        <PageSurface variant="skeleton" />
      ) : null}

      {inboxQuery.status === 'error' ? (
        <PageStatusCard
          title="Inbox unavailable"
          description="The shell could not load your task inbox from the API."
          tone="danger"
        />
      ) : null}

      {inboxQuery.status === 'success' && inboxQuery.data.tasks.length === 0 ? (
        <PageStatusCard
          title="No inbox tasks"
          description="Your authenticated inbox is connected and ready. New task content can layer onto this route next."
          tone="default"
        />
      ) : null}

      {inboxQuery.status === 'success' && inboxQuery.data.tasks.length > 0 ? (
        <PageSurface
          eyebrow="Connected"
          title={`${String(inboxQuery.data.tasks.length)} task${
            inboxQuery.data.tasks.length === 1 ? '' : 's'
          } available`}
          description="Real inbox data is loading through the shared API client. Detailed task list UI can be added on top of this shell."
        />
      ) : null}
    </PageContainer>
  );
}
