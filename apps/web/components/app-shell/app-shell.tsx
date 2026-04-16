'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { PageStatusCard } from '@/components/app-shell/page-state';
import { useAuthSession } from '@/lib/auth/auth-session-provider';
import {
  deriveShellRouteContext,
  getWorkspaceBoardHref,
  type ShellRouteContext,
} from '@/lib/app-shell';

interface AppShellProps {
  children: ReactNode;
}

const LazyAppShellHeader = dynamic(
  () => import('@/components/app-shell/header').then((module) => module.AppShellHeader),
  {
    ssr: false,
    loading: () => <AppShellHeaderFallback routeContext={null} />,
  },
);

const LazySidebarNavigation = dynamic(
  () => import('@/components/app-shell/sidebar').then((module) => module.SidebarNavigation),
  {
    ssr: false,
    loading: () => <SidebarNavigationFallback />,
  },
);

const LazyCreateWorkspaceModal = dynamic(
  () =>
    import('@/components/workspaces/create-workspace-modal').then(
      (module) => module.CreateWorkspaceModal,
    ),
  {
    ssr: false,
  },
);

export function AppShell({ children }: AppShellProps): ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const { status, auth, accessToken, errorMessage, refreshSession } = useAuthSession();
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [showInteractiveChrome, setShowInteractiveChrome] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowInteractiveChrome(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const nextPath = encodeURIComponent(pathname || '/');
      router.replace(`/auth-required?next=${nextPath}`);
    }
  }, [pathname, router, status]);

  if (status === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <PageStatusCard
          title="Session unavailable"
          description={errorMessage ?? 'Your current session could not be validated.'}
          tone="danger"
          actionLabel="Retry session"
          onAction={() => {
            void refreshSession();
          }}
        />
      </main>
    );
  }

  if (status !== 'authenticated') {
    if (status === 'loading' && accessToken) {
      return (
        <div className="flex min-h-screen gap-3.5 p-3.5 lg:gap-4 lg:p-4">
          <SidebarNavigationFallback />
          <div className="shell-panel flex min-h-[calc(100vh-1.75rem)] flex-1 flex-col overflow-hidden rounded-[1.45rem] border border-line bg-surface-strong shadow-[var(--shadow)]">
            <AppShellHeaderFallback routeContext={null} />
            <div className="shell-scrollbar shell-grid flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
              {children}
            </div>
          </div>
        </div>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <PageStatusCard
          title="Loading TeamWork"
          description="Restoring your workspace access and account context."
          tone="default"
        />
      </main>
    );
  }

  if (auth.workspaces.length === 0) {
    return (
      <>
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
          <PageStatusCard
            title="No workspaces available"
            description="Your account is active, but there is no workspace available yet."
            tone="default"
            actionLabel="Create workspace"
            onAction={() => {
              setIsCreateWorkspaceOpen(true);
            }}
          />
        </main>
        {isCreateWorkspaceOpen ? (
          <LazyCreateWorkspaceModal
            open
            onClose={() => {
              setIsCreateWorkspaceOpen(false);
            }}
            onCreated={(workspaceId) => {
              router.replace(getWorkspaceBoardHref(workspaceId));
            }}
          />
        ) : null}
      </>
    );
  }

  const routeContext = deriveShellRouteContext(pathname, auth.workspaces);

  return (
    <div className="flex min-h-screen gap-3.5 p-3.5 lg:gap-4 lg:p-4">
      {showInteractiveChrome ? (
        <LazySidebarNavigation
          currentPath={pathname}
          currentWorkspace={routeContext.currentWorkspace}
        />
      ) : (
        <SidebarNavigationFallback />
      )}
      <div className="shell-panel flex min-h-[calc(100vh-1.75rem)] flex-1 flex-col overflow-hidden rounded-[1.45rem] border border-line bg-surface-strong shadow-[var(--shadow)]">
        {showInteractiveChrome ? (
          <LazyAppShellHeader routeContext={routeContext} />
        ) : (
          <AppShellHeaderFallback routeContext={routeContext} />
        )}
        <div className="shell-scrollbar shell-grid flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarNavigationFallback() {
  return (
    <aside className="shell-panel hidden w-[238px] shrink-0 flex-col rounded-[1.45rem] border border-line bg-surface px-3.5 py-[1.125rem] shadow-[var(--shadow)] lg:flex">
      <div className="px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">TeamWork</p>
        <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="mt-6 flex flex-1 flex-col gap-2">
        <div className="h-14 animate-pulse rounded-[0.95rem] bg-surface-muted" />
        <div className="h-14 animate-pulse rounded-[0.95rem] bg-surface-muted" />
        <div className="h-14 animate-pulse rounded-[0.95rem] bg-surface-muted" />
      </div>
      <div className="mt-4 h-16 animate-pulse rounded-[1rem] bg-surface-muted" />
    </aside>
  );
}

function AppShellHeaderFallback({
  routeContext,
}: {
  routeContext: ShellRouteContext | null;
}) {
  const title = routeContext?.definition.title ?? 'Loading';
  const eyebrow = routeContext?.definition.eyebrow ?? 'Workspace';
  const subtitle = routeContext?.definition.subtitle ?? null;
  const actionLabel = routeContext?.definition.action?.label ?? null;

  return (
    <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3.5 lg:px-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{eyebrow}</p>
        <h1 className="mt-2 text-[2.15rem] font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-2xl text-[0.94rem] leading-6 text-muted">{subtitle}</p>
        ) : null}
      </div>
      {actionLabel ? (
        <div className="flex min-h-10 items-start justify-end pt-0.5">
          <button
            type="button"
            disabled
            className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2.5 rounded-[0.92rem] bg-accent px-[1.125rem] text-[0.94rem] font-semibold text-white/80 opacity-60"
          >
            {actionLabel}
          </button>
        </div>
      ) : null}
    </header>
  );
}
