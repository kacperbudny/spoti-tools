import { buttonVariants } from "@/components/ui/button";
import type { Album } from "@/lib/random-album/album";
import { ALBUM_TYPE_LABELS } from "@/lib/random-album/album-types";
import { cn } from "@/lib/utils";

type AlbumPickProps = {
  album: Album;
};

export function AlbumPick({ album }: AlbumPickProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border p-4">
      {album.coverUrl ? (
        // biome-ignore lint/performance/noImgElement: Spotify cover URLs are external and dynamic.
        <img
          src={album.coverUrl}
          alt=""
          className="aspect-square w-full max-w-xs rounded-xl object-cover"
        />
      ) : null}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-medium">{album.title}</h2>
        <p className="text-sm text-muted-foreground">
          {album.artists.join(", ")}
        </p>
        <p className="text-sm text-muted-foreground">
          {[album.year, ALBUM_TYPE_LABELS[album.type]]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <a
        href={album.listenUrl}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants())}
      >
        Listen on Spotify
      </a>
    </article>
  );
}
