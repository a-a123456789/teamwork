export function BoardLoadingState() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-24 animate-pulse rounded-[1.5rem] border border-line bg-white/70" />
      <div className="flex gap-5">
        <div className="h-[620px] w-[258px] animate-pulse rounded-[1.6rem] border border-line bg-white/70" />
        <div className="grid flex-1 grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={String(index)} className="flex flex-col gap-4">
              <div className="h-10 w-36 animate-pulse rounded-2xl bg-white/70" />
              <div className="h-[520px] animate-pulse rounded-[1.4rem] border border-line bg-white/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
