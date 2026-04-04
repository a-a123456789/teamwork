import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell/app-shell';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps): ReactNode {
  return <AppShell>{children}</AppShell>;
}
