import type { TaskSummary } from '@teamwork/types';

interface BoardTaskCardProps {
  task: TaskSummary;
  onOpen: (taskId: string) => void;
}

export function BoardTaskCard({ task, onOpen }: BoardTaskCardProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onOpen(task.id);
      }}
      className="rounded-[0.95rem] border border-line/80 bg-white px-4 py-3.5 text-left shadow-[0_4px_12px_rgba(15,23,20,0.04)] transition-transform transition-colors hover:-translate-y-0.5 hover:border-line-strong"
    >
      <h4 className="text-[0.98rem] font-semibold leading-6 tracking-tight text-foreground">
        {task.title}
      </h4>

      {task.description ? (
        <p className="mt-1.5 line-clamp-3 text-[0.9rem] leading-6 text-muted">
          {task.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.83rem] text-muted">
        <TaskMeta label={task.assigneeUser?.displayName ?? 'Unassigned'} />
        <TaskMeta label={`By ${task.createdByUser.displayName}`} />
      </div>
    </button>
  );
}

function TaskMeta({ label }: { label: string }) {
  return <span className="font-medium">{label}</span>;
}
