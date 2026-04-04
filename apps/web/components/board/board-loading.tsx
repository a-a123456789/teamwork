export function BoardLoadingState() {
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="h-[5.5rem] animate-pulse rounded-[var(--radius-panel)] border border-line bg-surface-strong/80 shadow-[var(--panel-shadow)]" />
      <div className="flex gap-4 lg:gap-5">
        <div className="h-[610px] w-[246px] animate-pulse rounded-[var(--radius-panel)] border border-line bg-surface-strong/80 shadow-[var(--panel-shadow)]" />
        <div className="grid flex-1 grid-cols-3 gap-4 lg:gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={String(index)} className="flex flex-col gap-4">
              <div className="h-9 w-[8.5rem] animate-pulse rounded-[0.95rem] bg-surface-strong/80" />
              <div className="h-[512px] animate-pulse rounded-[var(--radius-panel)] border border-line bg-surface-strong/80 shadow-[var(--panel-shadow)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
