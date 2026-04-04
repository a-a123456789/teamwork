'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { BoardLoadingState } from '@/components/board/board-loading';
import { BoardPage } from '@/components/board/board-page';
import { PageStatusCard, PageSurface } from '@/components/app-shell/page-state';
import { useAuthSession } from '@/lib/auth/auth-session-provider';
import {
  getWorkspaceDetails,
  getWorkspaceMembers,
  listWorkspaceTasks,
} from '@/lib/api/client';
import {
  DEFAULT_BOARD_ASSIGNEE_FILTER,
  DEFAULT_BOARD_STATUS_FILTER,
  buildBoardAssigneeOptions,
  getBackendAssignmentFilter,
  resolveBoardAssigneeFilter,
  type BoardStatusFilter,
} from '@/lib/board';
import { useAuthenticatedApiResource } from '@/lib/hooks/use-authenticated-api-resource';
import { readWorkspaceIdFromParams } from '@/lib/route-params';

const STATUS_OPTIONS: BoardStatusFilter[] = ['all', 'todo', 'in_progress', 'done'];

export default function WorkspaceBoardPage() {
  const params = useParams();
  const workspaceId = readWorkspaceIdFromParams(params);
  const { auth } = useAuthSession();
  const [statusFilter, setStatusFilter] = useState(DEFAULT_BOARD_STATUS_FILTER);
  const [assigneeFilter, setAssigneeFilter] = useState(DEFAULT_BOARD_ASSIGNEE_FILTER);

  const workspaceQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:board`,
    load: (accessToken) => getWorkspaceDetails(workspaceId, accessToken),
  });
  const membersQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:members:board`,
    load: (accessToken) => getWorkspaceMembers(workspaceId, accessToken),
  });

  const assigneeOptions = useMemo(
    () =>
      buildBoardAssigneeOptions(
        membersQuery.status === 'success' ? membersQuery.data.members : null,
        auth.user,
      ),
    [auth.user, membersQuery],
  );
  const resolvedAssigneeFilter = useMemo(
    () => resolveBoardAssigneeFilter(assigneeOptions, assigneeFilter),
    [assigneeFilter, assigneeOptions],
  );
  const backendAssignmentFilter = getBackendAssignmentFilter(resolvedAssigneeFilter);

  const tasksQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:tasks:board:${backendAssignmentFilter ?? 'everyone'}`,
    load: (accessToken) =>
      listWorkspaceTasks(
        workspaceId,
        accessToken,
        backendAssignmentFilter ? { assignment: backendAssignmentFilter } : undefined,
      ),
  });

  return (
    <div className="mx-auto flex w-full max-w-[1460px] flex-col">
      {workspaceQuery.status === 'loading' || tasksQuery.status === 'loading' ? (
        <BoardLoadingState />
      ) : null}

      {workspaceQuery.status === 'error' ? (
        <PageStatusCard
          title="Workspace unavailable"
          description="The board shell could not resolve this workspace from the backend."
          tone="danger"
        />
      ) : null}

      {tasksQuery.status === 'error' ? (
        <PageStatusCard
          title="Board unavailable"
          description="The board could not load workspace tasks from the backend."
          tone="danger"
        />
      ) : null}

      {workspaceQuery.status === 'success' && tasksQuery.status === 'success' ? (
        <div className="flex flex-col gap-4">
          {membersQuery.status === 'error' ? (
            <PageSurface
              eyebrow="Limited filters"
              title="Members unavailable"
              description="The board is loaded, but member-specific filters are temporarily unavailable until workspace members can be fetched."
            />
          ) : null}

          <BoardPage
            workspace={workspaceQuery.data.workspace}
            tasks={tasksQuery.data.tasks}
            assigneeFilter={resolvedAssigneeFilter}
            assigneeOptions={assigneeOptions}
            statusFilter={statusFilter}
            statusOptions={STATUS_OPTIONS}
            currentUserId={auth.user.id}
            membersUnavailable={membersQuery.status === 'error'}
            onStatusChange={setStatusFilter}
            onAssigneeChange={setAssigneeFilter}
          />
        </div>
      ) : null}
    </div>
  );
}
