'use client';

import { useEffect, useRef, useState } from 'react';
import type { TaskSummary } from '@teamwork/types';
import { BoardTaskCard } from '@/components/board/task-card';

interface DeferredBoardTaskCardProps {
  task: TaskSummary;
  onOpen: (taskId: string) => void;
  eager?: boolean;
}

export function DeferredBoardTaskCard({
  task,
  onOpen,
  eager = false,
}: DeferredBoardTaskCardProps) {
  const shouldRenderWithoutObserver =
    typeof window !== 'undefined' && typeof window.IntersectionObserver === 'undefined';
  const [isVisible, setIsVisible] = useState<boolean>(eager || shouldRenderWithoutObserver);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible || eager || shouldRenderWithoutObserver) {
      return;
    }

    const anchor = anchorRef.current;

    if (!anchor || typeof window.IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '300px 0px',
      },
    );

    observer.observe(anchor);

    return () => {
      observer.disconnect();
    };
  }, [eager, isVisible, shouldRenderWithoutObserver]);

  return (
    <div ref={anchorRef}>
      {isVisible ? (
        <BoardTaskCard task={task} onOpen={onOpen} />
      ) : (
        <div
          aria-hidden
          className="min-h-[6.9rem] rounded-[0.875rem] border border-line bg-surface-muted/45"
        />
      )}
    </div>
  );
}
