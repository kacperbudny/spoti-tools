import { Skeleton } from "@/components/ui/skeleton";
import { ALBUM_TYPES } from "@/lib/random-album/album-types";

export function RandomAlbumStageSkeleton() {
  return (
    <section className="flex w-full max-w-lg flex-1 flex-col gap-8 pb-[env(safe-area-inset-bottom)]">
      <header className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid w-full grid-cols-3 gap-2 md:flex md:w-auto">
          {ALBUM_TYPES.map((type) => (
            <Skeleton key={type} className="h-12 md:w-28" />
          ))}
        </div>
      </header>
      <div className="mt-auto">
        <Skeleton className="h-12 w-full" />
      </div>
    </section>
  );
}
