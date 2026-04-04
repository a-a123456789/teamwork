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
    <aside className="shell-panel hidden w-[292px] shrink-0 flex-col rounded-[2rem] border border-line bg-surface px-5 py-6 shadow-[var(--shadow)] lg:flex">
      <div className="px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">TeamWork</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {currentWorkspace?.name ?? 'Workspace'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Shared navigation and page framing for the authenticated app.
        </p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
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
      className={`group flex items-center gap-3 rounded-[1.2rem] px-4 py-3 transition-colors ${
        isActive
          ? 'bg-accent text-white shadow-sm'
          : 'text-foreground hover:bg-surface-muted'
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          isActive ? 'bg-white/14 text-white' : 'bg-accent-soft text-accent-strong'
        }`}
      >
        {item.icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold">{item.label}</span>
        <span className={`text-xs ${isActive ? 'text-white/72' : 'text-muted'}`}>
          {item.description}
        </span>
      </span>
    </Link>
  );
}
