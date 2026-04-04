'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  helperText: string;
  helperHref: string;
  helperLabel: string;
  children: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  helperText,
  helperHref,
  helperLabel,
  children,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-[460px]">
        <div className="text-center">
          <h1 className="text-[3rem] font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 text-lg text-muted">{subtitle}</p>
        </div>

        <section className="shell-panel mt-9 rounded-[1.75rem] border border-line bg-surface-strong px-7 py-8 shadow-[var(--shadow)]">
          {children}

          <p className="mt-6 text-center text-sm text-muted">
            {helperText}{' '}
            <Link href={helperHref} className="font-semibold text-foreground transition-colors hover:text-accent">
              {helperLabel}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
