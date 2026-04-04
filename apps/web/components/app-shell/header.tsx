'use client';

import Link from 'next/link';
import type { ShellRouteContext } from '@/lib/app-shell';
import { useAppShellAction } from '@/lib/app-shell-action-context';

interface AppShellHeaderProps {
  routeContext: ShellRouteContext;
}

export function AppShellHeader({ routeContext }: AppShellHeaderProps) {
  const { actionOverride } = useAppShellAction();
  const action = actionOverride ?? routeContext.definition.action;
  const actionClassName =
    'inline-flex min-h-10 items-center justify-center rounded-[0.92rem] bg-accent px-[1.125rem] text-[0.94rem] font-semibold text-white transition-colors hover:bg-accent-strong';
  const disabledActionClassName =
    'inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-[0.92rem] bg-accent px-[1.125rem] text-[0.94rem] font-semibold text-white/80 opacity-60';

  return (
    <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3.5 lg:px-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          {routeContext.definition.eyebrow}
        </p>
        <h1 className="mt-2 text-[2.15rem] font-semibold tracking-tight text-foreground">
          {routeContext.definition.title}
        </h1>
        {routeContext.definition.subtitle ? (
          <p className="mt-1.5 max-w-2xl text-[0.94rem] leading-6 text-muted">
            {routeContext.definition.subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex min-h-10 items-start justify-end pt-0.5">
        {action?.onAction ? (
          <button
            type="button"
            onClick={action.onAction}
            className={actionClassName}
          >
            {action.label}
          </button>
        ) : action?.href ? (
          <Link
            href={action.href}
            className={actionClassName}
          >
            {action.label}
          </Link>
        ) : action ? (
          <button
            type="button"
            disabled
            className={disabledActionClassName}
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </header>
  );
}
