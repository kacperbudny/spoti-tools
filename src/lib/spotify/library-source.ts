import type { LibraryPageSource } from "@/lib/random-album/library-source";
import { SpotifyClient } from "@/lib/spotify/client";
import { mapSavedAlbum } from "@/lib/spotify/map-album";

const PAGE_SIZE = 50;

export function createSpotifyLibrarySource(
  accessToken: string,
): LibraryPageSource {
  const client = new SpotifyClient(accessToken);

  return async (offset) => {
    const result = await client.getSavedAlbumsPage(offset, PAGE_SIZE);

    if (!result.ok) {
      return {
        ok: false,
        reason:
          result.error.kind === "session-dead"
            ? "session-dead"
            : "source-unavailable",
      };
    }

    const { page } = result;

    return {
      ok: true,
      page: {
        albums: page.items.map(mapSavedAlbum),
        total: page.total,
        hasMore: page.next !== null,
      },
    };
  };
}
