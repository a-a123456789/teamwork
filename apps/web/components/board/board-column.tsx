import type { GroupedBoardColumn } from '@/lib/board';
import { BoardTaskCard } from '@/components/board/task-card';
import { readBoardStatusAccent } from '@/lib/board-status-accent';

interface BoardColumnProps {
  column: GroupedBoardColumn;
  hasAnyVisibleTasks: boolean;
  onTaskOpen: (taskId: string) => void;
}

export function BoardColumn({ column, hasAnyVisibleTasks, onTaskOpen }: BoardColumnProps) {
  const accent = readBoardStatusAccent(column.status);

  return (
    <section className="flex min-w-0 flex-1 flex-col px-[1rem] py-[1.25rem] sm:px-[1.25rem] sm:py-[1.5rem]">
      <div className="flex flex-wrap items-center gap-x-[0.75rem] gap-y-[0.5rem] pb-[1rem] sm:pb-[1.5rem]">
        <span className={`h-[1rem] w-[1rem] rounded-full ${accent.dotClassName}`} />
        <h3 className="text-[1.125rem] font-semibold tracking-tight text-foreground sm:text-[1.375rem]">
          {column.title}
        </h3>
        <span className="inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-full bg-surface-muted px-[0.625rem] text-[0.9375rem] font-medium text-muted">
          {String(column.tasks.length)}
        </span>
      </div>

      <div className="flex min-h-[16rem] flex-col gap-[0.875rem] sm:min-h-[22rem] sm:gap-[1rem]">
        {column.tasks.map((task) => (
          <BoardTaskCard key={task.id} task={task} onOpen={onTaskOpen} />
        ))}

        {column.tasks.length === 0 ? (
          <div className="flex min-h-[8rem] items-center justify-center rounded-[0.875rem] border border-dashed border-line bg-surface-muted/50 px-[1rem] text-center text-[0.875rem] leading-[1.5rem] text-muted">
            {hasAnyVisibleTasks
              ? `No ${column.title.toLowerCase()} tasks right now.`
              : 'No tasks match the current filters.'}
          </div>
        ) : null}
      </div>
    </section>
  );
}
