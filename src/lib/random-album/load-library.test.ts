import { describe, expect, test } from "bun:test";
import type { Album } from "@/lib/random-album/album";
import type {
  FetchLibraryPageResult,
  LibraryPage,
  LibraryPageSource,
} from "@/lib/random-album/library-source";
import { loadLibrary } from "@/lib/random-album/load-library";

function album(id: string, overrides: Partial<Album> = {}): Album {
  return {
    id,
    title: `Album ${id}`,
    artists: ["Artist"],
    year: 2020,
    type: "album",
    coverUrl: `https://example.com/${id}.jpg`,
    listenUrl: `https://open.spotify.com/album/${id}`,
    ...overrides,
  };
}

function libraryPage(overrides: Partial<LibraryPage> = {}): LibraryPage {
  return {
    albums: [],
    total: 0,
    hasMore: false,
    ...overrides,
  };
}

function fakePageSource(
  pages: Record<number, FetchLibraryPageResult>,
): LibraryPageSource {
  return async (offset) =>
    pages[offset] ?? { ok: false, reason: "source-unavailable" };
}

describe("loadLibrary", () => {
  test("pages through saved albums and reports progress after each page", async () => {
    const progress: Array<[number, number]> = [];
    const pageSource = fakePageSource({
      0: {
        ok: true,
        page: libraryPage({
          total: 3,
          hasMore: true,
          albums: [album("1"), album("2")],
        }),
      },
      2: {
        ok: true,
        page: libraryPage({
          total: 3,
          albums: [album("3")],
        }),
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

  test("returns an empty library when the source reports zero saved albums", async () => {
    const pageSource = fakePageSource({
      0: {
        ok: true,
        page: libraryPage({ total: 0 }),
      },
    });

    const result = await loadLibrary(pageSource, () => {});

    expect(result).toEqual({ ok: true, library: [] });
  });

  test("returns source-unavailable when a page fetch fails", async () => {
    const pageSource = fakePageSource({
      0: {
        ok: true,
        page: libraryPage({
          total: 2,
          hasMore: true,
          albums: [album("1")],
        }),
      },
      1: { ok: false, reason: "source-unavailable" },
    });

    const result = await loadLibrary(pageSource, () => {});

    expect(result).toEqual({ ok: false, reason: "source-unavailable" });
  });

  test("returns session-dead when the page source reports it", async () => {
    const pageSource = fakePageSource({
      0: { ok: false, reason: "session-dead" },
    });

    const result = await loadLibrary(pageSource, () => {});

    expect(result).toEqual({ ok: false, reason: "session-dead" });
  });
});
