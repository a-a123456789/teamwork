import {
  getBoardAssigneeKey,
  type BoardAssigneeFilter,
  type BoardStatusFilter,
} from '@/lib/board';
import { ContentPanel } from '@/components/app-shell/page-state';

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
    <ContentPanel className="flex w-[258px] shrink-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="text-[1.45rem] font-semibold tracking-tight text-foreground">Filters</h3>
        <FilterFunnelIcon />
      </div>

      <div className="flex flex-col gap-8 px-5 py-5">
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
        />
      </div>
    </ContentPanel>
  );
}

function FilterSection({
  title,
  options,
  note,
}: {
  title: string;
  options: Array<{
    key: string;
    label: string;
    selected: boolean;
    onSelect: () => void;
  }>;
  note?: string | null;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{title}</h4>
        <ChevronIcon />
      </div>
      <div className="mt-4 flex flex-col gap-1">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={option.onSelect}
            className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-[0.98rem] font-medium transition-colors ${
              option.selected
                ? 'bg-accent-soft text-foreground'
                : 'text-foreground hover:bg-surface-muted'
            }`}
          >
            <span>{option.label}</span>
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                option.selected ? 'text-accent' : 'text-transparent'
              }`}
            >
              <CheckIcon />
            </span>
          </button>
        ))}
      </div>
      {note ? <p className="mt-3 text-xs leading-5 text-muted">{note}</p> : null}
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
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.5 6h15l-5.8 6.5V18l-3.4 1.8v-7.3z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m8 10 4 4 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.1">
      <path d="m5 12.5 4.2 4.2L19 7.5" />
    </svg>
  );
}
