import { HTTPError } from "ky";
import type * as z from "zod";
import type { Artist } from "@/lib/artist-playlist/artist";
import { SessionDeadError } from "@/lib/auth/errors";
import { http } from "@/lib/http/ky";
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
  spotifyPlaylistSnapshotSchema,
  spotifySavedAlbumsPageSchema,
  spotifyTracksSchema,
} from "@/lib/spotify/types";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const ARTIST_SEARCH_LIMIT = 10;

export class SpotifyClientError extends Error {
  constructor() {
    super("Spotify client error");
    this.name = "SpotifyClientError";
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

  async getTracks(ids: string[]): Promise<Array<SpotifyFullTrack | null>> {
    if (ids.length === 0) {
      return [];
    }

    const url = new URL(`${SPOTIFY_API_BASE}/tracks`);
    url.searchParams.set("ids", ids.join(","));

    const body = await this.callSpotify(url);
    return this.parseSpotify(spotifyTracksSchema, body).tracks;
  }

  async createPrivatePlaylist(name: string): Promise<SpotifyCreatedPlaylist> {
    const url = new URL(`${SPOTIFY_API_BASE}/me/playlists`);
    const body = await this.callSpotify(url, {
      method: "POST",
      json: { name, public: false },
    });
    return this.parseSpotify(spotifyCreatedPlaylistSchema, body);
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
    init?: { method: "POST" | "PUT"; json: object },
  ): Promise<unknown> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      if (!init) {
        return await http.get(url, { headers, timeout: 20_000 }).json();
      }

      const send = init.method === "POST" ? http.post : http.put;
      return await send(url, {
        headers,
        json: init.json,
        timeout: 20_000,
      }).json();
    } catch (error) {
      if (error instanceof HTTPError) {
        const status = error.response.status;

        if (status === 401 || status === 403) {
          throw new SessionDeadError();
        }
      }

      throw this.handleError(error);
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
    console.error(error instanceof Error ? error.message : String(error));
    return new SpotifyClientError();
  }
}
