import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { SpotifyClient } from "@/lib/spotify/client";
import { loadLibrary } from "@/lib/spotify/load-library";
import type {
  SpotifySavedAlbumItem,
  SpotifySavedAlbumsPage,
  SpotifySavedAlbumsResult,
} from "@/lib/spotify/types";

function savedAlbum(id: string): SpotifySavedAlbumItem {
  return {
    album: {
      id,
      name: `Album ${id}`,
      album_type: "album",
      artists: [{ name: "Artist" }],
      release_date: "2020",
      images: [{ url: `https://example.com/${id}.jpg` }],
      external_urls: {
        spotify: `https://open.spotify.com/album/${id}`,
      },
    },
  };
}

function savedAlbumsPage(
  overrides: Partial<SpotifySavedAlbumsPage> = {},
): SpotifySavedAlbumsPage {
  return {
    items: [],
    total: 0,
    next: null,
    ...overrides,
  };
}

function fakePages(
  pages: Record<number, SpotifySavedAlbumsResult>,
): SpotifyClient["getSavedAlbumsPage"] {
  return async (offset) =>
    pages[offset] ?? { ok: false, error: { kind: "request-failed" } };
}

afterEach(() => {
  mock.restore();
});

describe("loadLibrary", () => {
  test("pages through saved albums and reports progress after each page", async () => {
    const progress: Array<[number, number]> = [];
    spyOn(SpotifyClient.prototype, "getSavedAlbumsPage").mockImplementation(
      fakePages({
        0: {
          ok: true,
          page: savedAlbumsPage({
            total: 3,
            next: "https://api.spotify.com/v1/me/albums?offset=2",
            items: [savedAlbum("1"), savedAlbum("2")],
          }),
        },
        2: {
          ok: true,
          page: savedAlbumsPage({
            total: 3,
            items: [savedAlbum("3")],
          }),
        },
      }),
    );

    const result = await loadLibrary("token", (loaded, total) => {
      progress.push([loaded, total]);
    });

    expect(result).toEqual({
      ok: true,
      library: [
        expect.objectContaining({ id: "1" }),
        expect.objectContaining({ id: "2" }),
        expect.objectContaining({ id: "3" }),
      ],
    });
    expect(progress).toEqual([
      [2, 3],
      [3, 3],
    ]);
  });

  test("returns an empty library when Spotify reports zero saved albums", async () => {
    spyOn(SpotifyClient.prototype, "getSavedAlbumsPage").mockImplementation(
      fakePages({
        0: {
          ok: true,
          page: savedAlbumsPage({ total: 0 }),
        },
      }),
    );

    const result = await loadLibrary("token", () => {});

    expect(result).toEqual({ ok: true, library: [] });
  });

  test("returns source-unavailable when a page fetch fails", async () => {
    spyOn(SpotifyClient.prototype, "getSavedAlbumsPage").mockImplementation(
      fakePages({
        0: {
          ok: true,
          page: savedAlbumsPage({
            total: 2,
            next: "https://api.spotify.com/v1/me/albums?offset=1",
            items: [savedAlbum("1")],
          }),
        },
        1: { ok: false, error: { kind: "request-failed" } },
      }),
    );

    const result = await loadLibrary("token", () => {});

    expect(result).toEqual({ ok: false, reason: "source-unavailable" });
  });

  test("returns session-dead when Spotify reports it", async () => {
    spyOn(SpotifyClient.prototype, "getSavedAlbumsPage").mockImplementation(
      fakePages({
        0: { ok: false, error: { kind: "session-dead" } },
      }),
    );

    const result = await loadLibrary("token", () => {});

    expect(result).toEqual({ ok: false, reason: "session-dead" });
  });
});
