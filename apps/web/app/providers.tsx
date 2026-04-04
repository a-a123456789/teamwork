'use client';

import type { ReactNode } from 'react';
import { AuthSessionProvider } from '@/lib/auth/auth-session-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
