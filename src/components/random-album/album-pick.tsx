import type { Album } from "@/lib/random-album/album";

type AlbumPickProps = {
  album: Album;
};

export function AlbumPick({ album }: AlbumPickProps) {
  return (
    <div className="flex flex-col gap-4">
      {album.coverUrl ? (
        // biome-ignore lint/performance/noImgElement: Spotify cover URLs are external and dynamic.
        <img
          src={album.coverUrl}
          alt={`${album.title} cover art`}
          className="aspect-square w-full rounded-2xl object-cover"
        />
      ) : null}
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          {album.title}
        </h2>
        <p className="text-muted-foreground">{album.artists.join(", ")}</p>
      </div>
    </div>
  );
}
