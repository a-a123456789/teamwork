'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CALENDAR_FILTER_OPTIONS,
  type CalendarAudienceFilter,
  type CalendarView,
} from '@/lib/calendar';
import { getButtonClassName, getIconButtonClassName } from '@/components/ui/button';

interface CalendarToolbarProps {
  currentFilter: CalendarAudienceFilter;
  currentView: CalendarView;
  onFilterChange: (value: CalendarAudienceFilter) => void;
  onViewChange: (value: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarToolbar({
  currentFilter,
  currentView,
  onFilterChange,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarToolbarProps) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);
  const currentFilterOption = readFilterOption(currentFilter);

  useEffect(() => {
    if (!isFilterMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !filterMenuRef.current?.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isFilterMenuOpen]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5 xl:flex-nowrap">
      <div ref={filterMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsFilterMenuOpen((current) => !current);
          }}
          className={`${getButtonClassName('secondary')} min-h-[2.375rem] gap-2 px-3.5 text-[0.875rem]`}
        >
          {currentFilterOption.label}
          <ChevronDownIcon />
        </button>

        {isFilterMenuOpen ? (
          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-[18rem] rounded-[1rem] border border-line bg-surface-strong p-2 shadow-[0_1rem_2.25rem_rgba(15,23,20,0.12)]">
            {CALENDAR_FILTER_OPTIONS.map((option) => {
              const isActive = option.value === currentFilter;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onFilterChange(option.value);
                    setIsFilterMenuOpen(false);
                  }}
                  className="flex w-full items-start justify-between gap-3 rounded-[0.9rem] px-3 py-2 text-left transition-colors hover:bg-surface-muted"
                >
                  <div className="min-w-0">
                    <p className="text-[0.9rem] font-semibold text-foreground">{option.label}</p>
                    <p className="mt-1 text-[0.8rem] leading-5 text-muted">{option.description}</p>
                  </div>
                  <span className="pt-1 text-accent">{isActive ? <CheckIcon /> : null}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 xl:flex-nowrap">
        <div className="inline-flex items-center gap-1 rounded-[0.9rem] border border-line bg-surface-muted/80 p-[0.1875rem]">
          {(['month', 'week', 'day'] as CalendarView[]).map((view) => {
            const isActive = currentView === view;

            return (
              <button
                key={view}
                type="button"
                onClick={() => {
                  onViewChange(view);
                }}
                className={`inline-flex min-h-[2.125rem] items-center rounded-[0.7rem] px-3 text-[0.85rem] font-semibold transition-colors ${
                  isActive
                    ? 'bg-foreground text-white shadow-[0_0.375rem_1rem_rgba(15,23,20,0.16)]'
                    : 'text-foreground hover:bg-white/70'
                }`}
              >
                {capitalizeLabel(view)}
              </button>
            );
          })}
        </div>

        <div className="h-7 w-[0.0625rem] bg-line" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            className={getIconButtonClassName()}
            aria-label="Previous period"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={onToday}
            className={getButtonClassName('ghost', 'compact')}
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNext}
            className={getIconButtonClassName()}
            aria-label="Next period"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

function capitalizeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function readFilterOption(value: CalendarAudienceFilter) {
  return (
    CALENDAR_FILTER_OPTIONS.find((option) => option.value === value) ??
    CALENDAR_FILTER_OPTIONS[0] ?? {
      value: 'for_me' as const,
      label: 'For me',
      description: 'Tasks with due dates created by me or assigned to me.',
    }
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m4.5 10 3.3 3.4L15.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {direction === 'left' ? (
        <path d="m12.5 4.5-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m7.5 4.5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
