import type { Album } from "@/lib/random-album/album";
import { SpotifyClient } from "@/lib/spotify/client";
import { mapSavedAlbum } from "@/lib/spotify/map-album";

const PAGE_SIZE = 50;

export type LoadLibraryProgress = (loaded: number, total: number) => void;

export type LoadLibraryResult =
  | { ok: true; library: Album[] }
  | { ok: false; reason: "session-dead" | "source-unavailable" };

export async function loadLibrary(
  accessToken: string,
  onProgress: LoadLibraryProgress,
): Promise<LoadLibraryResult> {
  const client = new SpotifyClient(accessToken);
  const library: Album[] = [];
  let offset = 0;
  let total = 0;

  while (true) {
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
    total = page.total;

    for (const item of page.items) {
      library.push(mapSavedAlbum(item));
    }

    onProgress(library.length, total);

    if (page.next === null) {
      break;
    }

    offset += page.items.length;
  }

  return { ok: true, library };
}
