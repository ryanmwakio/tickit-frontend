import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  );
}

// Event Card Skeleton
export function EventCardSkeleton() {
  return (
    <div className="group relative flex min-w-[280px] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// Event Grid Skeleton
export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Event List Skeleton
export function EventListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-lg"
        >
          <Skeleton className="h-32 w-32 flex-shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Event Detail Skeleton
export function EventDetailSkeleton() {
  return (
    <div className="bg-white text-slate-900">
      <section className="relative isolate overflow-hidden border-b border-slate-100 bg-white">
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-6 sm:space-y-8 lg:space-y-10">
          <Skeleton className="h-4 w-32" />
          <div className="grid items-start gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4 sm:space-y-6 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white/90 p-4 sm:p-5">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-3xl border border-slate-100 bg-white/80 p-5">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-w-0">
              <Skeleton className="h-[280px] sm:h-[350px] lg:h-[420px] w-full rounded-2xl sm:rounded-3xl" />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-[1.5fr,1fr]">
            <div className="space-y-6 sm:space-y-8 min-w-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
            <aside className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 lg:p-6">
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-8 w-40 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

// Category Filter Skeleton
export function CategoryFilterSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="scrollbar-minimal flex snap-x gap-3 overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-32 rounded-full flex-shrink-0" />
      ))}
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50">
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Dashboard Card Skeleton
export function DashboardCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// Dashboard Grid Skeleton
export function DashboardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}

