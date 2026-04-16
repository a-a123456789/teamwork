'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { TaskSummary, WorkspaceBoardDataResponse } from '@teamwork/types';
import { BoardLoadingState } from '@/components/board/board-loading';
import { BoardPage } from '@/components/board/board-page';
import { PageStatusCard, PageSurface } from '@/components/app-shell/page-state';
import { AppButton } from '@/components/ui/button';
import { useAuthSession } from '@/lib/auth/auth-session-provider';
import { getWorkspaceBoardData, getWorkspaceMembers } from '@/lib/api/client';
import {
  DEFAULT_BOARD_ASSIGNEE_FILTER,
  DEFAULT_BOARD_STATUS_FILTER,
  buildBoardAssigneeOptions,
  getBackendAssignmentFilter,
  INITIAL_BOARD_TASK_LIMIT,
  matchesTaskAssignmentFilter,
  resolveBoardAssigneeFilter,
  type BoardStatusFilter,
} from '@/lib/board';
import { useAuthenticatedApiResource } from '@/lib/hooks/use-authenticated-api-resource';
import { useAppShellAction } from '@/lib/app-shell-action-context';
import {
  applyTaskOverlayMutation,
  applyTaskOverlayRemoval,
  mergeTaskListOverlay,
  type TaskListOverlay,
} from '@/lib/task-list';

const CreateTaskModal = dynamic(
  () => import('@/components/board/create-task-modal').then((module) => module.CreateTaskModal),
  {
    ssr: false,
  },
);
const TaskDetailsModal = dynamic(
  () => import('@/components/board/task-details-modal').then((module) => module.TaskDetailsModal),
  {
    ssr: false,
  },
);

const STATUS_OPTIONS: BoardStatusFilter[] = ['all', 'todo', 'in_progress', 'done'];
const GENERIC_BOARD_ERROR_MESSAGE = 'This workspace board could not be loaded right now.';
const BOARD_CACHE_TTL_MS = 30_000;
const GENERIC_LAZY_LOAD_ERROR_MESSAGE = 'More tasks could not be loaded right now.';

interface BoardPaginationState {
  key: string | null;
  extraTasks: TaskSummary[];
  nextCursor: string | null;
  hasMore: boolean;
  status: 'idle' | 'loading' | 'error';
  errorMessage: string | null;
}

interface WorkspaceBoardPageClientProps {
  workspaceId: string;
  initialBoardData: WorkspaceBoardDataResponse | null;
}

export function WorkspaceBoardPageClient({
  workspaceId,
  initialBoardData,
}: WorkspaceBoardPageClientProps) {
  const { auth, accessToken } = useAuthSession();
  const initialMembers = initialBoardData?.membersLoaded ? initialBoardData.members : null;
  const [statusFilter, setStatusFilter] = useState(DEFAULT_BOARD_STATUS_FILTER);
  const [assigneeFilter, setAssigneeFilter] = useState(DEFAULT_BOARD_ASSIGNEE_FILTER);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [boardRetryNonce, setBoardRetryNonce] = useState(0);
  const [taskItemsState, setTaskItemsState] = useState<{
    key: string | null;
    overlay: TaskListOverlay;
  }>({
    key: null,
    overlay: {
      tasks: [],
      removedTaskIds: [],
    },
  });
  const [paginationState, setPaginationState] = useState<BoardPaginationState>({
    key: null,
    extraTasks: [],
    nextCursor: null,
    hasMore: false,
    status: 'idle',
    errorMessage: null,
  });
  const { setActionOverride } = useAppShellAction();

  const backendAssignmentFilter = getBackendAssignmentFilter(assigneeFilter);
  const boardQueryKey = `workspace:${workspaceId}:board-data:${backendAssignmentFilter ?? 'everyone'}:retry:${String(boardRetryNonce)}`;

  const boardDataQuery = useAuthenticatedApiResource({
    key: boardQueryKey,
    load: (accessToken) =>
      getWorkspaceBoardData(
        workspaceId,
        accessToken,
        backendAssignmentFilter
          ? {
              assignment: backendAssignmentFilter,
              includeMembers: false,
              limit: INITIAL_BOARD_TASK_LIMIT,
            }
          : { includeMembers: false, limit: INITIAL_BOARD_TASK_LIMIT },
      ),
    cacheTtlMs: BOARD_CACHE_TTL_MS,
    useStaleWhileRevalidate: true,
    initialData: backendAssignmentFilter ? null : initialBoardData,
    allowAccessTokenDuringAuthLoading: true,
  });
  const boardData = boardDataQuery.status === 'success' ? boardDataQuery.data : null;
  const shouldLoadMembers =
    initialMembers === null &&
    (boardDataQuery.status === 'success' || initialBoardData !== null);
  const membersQuery = useAuthenticatedApiResource({
    key: `workspace:${workspaceId}:members:board`,
    load: (accessToken) => getWorkspaceMembers(workspaceId, accessToken),
    cacheTtlMs: BOARD_CACHE_TTL_MS,
    useStaleWhileRevalidate: true,
    enabled: shouldLoadMembers,
  });
  const members = membersQuery.status === 'success' ? membersQuery.data.members : initialMembers;
  const membersUnavailable = shouldLoadMembers && membersQuery.status === 'error';
  const assigneeOptions = useMemo(
    () => buildBoardAssigneeOptions(members, auth.user),
    [auth.user, members],
  );
  const resolvedAssigneeFilter = useMemo(
    () => resolveBoardAssigneeFilter(assigneeOptions, assigneeFilter),
    [assigneeFilter, assigneeOptions],
  );
  const taskQueryKey = `workspace:${workspaceId}:tasks:board:${backendAssignmentFilter ?? 'everyone'}`;
  const activePaginationState =
    paginationState.key === boardQueryKey
      ? paginationState
      : {
          key: boardQueryKey,
          extraTasks: [],
          nextCursor: null,
          hasMore: false,
          status: 'idle' as const,
          errorMessage: null,
        };
  const baseTaskItems =
    boardData !== null
      ? mergeBoardTaskPages(boardData.tasks, activePaginationState.extraTasks)
      : [];
  const taskItems =
    taskItemsState.key === taskQueryKey
      ? mergeTaskListOverlay(baseTaskItems, taskItemsState.overlay)
      : baseTaskItems;

  const openCreateTaskModal = useCallback(() => {
    setIsCreateTaskOpen(true);
  }, []);

  const closeCreateTaskModal = useCallback(() => {
    setIsCreateTaskOpen(false);
  }, []);

  const openTaskDetailsModal = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const closeTaskDetailsModal = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  useEffect(() => {
    if (boardData === null) {
      return;
    }

    setPaginationState((current) => {
      if (current.key === boardQueryKey) {
        return current;
      }

      return {
        key: boardQueryKey,
        extraTasks: [],
        nextCursor: boardData.nextCursor,
        hasMore: boardData.hasMore,
        status: 'idle',
        errorMessage: null,
      };
    });
  }, [boardData, boardQueryKey]);

  const loadMoreTasks = useCallback(async () => {
    if (boardData === null) {
      return;
    }

    if (
      !accessToken ||
      activePaginationState.status === 'loading' ||
      !activePaginationState.hasMore ||
      !activePaginationState.nextCursor
    ) {
      return;
    }

    setPaginationState((current) => {
      if (current.key !== boardQueryKey) {
        return current;
      }

      return {
        ...current,
        status: 'loading',
        errorMessage: null,
      };
    });

    try {
      const nextPage = await getWorkspaceBoardData(
        workspaceId,
        accessToken,
        backendAssignmentFilter
          ? {
              assignment: backendAssignmentFilter,
              includeMembers: false,
              limit: INITIAL_BOARD_TASK_LIMIT,
              cursor: activePaginationState.nextCursor,
            }
          : {
              includeMembers: false,
              limit: INITIAL_BOARD_TASK_LIMIT,
              cursor: activePaginationState.nextCursor,
            },
      );

      setPaginationState((current) => {
        if (current.key !== boardQueryKey) {
          return current;
        }

        return {
          ...current,
          extraTasks: mergeBoardTaskPages(current.extraTasks, nextPage.tasks),
          nextCursor: nextPage.nextCursor,
          hasMore: nextPage.hasMore,
          status: 'idle',
          errorMessage: null,
        };
      });
    } catch (error) {
      setPaginationState((current) => {
        if (current.key !== boardQueryKey) {
          return current;
        }

        return {
          ...current,
          status: 'error',
          errorMessage:
            error instanceof Error ? error.message : GENERIC_LAZY_LOAD_ERROR_MESSAGE,
        };
      });
    }
  }, [
    accessToken,
    activePaginationState.hasMore,
    activePaginationState.nextCursor,
    activePaginationState.status,
    backendAssignmentFilter,
    boardData,
    boardQueryKey,
    workspaceId,
  ]);

  useEffect(() => {
    if (boardDataQuery.status !== 'success') {
      setActionOverride(null);
      return;
    }

    setActionOverride({
      label: 'Create Task',
      icon: 'create',
      onAction: openCreateTaskModal,
    });

    return () => {
      setActionOverride(null);
    };
  }, [boardDataQuery.status, openCreateTaskModal, setActionOverride]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    if (boardDataQuery.status === 'error') {
      console.error('Failed to load workspace board data.', boardDataQuery.error);
    }
  }, [boardDataQuery.error, boardDataQuery.status]);

  return (
    <div className="mx-auto flex w-full max-w-[1520px] flex-col">
      {boardDataQuery.status === 'loading' ? <BoardLoadingState /> : null}

      {boardDataQuery.status === 'error' ? (
        <PageStatusCard
          title="Board unavailable"
          description={GENERIC_BOARD_ERROR_MESSAGE}
          tone="danger"
          actionLabel="Retry board"
          onAction={() => {
            setBoardRetryNonce((current) => current + 1);
          }}
        />
      ) : null}

      {boardDataQuery.status === 'success' ? (
        <div className="flex flex-col gap-3" data-perf-board-ready="true">
          {shouldLoadMembers && membersQuery.status === 'loading' ? (
            <PageSurface
              eyebrow="Loading filters"
              title="Members loading in background"
              description="The board is ready. Assignee-specific filters will appear as soon as members load."
            />
          ) : null}

          {membersUnavailable ? (
            <PageSurface
              eyebrow="Limited filters"
              title="Members unavailable"
              description="Tasks are available, but member-specific filters are unavailable until workspace members can be loaded."
            />
          ) : null}

          {activePaginationState.hasMore || activePaginationState.status !== 'idle' ? (
            <PageSurface
              eyebrow="Task list capped"
              title={`Showing the newest ${String(boardDataQuery.data.limit)} tasks`}
              description="Initial board payload is intentionally compact. Load additional pages only when you need them."
            >
              <div className="flex flex-wrap items-center gap-3">
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void loadMoreTasks();
                  }}
                  disabled={!activePaginationState.hasMore || activePaginationState.status === 'loading'}
                >
                  {activePaginationState.status === 'loading' ? 'Loading…' : 'Load more tasks'}
                </AppButton>

                {activePaginationState.status === 'error' ? (
                  <p className="text-[0.86rem] text-danger">
                    {activePaginationState.errorMessage ?? GENERIC_LAZY_LOAD_ERROR_MESSAGE}
                  </p>
                ) : null}
              </div>
            </PageSurface>
          ) : null}

          <BoardPage
            workspace={boardDataQuery.data.workspace}
            tasks={taskItems}
            assigneeFilter={resolvedAssigneeFilter}
            assigneeOptions={assigneeOptions}
            statusFilter={statusFilter}
            statusOptions={STATUS_OPTIONS}
            currentUserId={auth.user.id}
            membersUnavailable={membersUnavailable}
            onStatusChange={setStatusFilter}
            onAssigneeChange={setAssigneeFilter}
            onTaskOpen={openTaskDetailsModal}
          />
        </div>
      ) : null}

      <CreateTaskModal
        open={isCreateTaskOpen}
        workspaceId={workspaceId}
        members={members}
        membersUnavailable={members === null}
        onClose={closeCreateTaskModal}
        onCreated={(task) => {
          setTaskItemsState((current) => ({
            key: taskQueryKey,
            overlay: applyTaskOverlayMutation(
              current.key === taskQueryKey
                ? current.overlay
                : { tasks: [], removedTaskIds: [] },
              task,
              {
                shouldInclude: matchesTaskAssignmentFilter(
                  task,
                  backendAssignmentFilter,
                  auth.user.id,
                ),
              },
            ),
          }));
        }}
      />

      <TaskDetailsModal
        open={selectedTaskId !== null}
        taskId={selectedTaskId}
        workspaceId={workspaceId}
        members={members}
        membersUnavailable={members === null}
        onClose={closeTaskDetailsModal}
        onTaskChanged={(task) => {
          setTaskItemsState((current) => ({
            key: taskQueryKey,
            overlay: applyTaskOverlayMutation(
              current.key === taskQueryKey
                ? current.overlay
                : { tasks: [], removedTaskIds: [] },
              task,
              {
                shouldInclude: matchesTaskAssignmentFilter(
                  task,
                  backendAssignmentFilter,
                  auth.user.id,
                ),
              },
            ),
          }));
        }}
        onTaskDeleted={(taskId) => {
          setSelectedTaskId(null);
          setTaskItemsState((current) => ({
            key: taskQueryKey,
            overlay: applyTaskOverlayRemoval(
              current.key === taskQueryKey
                ? current.overlay
                : { tasks: [], removedTaskIds: [] },
              taskId,
            ),
          }));
        }}
      />
    </div>
  );
}

function mergeBoardTaskPages(baseTasks: TaskSummary[], nextTasks: TaskSummary[]): TaskSummary[] {
  if (nextTasks.length === 0) {
    return baseTasks;
  }

  const tasksById = new Map<string, TaskSummary>();

  for (const task of baseTasks) {
    tasksById.set(task.id, task);
  }

  for (const task of nextTasks) {
    if (!tasksById.has(task.id)) {
      tasksById.set(task.id, task);
    }
  }

  return Array.from(tasksById.values());
}
