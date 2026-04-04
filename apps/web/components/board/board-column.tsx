import type { GroupedBoardColumn } from '@/lib/board';
import { StatusBadge } from '@/components/app-shell/page-state';
import { BoardTaskCard } from '@/components/board/task-card';

interface BoardColumnProps {
  column: GroupedBoardColumn;
  hasAnyVisibleTasks: boolean;
  onTaskOpen: (taskId: string) => void;
}

export function BoardColumn({ column, hasAnyVisibleTasks, onTaskOpen }: BoardColumnProps) {
  return (
    <section className="flex min-w-[300px] flex-1 flex-col">
      <div className="flex items-center gap-2.5 px-0.5 pb-3">
        <h3 className="text-[1.45rem] font-semibold tracking-tight text-foreground">
          {column.title}
        </h3>
        <StatusBadge label={String(column.tasks.length)} />
      </div>

      <div className="flex min-h-[430px] flex-col gap-3 rounded-[1.1rem] border border-line/50 bg-[rgba(246,248,245,0.72)] p-2.5">
        {column.tasks.map((task) => (
          <BoardTaskCard key={task.id} task={task} onOpen={onTaskOpen} />
        ))}

        {column.tasks.length === 0 ? (
          <div className="flex min-h-[140px] items-center justify-center rounded-[0.95rem] border border-dashed border-line/80 bg-white/78 px-5 text-center text-[0.9rem] leading-6 text-muted">
            {hasAnyVisibleTasks
              ? `No ${column.title.toLowerCase()} tasks right now.`
              : 'No tasks match the current filters.'}
          </div>
        ) : null}
      </div>
    </section>
  );
}
