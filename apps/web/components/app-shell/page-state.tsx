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
      className={`shell-panel rounded-[1.75rem] border p-8 shadow-[var(--shadow)] ${toneClasses[tone]}`}
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
    <section className="shell-panel rounded-[1.75rem] border border-line bg-surface-strong p-8 shadow-[var(--shadow)]">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{eyebrow}</p>
      ) : null}
      {title ? (
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      ) : null}
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
