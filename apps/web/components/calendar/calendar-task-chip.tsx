'use client';

import type { CalendarDueTask } from '@/lib/calendar';
import { getTaskChipStatusLabel } from '@/lib/calendar';
import { StatusBadge } from '@/components/app-shell/page-state';

interface CalendarTaskChipProps {
  task: CalendarDueTask;
  variant: 'month' | 'week' | 'day';
  onOpen: (taskId: string) => void;
}

export function CalendarTaskChip({ task, variant, onOpen }: CalendarTaskChipProps) {
  if (variant === 'day') {
    return (
      <button
        type="button"
        onClick={() => {
          onOpen(task.id);
        }}
        className="flex w-full items-center justify-between gap-3 rounded-[0.9rem] border border-line bg-surface-strong px-3.5 py-3 text-left shadow-[0_0.5rem_1.25rem_rgba(15,23,42,0.05)] transition-colors hover:border-line-strong"
      >
        <div className="min-w-0">
          <p className="truncate text-[0.92rem] font-semibold tracking-tight text-foreground">{task.title}</p>
          <p className="mt-1 truncate text-[0.8rem] text-muted">
            {task.assigneeUser?.displayName ?? task.createdByUser.displayName}
          </p>
        </div>
        <StatusBadge label={getTaskChipStatusLabel(task.status)} tone={getStatusTone(task.status)} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        onOpen(task.id);
      }}
      className={`w-full rounded-[0.68rem] border border-line/75 bg-surface-muted px-2 py-1.5 text-left text-[0.78rem] font-medium text-foreground transition-colors hover:border-line-strong ${
        variant === 'month' ? 'truncate' : ''
      }`}
      title={task.title}
    >
      <span className="block truncate">{task.title}</span>
    </button>
  );
}

function getStatusTone(status: CalendarDueTask['status']): 'accent' | 'progress' | 'default' {
  if (status === 'done') {
    return 'accent';
  }

  if (status === 'in_progress') {
    return 'progress';
  }

  return 'default';
}
