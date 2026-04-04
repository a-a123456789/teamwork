import type { ReactNode } from 'react';

type StatusTone = 'default' | 'warning' | 'danger';

interface PageStatusCardProps {
  title: string;
  description: string;
  tone: StatusTone;
  actionLabel?: string;
  onAction?: () => void;
}

const toneClasses: Record<StatusTone, string> = {
  default: 'border-line bg-surface-strong',
  warning: 'border-line-strong bg-accent-soft',
  danger: 'border-line-strong bg-danger-soft',
};

export function PageStatusCard({
  title,
  description,
  tone,
  actionLabel,
  onAction,
}: PageStatusCardProps) {
  return (
    <section
      className={`shell-panel rounded-[1.35rem] border p-7 shadow-[var(--shadow)] ${toneClasses[tone]}`}
    >
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

export function ContentPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[var(--radius-panel)] border border-line bg-surface-strong shadow-[var(--panel-shadow)] ${className ?? ''}`}
    >
      {children}
    </section>
  );
}

export function ContentPanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-line px-[var(--section-padding-x)] py-[var(--section-padding-y)]">
      <div className="min-w-0">
        <h2 className="text-[1.82rem] font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 text-[1rem] leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'accent' | 'success' | 'progress';
}) {
  const toneClass =
    tone === 'accent'
      ? 'bg-accent-soft text-accent'
      : tone === 'success'
        ? 'bg-success-soft text-[var(--color-success)]'
        : tone === 'progress'
          ? 'bg-[#e8eef8] text-[#365489]'
          : 'bg-surface-muted text-muted';

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-[0.72rem] font-semibold ${toneClass}`}>
      {label}
    </span>
  );
}

interface PageSurfaceProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'skeleton';
  children?: ReactNode;
}

export function PageSurface({
  eyebrow,
  title,
  description,
  variant = 'default',
  children,
}: PageSurfaceProps) {
  if (variant === 'skeleton') {
    return (
      <section className="shell-panel rounded-[1.75rem] border border-line bg-surface-strong p-8 shadow-[var(--shadow)]">
        <div className="h-3 w-28 animate-pulse rounded-full bg-black/10" />
        <div className="mt-5 h-10 w-80 max-w-full animate-pulse rounded-2xl bg-black/10" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-black/5" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-black/5" />
      </section>
    );
  }

  return (
    <section className="shell-panel rounded-[1.35rem] border border-line bg-surface-strong p-7 shadow-[var(--shadow)]">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{eyebrow}</p>
      ) : null}
      {title ? (
        <h2 className="mt-3 text-[1.85rem] font-semibold tracking-tight text-foreground">{title}</h2>
      ) : null}
      {description ? (
        <p className="mt-2.5 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
