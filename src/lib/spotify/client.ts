import { HTTPError } from "ky";
import { SessionDeadError } from "@/lib/auth/errors";
import { http } from "@/lib/http/ky";
import {
  type SpotifySavedAlbumsPage,
  spotifySavedAlbumsPageSchema,
} from "@/lib/spotify/types";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

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

    try {
      const body: unknown = await http
        .get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })
        .json();

      return spotifySavedAlbumsPageSchema.parse(body);
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
}
