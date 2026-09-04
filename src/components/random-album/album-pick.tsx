import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Album } from "@/lib/random-album/album";
import { ALBUM_TYPE_LABELS } from "@/lib/random-album/album-types";
import { cn } from "@/lib/utils";

type AlbumPickProps = {
  album: Album;
};

export function AlbumPick({ album }: AlbumPickProps) {
  const metadata = [album.year, ALBUM_TYPE_LABELS[album.type]]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="w-full max-w-xs">
      {album.coverUrl ? (
        // biome-ignore lint/performance/noImgElement: Spotify cover URLs are external and dynamic.
        <img
          src={album.coverUrl}
          alt={`${album.title} cover art`}
          className="aspect-square w-full object-cover"
        />
      ) : null}
      <CardHeader>
        <CardTitle className="text-xl">{album.title}</CardTitle>
        <CardDescription>{album.artists.join(", ")}</CardDescription>
        {metadata ? <CardDescription>{metadata}</CardDescription> : null}
      </CardHeader>
      <CardFooter>
        <a
          href={album.listenUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants(), "w-full")}
        >
          Listen on Spotify
        </a>
      </CardFooter>
    </Card>
  );
}
