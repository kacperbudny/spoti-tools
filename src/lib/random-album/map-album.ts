import type { Album } from "@/lib/random-album/album";
import type { SpotifySavedAlbumItem } from "@/lib/random-album/library-source";

export function mapSavedAlbum(item: SpotifySavedAlbumItem): Album {
  const { album } = item;

  return {
    id: album.id,
    title: album.name,
    artists: album.artists.map((artist) => artist.name),
    year: parseReleaseYear(album.release_date),
    type: album.album_type,
    coverUrl: album.images[0]?.url ?? "",
    listenUrl: album.external_urls.spotify,
  };
}

function parseReleaseYear(releaseDate: string): number | null {
  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}
