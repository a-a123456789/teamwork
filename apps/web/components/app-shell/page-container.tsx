import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">{children}</div>;
}
