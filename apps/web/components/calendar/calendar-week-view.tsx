'use client';

import type { CalendarWeekDay } from '@/lib/calendar';
import { CalendarTaskChip } from '@/components/calendar/calendar-task-chip';

interface CalendarWeekViewProps {
  days: CalendarWeekDay[];
  onTaskOpen: (taskId: string) => void;
}

export function CalendarWeekView({ days, onTaskOpen }: CalendarWeekViewProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-7 gap-2 px-4 pb-4">
      {days.map((day) => (
        <div key={day.date} className="flex min-h-0 flex-col rounded-[0.85rem] border border-line bg-surface-strong p-2.5">
          <div className="flex flex-col items-center gap-1.5 border-b border-line pb-2.5">
            <span className="text-[0.78rem] font-semibold text-muted">{day.weekdayShort}</span>
            <span
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-[0.95rem] font-semibold ${
                day.isSelected
                  ? 'bg-accent text-white'
                  : day.isToday
                    ? 'border border-accent/25 text-accent'
                    : 'text-foreground'
              }`}
            >
              {day.dayNumber}
            </span>
          </div>

          <div className="mt-2.5 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
            {day.tasks.length > 0 ? (
              day.tasks.map((task) => (
                <CalendarTaskChip key={task.id} task={task} variant="week" onOpen={onTaskOpen} />
              ))
            ) : (
              <div className="rounded-[0.8rem] border border-dashed border-line px-3 py-3.5 text-center text-[0.8rem] text-muted">
                No tasks due
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
