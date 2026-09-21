import { TOOLS } from "@/components/app/tools";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-8 md:max-w-3xl">
      <Skeleton className="h-10 w-64 md:h-12" />
      <section className="flex w-full flex-col gap-3">
        <Skeleton className="h-7 w-20" />
        <ul className="flex flex-col gap-4">
          {TOOLS.map(({ href }) => (
            <li key={href}>
              <Card>
                <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 py-2 md:gap-x-6 md:py-6">
                  <Skeleton className="row-span-2 size-12 rounded-full md:size-16" />
                  <Skeleton className="h-7 w-40 md:h-8" />
                  <Skeleton className="h-4 w-full max-w-sm" />
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
