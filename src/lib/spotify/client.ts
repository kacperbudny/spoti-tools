import { HTTPError } from "ky";
import type * as z from "zod";
import type { Artist } from "@/lib/artist-playlist/artist";
import { SessionDeadError } from "@/lib/auth/errors";
import { http } from "@/lib/http/ky";
import {
  longRateLimitWait,
  rateLimitMessage,
  spotifyFailureFields,
  spotifyPath,
} from "@/lib/spotify/log";
import { mapSpotifyArtistSearch } from "@/lib/spotify/map-artist";
import {
  type SpotifyAlbumGroup,
  type SpotifyAlbumTracksPage,
  type SpotifyArtistAlbumsPage,
  type SpotifyCreatedPlaylist,
  type SpotifyFullTrack,
  type SpotifySavedAlbumsPage,
  spotifyAlbumTracksPageSchema,
  spotifyArtistAlbumsPageSchema,
  spotifyArtistSearchSchema,
  spotifyCreatedPlaylistSchema,
  spotifyFullTrackSchema,
  spotifyPlaylistImagesSchema,
  spotifyPlaylistSnapshotSchema,
  spotifySavedAlbumsPageSchema,
} from "@/lib/spotify/types";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const ARTIST_SEARCH_LIMIT = 10;
const TRACK_FETCH_CONCURRENCY = 4;
const BLANK_PLAYLIST_DESCRIPTION = " ";
const SLOW_SPOTIFY_MS = 5_000;
const RETRIED_STATUSES = new Set([408, 413, 429, 500, 502, 503, 504]);

export class SpotifyClientError extends Error {
  constructor(message = "Spotify client error") {
    super(message);
    this.name = "SpotifyClientError";
  }
}

export class SpotifyRateLimitError extends SpotifyClientError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(rateLimitMessage(retryAfterSeconds));
    this.name = "SpotifyRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function spotifyClientMessage(error: SpotifyClientError): string {
  return error instanceof SpotifyRateLimitError
    ? error.message
    : "Spotify failed. Try again.";
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

    const body = await this.callSpotify(url);
    return this.parseSpotify(spotifySavedAlbumsPageSchema, body);
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const url = new URL(`${SPOTIFY_API_BASE}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("type", "artist");
    url.searchParams.set("limit", String(ARTIST_SEARCH_LIMIT));

    const body = await this.callSpotify(url);
    return mapSpotifyArtistSearch(
      this.parseSpotify(spotifyArtistSearchSchema, body),
    );
  }

  async getArtistAlbumsPage(
    artistId: string,
    includeGroups: readonly SpotifyAlbumGroup[],
    offset: number,
    limit = 10,
  ): Promise<SpotifyArtistAlbumsPage> {
    const url = new URL(`${SPOTIFY_API_BASE}/artists/${artistId}/albums`);
    url.searchParams.set("include_groups", includeGroups.join(","));
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const body = await this.callSpotify(url);
    return this.parseSpotify(spotifyArtistAlbumsPageSchema, body);
  }

  async getAlbumTracksPage(
    albumId: string,
    offset: number,
    limit = 50,
  ): Promise<SpotifyAlbumTracksPage> {
    const url = new URL(`${SPOTIFY_API_BASE}/albums/${albumId}/tracks`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const body = await this.callSpotify(url);
    return this.parseSpotify(spotifyAlbumTracksPageSchema, body);
  }

  async getTracks(
    ids: string[],
    onProgress?: (loaded: number) => void,
  ): Promise<SpotifyFullTrack[]> {
    return mapPool(
      ids,
      TRACK_FETCH_CONCURRENCY,
      (id) => this.getTrack(id),
      onProgress,
    );
  }

  async getTrack(id: string): Promise<SpotifyFullTrack> {
    const url = new URL(`${SPOTIFY_API_BASE}/tracks/${id}`);
    const body = await this.callSpotify(url);
    return this.parseSpotify(spotifyFullTrackSchema, body);
  }

  async createPrivatePlaylist(name: string): Promise<SpotifyCreatedPlaylist> {
    const url = new URL(`${SPOTIFY_API_BASE}/me/playlists`);
    const body = await this.callSpotify(url, {
      method: "POST",
      json: {
        name,
        public: false,
        collaborative: false,
        description: BLANK_PLAYLIST_DESCRIPTION,
      },
    });
    return this.parseSpotify(spotifyCreatedPlaylistSchema, body);
  }

  async setPlaylistDescription(playlistId: string): Promise<void> {
    const url = new URL(`${SPOTIFY_API_BASE}/playlists/${playlistId}`);
    await this.callSpotify(url, {
      method: "PUT",
      json: { description: BLANK_PLAYLIST_DESCRIPTION },
      readBody: false,
    });
  }

  async makePlaylistPrivate(playlistId: string, name: string): Promise<void> {
    const url = new URL(`${SPOTIFY_API_BASE}/playlists/${playlistId}`);
    await this.callSpotify(url, {
      method: "PUT",
      json: { name, public: false },
      readBody: false,
    });
  }

  async getPlaylistCoverUrl(playlistId: string): Promise<string | null> {
    const url = new URL(`${SPOTIFY_API_BASE}/playlists/${playlistId}/images`);
    const body = await this.callSpotify(url);
    const images = this.parseSpotify(spotifyPlaylistImagesSchema, body);
    return images[0]?.url ?? null;
  }

  async replacePlaylistItems(
    playlistId: string,
    uris: string[],
  ): Promise<void> {
    const url = new URL(`${SPOTIFY_API_BASE}/playlists/${playlistId}/items`);
    const body = await this.callSpotify(url, {
      method: "PUT",
      json: { uris },
    });
    this.parseSpotify(spotifyPlaylistSnapshotSchema, body);
  }

  async appendPlaylistItems(playlistId: string, uris: string[]): Promise<void> {
    const url = new URL(`${SPOTIFY_API_BASE}/playlists/${playlistId}/items`);
    const body = await this.callSpotify(url, {
      method: "POST",
      json: { uris },
    });
    this.parseSpotify(spotifyPlaylistSnapshotSchema, body);
  }

  private async callSpotify(
    url: URL,
    init?: { method: "POST" | "PUT"; json: object; readBody?: boolean },
  ): Promise<unknown> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };
    const method = init?.method ?? "GET";
    const startedAt = Date.now();
    let failed = false;

    try {
      if (!init) {
        return await http
          .get(url, { headers, timeout: 20_000, hooks: spotifyHooks() })
          .json();
      }

      const send = init.method === "POST" ? http.post : http.put;
      const response = await send(url, {
        headers,
        json: init.json,
        timeout: 20_000,
        hooks: spotifyHooks(),
      });

      if (init.readBody === false) {
        await response.text();
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SpotifyRateLimitError) {
        throw error;
      }

      failed = true;
      console.error(
        "[spotify]",
        spotifyFailureFields(
          error,
          method,
          url.toString(),
          Date.now() - startedAt,
        ),
      );

      if (error instanceof HTTPError) {
        const status = error.response.status;

        if (status === 401 || status === 403) {
          throw new SessionDeadError();
        }
      }

      throw new SpotifyClientError();
    } finally {
      const elapsedMs = Date.now() - startedAt;

      if (!failed && elapsedMs >= SLOW_SPOTIFY_MS) {
        console.info("[spotify]", {
          event: "slow",
          method,
          path: spotifyPath(url.toString()),
          elapsedMs,
        });
      }
    }
  }

  private parseSpotify<T extends z.ZodType>(
    schema: T,
    body: unknown,
  ): z.infer<T> {
    try {
      return schema.parse(body);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): SpotifyClientError {
    if (!(error instanceof HTTPError)) {
      console.error(error instanceof Error ? error.message : String(error));
    }

    return new SpotifyClientError();
  }
}

function spotifyHooks() {
  return {
    afterResponse: [
      ({
        request,
        response,
        retryCount,
      }: {
        request: Request;
        response: Response;
        retryCount: number;
      }) => {
        if (!RETRIED_STATUSES.has(response.status)) {
          return;
        }

        const retryAfter = response.headers.get("retry-after");
        console.info("[spotify]", {
          event: "waiting",
          method: request.method,
          path: spotifyPath(request.url),
          status: response.status,
          retryAfter,
          retryCount,
        });

        if (response.status === 429) {
          const waitSeconds = longRateLimitWait(retryAfter);

          if (waitSeconds !== null) {
            throw new SpotifyRateLimitError(waitSeconds);
          }
        }
      },
    ],
    beforeRetry: [
      ({
        request,
        error,
        retryCount,
      }: {
        request: Request;
        error: Error;
        retryCount: number;
      }) => {
        console.info("[spotify]", {
          event: "retry",
          method: request.method,
          path: spotifyPath(request.url),
          status: error instanceof HTTPError ? error.response.status : null,
          retryCount,
          message: error.message,
        });
      },
    ],
  };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
  onProgress?: (loaded: number) => void,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  let loaded = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await mapper(items[index] as T);
        loaded += 1;
        onProgress?.(loaded);
      }
    },
  );

  await Promise.all(workers);
  return results;
}
