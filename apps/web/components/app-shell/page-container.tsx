import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 lg:gap-5">{children}</div>;
}
