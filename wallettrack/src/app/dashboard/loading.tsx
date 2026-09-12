import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";

/**
 * Shown while a dashboard route's server component resolves.
 *
 * Mirrors the real layout so the page settles into place instead of jumping
 * when the data arrives.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-7 w-32" />
            <Skeleton className="mt-3 h-3 w-28" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="p-5 xl:col-span-3">
          <Skeleton className="h-[280px] w-full" />
        </Card>
        <Card className="p-5 xl:col-span-2">
          <Skeleton className="h-[280px] w-full" />
        </Card>
      </div>
    </div>
  );
}
