'use client';

import type { ReactNode } from 'react';

export function AuthField({
  label,
  error,
  children,
}: {
  label: string;
  error: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {error ? <span className="text-sm text-danger">{error}</span> : null}
    </label>
  );
}

export function getAuthFieldClassName(hasError: boolean): string {
  return `min-h-12 rounded-[0.95rem] border bg-surface-muted px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent ${
    hasError ? 'border-danger/55' : 'border-line'
  }`;
}

export function AuthFormError({ message }: { message: string }) {
  return (
    <div className="rounded-[1rem] border border-danger/20 bg-danger-soft px-4 py-3 text-sm leading-6 text-danger">
      {message}
    </div>
  );
}
