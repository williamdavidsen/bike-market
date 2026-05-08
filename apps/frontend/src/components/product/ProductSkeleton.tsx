export function ProductSkeleton() {
  return (
    <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
      <div className="aspect-[4/3] animate-pulse rounded-md bg-slate-100" />
      <div className="mt-4 h-3 w-24 animate-pulse rounded bg-slate-100" />
      <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-slate-100" />
      <div className="mt-3 h-4 w-28 animate-pulse rounded bg-slate-100" />
      <div className="mt-5 h-11 animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}
