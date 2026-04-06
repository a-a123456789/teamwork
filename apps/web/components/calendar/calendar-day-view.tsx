'use client';

import type { CalendarDueTask } from '@/lib/calendar';
import { CalendarTaskChip } from '@/components/calendar/calendar-task-chip';

interface CalendarDayViewProps {
  tasks: CalendarDueTask[];
  onTaskOpen: (taskId: string) => void;
}

export function CalendarDayView({ tasks, onTaskOpen }: CalendarDayViewProps) {
  return (
    <div className="flex min-h-0 flex-1 px-4 pb-4">
      <div className="mx-auto flex min-h-0 w-full max-w-[42rem] flex-1 flex-col gap-2 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <CalendarTaskChip key={task.id} task={task} variant="day" onOpen={onTaskOpen} />
          ))
        ) : (
          <div className="rounded-[0.9rem] border border-dashed border-line bg-surface-muted/65 px-5 py-7 text-center text-[0.875rem] leading-6 text-muted">
            No tasks are due on this day with the current calendar filter.
          </div>
        )}
      </div>
    </div>
  );
}
