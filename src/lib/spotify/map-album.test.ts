import { describe, expect, test } from "bun:test";
import type { Album } from "@/lib/random-album/album";
import { mapSavedAlbum } from "@/lib/spotify/map-album";
import type { SpotifySavedAlbumItem } from "@/lib/spotify/types";

function savedAlbum(
  overrides: Partial<SpotifySavedAlbumItem["album"]> = {},
): SpotifySavedAlbumItem {
  return {
    album: {
      id: "abc",
      name: "Test Title",
      album_type: "single",
      artists: [{ name: "One" }, { name: "Two" }],
      release_date: "2019",
      images: [{ url: "https://example.com/abc.jpg" }],
      external_urls: {
        spotify: "https://open.spotify.com/album/abc",
      },
      ...overrides,
    },
  };
}

describe("mapSavedAlbum", () => {
  test("maps a Spotify saved album to a domain Album", () => {
    expect(mapSavedAlbum(savedAlbum())).toEqual({
      id: "abc",
      title: "Test Title",
      artists: ["One", "Two"],
      year: 2019,
      type: "single",
      coverUrl: "https://example.com/abc.jpg",
      listenUrl: "https://open.spotify.com/album/abc",
    } satisfies Album);
  });

  test("returns null year when the release date has no parseable year", () => {
    expect(mapSavedAlbum(savedAlbum({ release_date: "unknown" })).year).toBe(
      null,
    );
  });

  test("omits cover URL when Spotify sends no images", () => {
    expect(mapSavedAlbum(savedAlbum({ images: [] })).coverUrl).toBeUndefined();
  });
});
