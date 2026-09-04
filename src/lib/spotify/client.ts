import { HTTPError } from "ky";
import { http } from "@/lib/http/ky";
import type {
  SpotifySavedAlbumsPage,
  SpotifySavedAlbumsResult,
} from "@/lib/spotify/types";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export class SpotifyClient {
  constructor(private readonly accessToken: string) {}

  async getSavedAlbumsPage(
    offset: number,
    limit = 50,
  ): Promise<SpotifySavedAlbumsResult> {
    const url = new URL(`${SPOTIFY_API_BASE}/me/albums`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    try {
      const page = await http
        .get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })
        .json<SpotifySavedAlbumsPage>();

      return { ok: true, page };
    } catch (error) {
      if (error instanceof HTTPError) {
        const status = error.response.status;

        if (status === 401 || status === 403) {
          return { ok: false, error: { kind: "session-dead" } };
        }
      }

      return { ok: false, error: { kind: "request-failed" } };
    }
  }
}
