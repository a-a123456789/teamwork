import type { TaskSummary } from '@teamwork/types';

interface BoardTaskCardProps {
  task: TaskSummary;
  onOpen: (taskId: string) => void;
}

export function BoardTaskCard({ task, onOpen }: BoardTaskCardProps) {
  const accentStyles = readTaskCardAccent(task.status);

  return (
    <button
      type="button"
      onClick={() => {
        onOpen(task.id);
      }}
      className={`rounded-[0.875rem] border px-[1.25rem] py-[1.125rem] text-left transition-transform transition-colors hover:-translate-y-0.5 ${accentStyles.cardClassName}`}
    >
      <div className="flex items-start gap-[0.75rem]">
        <span className={`mt-[0.4rem] h-[0.75rem] w-[0.75rem] shrink-0 rounded-full ${accentStyles.dotClassName}`} />
        <div className="min-w-0 flex-1">
          <h4 className="text-[1rem] font-semibold leading-[1.35] tracking-tight text-foreground">
            {task.title}
          </h4>

          {task.description ? (
            <p className="mt-[0.75rem] line-clamp-2 text-[0.875rem] leading-[1.5rem] text-muted">
              {task.description}
            </p>
          ) : null}

          <div className="mt-[0.875rem] flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-[0.25rem] text-[0.8125rem] font-medium text-muted">
            <TaskMeta label={task.assigneeUser?.displayName ?? 'Unassigned'} />
            <TaskMeta label={`By ${task.createdByUser.displayName}`} />
          </div>
        </div>
      </div>
    </button>
  );
}

function TaskMeta({ label }: { label: string }) {
  return <span className="font-medium">{label}</span>;
}

function readTaskCardAccent(status: TaskSummary['status']): {
  cardClassName: string;
  dotClassName: string;
} {
  if (status === 'todo') {
    return {
      cardClassName: 'border-[#c8f3d6] bg-[#f3fdf6]',
      dotClassName: 'bg-[#7be7a5]',
    };
  }

  if (status === 'in_progress') {
    return {
      cardClassName: 'border-[#ffe067] bg-[#fffceb]',
      dotClassName: 'bg-[#ffbc00]',
    };
  }

  return {
    cardClassName: 'border-[#dccfff] bg-[#f7f3ff]',
    dotClassName: 'bg-[#7a2cf5]',
  };
}
