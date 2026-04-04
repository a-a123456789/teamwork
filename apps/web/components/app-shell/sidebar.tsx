'use client';

import Link from 'next/link';
import type { AuthenticatedWorkspace } from '@teamwork/types';
import {
  getSidebarNavigationItems,
  matchesShellHref,
  type SidebarNavigationItem,
} from '@/lib/app-shell';

interface SidebarNavigationProps {
  currentPath: string;
  currentWorkspace: AuthenticatedWorkspace | null;
}

export function SidebarNavigation({
  currentPath,
  currentWorkspace,
}: SidebarNavigationProps) {
  const items = getSidebarNavigationItems(currentWorkspace?.id ?? null);

  return (
    <aside className="shell-panel hidden w-[238px] shrink-0 flex-col rounded-[1.45rem] border border-line bg-surface px-3.5 py-[1.125rem] shadow-[var(--shadow)] lg:flex">
      <div className="px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">TeamWork</p>
        <h2 className="mt-2.5 text-[1.48rem] font-semibold tracking-tight text-foreground">
          {currentWorkspace?.name ?? 'Workspace'}
        </h2>
        <p className="mt-2 text-[0.92rem] leading-6 text-muted">
          Shared navigation and page framing for the authenticated app.
        </p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1.5">
        {items.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            isActive={matchesShellHref(item.href, currentPath)}
          />
        ))}
      </nav>
    </aside>
  );
}

interface SidebarLinkProps {
  item: SidebarNavigationItem;
  isActive: boolean;
}

function SidebarLink({ item, isActive }: SidebarLinkProps) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-[0.95rem] px-3.5 py-3 transition-colors ${
        isActive
          ? 'bg-accent text-white shadow-[0_8px_18px_rgba(51,65,85,0.14)]'
          : 'text-foreground hover:bg-surface-muted'
      }`}
    >
      <span
        className={`flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-[0.82rem] transition-colors ${
          isActive ? 'bg-white/14 text-white' : 'bg-accent-soft text-accent'
        }`}
      >
        {item.icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[0.95rem] font-semibold leading-5">{item.label}</span>
        <span className={`text-xs ${isActive ? 'text-white/72' : 'text-muted'}`}>
          {item.description}
        </span>
      </span>
    </Link>
  );
}
