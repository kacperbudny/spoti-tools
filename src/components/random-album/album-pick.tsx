import { useState } from "react";
import type { Album } from "@/lib/random-album/album";
import { cn } from "@/lib/utils";

type AlbumPickProps = {
  album: Album;
};

export function AlbumPick({ album }: AlbumPickProps) {
  return (
    <div className="flex flex-col gap-4">
      {album.coverUrl ? (
        <AlbumCover
          key={album.coverUrl}
          src={album.coverUrl}
          alt={`${album.title} cover art`}
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

function AlbumCover({ src, alt }: { src: string; alt: string }) {
  const [coverSettled, setCoverSettled] = useState(false);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
      {/* biome-ignore lint/performance/noImgElement: Spotify cover URLs are external and dynamic. */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setCoverSettled(true)}
        onError={() => setCoverSettled(true)}
        className={cn(
          "size-full object-cover transition-opacity duration-500",
          coverSettled ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
