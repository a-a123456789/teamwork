export function CalendarLoadingState() {
  return (
    <section className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-surface-strong shadow-[var(--shadow)]">
      <div className="flex items-center justify-between gap-5 border-b border-line px-[var(--section-padding-x)] py-[var(--section-padding-y)]">
        <div className="h-10 w-[7.5rem] animate-pulse rounded-[0.9rem] bg-black/10" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-44 animate-pulse rounded-[0.9rem] bg-black/10" />
          <div className="h-9 w-28 animate-pulse rounded-[0.9rem] bg-black/10" />
        </div>
      </div>

      <div className="border-b border-line px-[var(--section-padding-x)] py-7">
        <div className="mx-auto h-9 w-52 animate-pulse rounded-[0.95rem] bg-black/10" />
      </div>

      <div className="grid grid-cols-7 border-b border-line bg-surface-muted/80">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={String(index)} className="border-r border-line px-3.5 py-3 last:border-r-0">
            <div className="mx-auto h-4 w-10 animate-pulse rounded-full bg-black/8" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: 14 }, (_, index) => (
          <div
            key={String(index)}
            className="min-h-[7.5rem] border-r border-b border-line px-3 py-3 last:border-r-0"
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-black/8" />
            <div className="mt-3.5 h-[2.125rem] w-full animate-pulse rounded-[0.78rem] bg-black/8" />
            <div className="mt-2 h-[2.125rem] w-4/5 animate-pulse rounded-[0.78rem] bg-black/6" />
          </div>
        ))}
      </div>
    </section>
  );
}
