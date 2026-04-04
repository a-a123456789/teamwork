import type { ReactNode } from 'react';
import type { WorkspaceResponse } from '@teamwork/types';

interface BoardWorkspaceSummaryProps {
  workspace: WorkspaceResponse['workspace'];
}

export function BoardWorkspaceSummary({ workspace }: BoardWorkspaceSummaryProps) {
  return (
    <section className="flex items-center justify-between gap-6 rounded-[1.5rem] border border-line bg-surface-strong px-6 py-5 shadow-[0_14px_32px_rgba(15,23,20,0.05)]">
      <div className="min-w-0">
        <h2 className="truncate text-[1.85rem] font-semibold tracking-tight text-foreground">
          {workspace.name}
        </h2>
      </div>
      <div className="flex items-center gap-6 text-sm font-medium text-muted">
        <SummaryMetric
          icon={<MembersMetricIcon />}
          value={`${String(workspace.memberCount)} member${workspace.memberCount === 1 ? '' : 's'}`}
        />
        <SummaryMetric
          icon={<InvitationsMetricIcon />}
          value={`${String(workspace.invitationCount)} pending`}
        />
      </div>
    </section>
  );
}

function SummaryMetric({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-muted">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function MembersMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15.5 18v-.8a3.2 3.2 0 0 0-3.2-3.2H10a3.2 3.2 0 0 0-3.2 3.2v.8" />
      <circle cx="11.2" cy="8.2" r="3.2" />
      <path d="M18.4 10.2a2.4 2.4 0 0 1 0 4.8" />
      <path d="M18.4 18v-.8a3.75 3.75 0 0 0-1.36-2.9" />
    </svg>
  );
}

function InvitationsMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7.2h16v9.3A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5z" />
      <path d="m4.8 8 7.2 5 7.2-5" />
    </svg>
  );
}
