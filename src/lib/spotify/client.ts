import { HTTPError } from "ky";
import type { Artist } from "@/lib/artist-playlist/artist";
import { SessionDeadError } from "@/lib/auth/errors";
import { http } from "@/lib/http/ky";
import { mapSpotifyArtistSearch } from "@/lib/spotify/map-artist";
import {
  type SpotifySavedAlbumsPage,
  spotifyArtistSearchSchema,
  spotifySavedAlbumsPageSchema,
} from "@/lib/spotify/types";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const ARTIST_SEARCH_LIMIT = 10;

export class SpotifyUnavailableError extends Error {
  constructor() {
    super("Spotify unavailable");
    this.name = "SpotifyUnavailableError";
  }
}

export class SpotifyClient {
  constructor(private readonly accessToken: string) {}

  async getSavedAlbumsPage(
    offset: number,
    limit = 50,
  ): Promise<SpotifySavedAlbumsPage> {
    const url = new URL(`${SPOTIFY_API_BASE}/me/albums`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const body = await readSpotifyJson(url, this.accessToken);
    return parseSpotify(spotifySavedAlbumsPageSchema, body);
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const url = new URL(`${SPOTIFY_API_BASE}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("type", "artist");
    url.searchParams.set("limit", String(ARTIST_SEARCH_LIMIT));

    const body = await readSpotifyJson(url, this.accessToken);
    return mapSpotifyArtistSearch(
      parseSpotify(spotifyArtistSearchSchema, body),
    );
  }
}

async function readSpotifyJson(
  url: URL,
  accessToken: string,
): Promise<unknown> {
  try {
    return await http
      .get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .json();
  } catch (error) {
    if (error instanceof HTTPError) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        throw new SessionDeadError();
      }
    }

    throw new SpotifyUnavailableError();
  }
}

function parseSpotify<T>(
  schema: { parse: (data: unknown) => T },
  body: unknown,
): T {
  try {
    return schema.parse(body);
  } catch {
    throw new SpotifyUnavailableError();
  }
}
