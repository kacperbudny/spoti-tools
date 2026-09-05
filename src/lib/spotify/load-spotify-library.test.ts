import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { SessionDeadError } from "@/lib/auth/errors";
import { SpotifyClient, SpotifyUnavailableError } from "@/lib/spotify/client";
import { loadSpotifyLibrary } from "@/lib/spotify/load-spotify-library";
import type {
  SpotifySavedAlbumItem,
  SpotifySavedAlbumsPage,
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
  pages: Record<number, SpotifySavedAlbumsPage | Error>,
): SpotifyClient["getSavedAlbumsPage"] {
  return async (offset) => {
    const page = pages[offset] ?? new SpotifyUnavailableError();
    if (page instanceof Error) {
      throw page;
    }
    return page;
  };
}

afterEach(() => {
  mock.restore();
});

describe("loadSpotifyLibrary", () => {
  test("pages through saved albums and reports progress after each page", async () => {
    const progress: Array<[number, number]> = [];
    spyOn(SpotifyClient.prototype, "getSavedAlbumsPage").mockImplementation(
      fakePages({
        0: savedAlbumsPage({
          total: 3,
          next: "https://api.spotify.com/v1/me/albums?offset=2",
          items: [savedAlbum("1"), savedAlbum("2")],
        }),
        2: savedAlbumsPage({
          total: 3,
          items: [savedAlbum("3")],
        }),
      }),
    );

    const library = await loadSpotifyLibrary(
      new SpotifyClient("token"),
      (loaded, total) => {
        progress.push([loaded, total]);
      },
    );

    expect(library).toEqual([
      expect.objectContaining({ id: "1" }),
      expect.objectContaining({ id: "2" }),
      expect.objectContaining({ id: "3" }),
    ]);
    expect(progress).toEqual([
      [2, 3],
      [3, 3],
    ]);
  });

  test("returns an empty library when Spotify reports zero saved albums", async () => {
    spyOn(SpotifyClient.prototype, "getSavedAlbumsPage").mockImplementation(
      fakePages({
        0: savedAlbumsPage({ total: 0 }),
      }),
    );

    const library = await loadSpotifyLibrary(
      new SpotifyClient("token"),
      () => {},
    );

    expect(library).toEqual([]);
  });

  test("throws SpotifyUnavailableError when a page fetch fails", async () => {
    spyOn(SpotifyClient.prototype, "getSavedAlbumsPage").mockImplementation(
      fakePages({
        0: savedAlbumsPage({
          total: 2,
          next: "https://api.spotify.com/v1/me/albums?offset=1",
          items: [savedAlbum("1")],
        }),
        1: new SpotifyUnavailableError(),
      }),
    );

    await expect(
      loadSpotifyLibrary(new SpotifyClient("token"), () => {}),
    ).rejects.toBeInstanceOf(SpotifyUnavailableError);
  });

  test("throws SessionDeadError when Spotify reports it", async () => {
    spyOn(SpotifyClient.prototype, "getSavedAlbumsPage").mockImplementation(
      fakePages({
        0: new SessionDeadError(),
      }),
    );

    await expect(
      loadSpotifyLibrary(new SpotifyClient("token"), () => {}),
    ).rejects.toBeInstanceOf(SessionDeadError);
  });
});
