import type {
  FetchLibraryPageResult,
  LibraryPageSource,
  SpotifySavedAlbumsPage,
} from "@/lib/random-album/library-source";

const SPOTIFY_PAGE_SIZE = 50;

export function createSpotifyPageSource(
  accessToken: string,
): LibraryPageSource {
  return async (offset): Promise<FetchLibraryPageResult> => {
    const url = new URL("https://api.spotify.com/v1/me/albums");
    url.searchParams.set("limit", String(SPOTIFY_PAGE_SIZE));
    url.searchParams.set("offset", String(offset));

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      return { ok: false, reason: "session-dead" };
    }

    if (!response.ok) {
      return { ok: false, reason: "spotify-failed" };
    }

    const page = (await response.json()) as SpotifySavedAlbumsPage;

    return { ok: true, page };
  };
}
