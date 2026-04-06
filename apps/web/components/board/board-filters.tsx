import {
  getBoardAssigneeKey,
  type BoardAssigneeFilter,
  type BoardStatusFilter,
} from '@/lib/board';

interface BoardFiltersPanelProps {
  statusFilter: BoardStatusFilter;
  assigneeFilter: BoardAssigneeFilter;
  statusOptions: BoardStatusFilter[];
  assigneeOptions: BoardAssigneeFilter[];
  onStatusChange: (value: BoardStatusFilter) => void;
  onAssigneeChange: (value: BoardAssigneeFilter) => void;
  membersUnavailable: boolean;
}

export function BoardFiltersPanel({
  statusFilter,
  assigneeFilter,
  statusOptions,
  assigneeOptions,
  onStatusChange,
  onAssigneeChange,
  membersUnavailable,
}: BoardFiltersPanelProps) {
  return (
    <aside className="w-full shrink-0 border-b border-line px-[1rem] py-[1rem] xl:w-[12.5rem] xl:border-b-0 xl:border-r">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.25rem] font-semibold tracking-tight text-foreground">Filters</h2>
        <FilterFunnelIcon />
      </div>

      <div className="mt-[1.25rem] grid grid-cols-1 gap-[1.25rem] sm:grid-cols-2 xl:grid-cols-1">
        <FilterSection
          title="Status"
          options={statusOptions.map((option) => ({
            key: option,
            label: toStatusLabel(option),
            selected: statusFilter === option,
            onSelect: () => {
              onStatusChange(option);
            },
          }))}
        />

        <FilterSection
          title="Assigned To"
          options={assigneeOptions.map((option) => ({
            key: getBoardAssigneeKey(option),
            label: option.label,
            selected:
              assigneeFilter.kind === option.kind &&
              getBoardAssigneeKey(assigneeFilter) === getBoardAssigneeKey(option),
            onSelect: () => {
              onAssigneeChange(option);
            },
          }))}
          note={
            membersUnavailable
              ? 'Member-specific filters are unavailable until workspace members load.'
              : null
          }
          listClassName="max-h-[12rem] overflow-y-auto pr-[0.25rem] shell-scrollbar xl:max-h-[16rem]"
        />
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  options,
  note,
  listClassName,
}: {
  title: string;
  options: Array<{
    key: string;
    label: string;
    selected: boolean;
    onSelect: () => void;
  }>;
  note?: string | null;
  listClassName?: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted">
          {title}
        </h3>
        <ChevronIcon />
      </div>

      <div className={`mt-[0.75rem] space-y-[0.125rem] ${listClassName ?? ''}`}>
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={option.onSelect}
            className="flex w-full items-center justify-between rounded-[0.625rem] px-[0.625rem] py-[0.5rem] text-left text-[0.875rem] font-medium text-foreground transition-colors hover:bg-surface-muted/70"
          >
            <span className="min-w-0 pr-[0.5rem] break-words">{option.label}</span>
            <span className={option.selected ? 'text-[#34d7cf]' : 'text-transparent'}>
              <CheckIcon />
            </span>
          </button>
        ))}
      </div>

      {note ? <p className="mt-[0.625rem] text-[0.6875rem] leading-[1.1rem] text-muted">{note}</p> : null}
    </section>
  );
}

function toStatusLabel(status: BoardStatusFilter): string {
  if (status === 'all') {
    return 'All';
  }

  if (status === 'todo') {
    return 'To Do';
  }

  if (status === 'in_progress') {
    return 'In Progress';
  }

  return 'Done';
}

function FilterFunnelIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[1.25rem] w-[1.25rem] text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4.5 6h15l-5.8 6.5V18l-3.4 1.8v-7.3z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[1rem] w-[1rem] text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m7 9 5 5 5-5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[1rem] w-[1rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
    >
      <path d="m5 12.5 4.2 4.2L19 7.5" />
    </svg>
  );
}
