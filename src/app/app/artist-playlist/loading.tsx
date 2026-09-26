import { Skeleton } from "@/components/ui/skeleton";
import { RELEASE_GROUPS } from "@/lib/artist-playlist/release-groups";

export default function Loading() {
  return (
    <section className="flex w-full max-w-lg flex-1 flex-col gap-8 pb-[env(safe-area-inset-bottom)]">
      <header className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto">
          {RELEASE_GROUPS.map((group) => (
            <Skeleton key={group} className="h-12 md:w-28" />
          ))}
        </div>
      </header>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="mt-auto">
        <Skeleton className="h-12 w-full" />
      </div>
    </section>
  );
}
