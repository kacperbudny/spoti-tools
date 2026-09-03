import { describe, expect, test } from "bun:test";
import type { Album } from "@/lib/random-album/album";
import type { SpotifySavedAlbumsPage } from "@/lib/random-album/library-source";
import {
  type FetchLibraryPageResult,
  type LibraryPageSource,
  loadLibrary,
} from "@/lib/random-album/load-library";

function savedAlbum(
  id: string,
  overrides: Partial<SpotifySavedAlbumsPage["items"][number]["album"]> = {},
) {
  return {
    album: {
      id,
      name: `Album ${id}`,
      album_type: "album" as const,
      artists: [{ name: "Artist" }],
      release_date: "2020-05-15",
      images: [{ url: `https://example.com/${id}.jpg` }],
      external_urls: {
        spotify: `https://open.spotify.com/album/${id}`,
      },
      ...overrides,
    },
  };
}

function fakePageSource(
  pages: Record<number, FetchLibraryPageResult>,
): LibraryPageSource {
  return async (offset) =>
    pages[offset] ?? { ok: false, reason: "spotify-failed" };
}

describe("loadLibrary", () => {
  test("pages through saved albums and reports progress after each page", async () => {
    const progress: Array<[number, number]> = [];
    const pageSource = fakePageSource({
      0: {
        ok: true,
        page: {
          total: 3,
          next: "next",
          items: [savedAlbum("1"), savedAlbum("2")],
        },
      },
      2: {
        ok: true,
        page: {
          total: 3,
          next: null,
          items: [savedAlbum("3")],
        },
      },
    });

    const result = await loadLibrary(pageSource, (loaded, total) => {
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

  test("maps each item to an Album with an HTTPS listen URL", async () => {
    const pageSource = fakePageSource({
      0: {
        ok: true,
        page: {
          total: 1,
          next: null,
          items: [
            savedAlbum("abc", {
              name: "Test Title",
              album_type: "single",
              artists: [{ name: "One" }, { name: "Two" }],
              release_date: "2019",
              external_urls: {
                spotify: "https://open.spotify.com/album/abc",
              },
            }),
          ],
        },
      },
    });

    const result = await loadLibrary(pageSource, () => {});

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.library[0]).toEqual({
      id: "abc",
      title: "Test Title",
      artists: ["One", "Two"],
      year: 2019,
      type: "single",
      coverUrl: "https://example.com/abc.jpg",
      listenUrl: "https://open.spotify.com/album/abc",
    } satisfies Album);
  });

  test("returns an empty library when Spotify reports zero saved albums", async () => {
    const pageSource = fakePageSource({
      0: {
        ok: true,
        page: {
          total: 0,
          next: null,
          items: [],
        },
      },
    });

    const result = await loadLibrary(pageSource, () => {});

    expect(result).toEqual({ ok: true, library: [] });
  });

  test("returns spotify-failed when a page fetch fails", async () => {
    const pageSource = fakePageSource({
      0: {
        ok: true,
        page: {
          total: 2,
          next: "next",
          items: [savedAlbum("1")],
        },
      },
      1: { ok: false, reason: "spotify-failed" },
    });

    const result = await loadLibrary(pageSource, () => {});

    expect(result).toEqual({ ok: false, reason: "spotify-failed" });
  });

  test("returns session-dead when the page source reports it", async () => {
    const pageSource = fakePageSource({
      0: { ok: false, reason: "session-dead" },
    });

    const result = await loadLibrary(pageSource, () => {});

    expect(result).toEqual({ ok: false, reason: "session-dead" });
  });
});
