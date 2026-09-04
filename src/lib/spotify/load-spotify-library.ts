import type { Album } from "@/lib/random-album/album";
import type { SpotifyClient } from "@/lib/spotify/client";
import { mapSavedAlbum } from "@/lib/spotify/map-album";

const PAGE_SIZE = 50;

export type LoadSpotifyLibraryProgress = (
  loaded: number,
  total: number,
) => void;

export async function loadSpotifyLibrary(
  client: SpotifyClient,
  onProgress: LoadSpotifyLibraryProgress,
): Promise<Album[]> {
  const library: Album[] = [];
  let offset = 0;

  while (true) {
    const page = await client.getSavedAlbumsPage(offset, PAGE_SIZE);

    for (const item of page.items) {
      library.push(mapSavedAlbum(item));
    }

    onProgress(library.length, page.total);

    if (page.next === null) {
      break;
    }

    offset += page.items.length;
  }

  return library;
}
