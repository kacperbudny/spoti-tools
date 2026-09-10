import { describe, expect, test } from "bun:test";
import type { Album } from "@/lib/random-album/album";
import { DEFAULT_ALBUM_TYPE_SELECTION } from "@/lib/random-album/album-types";
import { pickRandomAlbum } from "@/lib/random-album/pick-random-album";

const library: Album[] = [
  {
    id: "1",
    title: "Full Album",
    artists: ["Artist A"],
    year: 2020,
    type: "album",
    coverUrl: "https://example.com/a.jpg",
    listenUrl: "https://open.spotify.com/album/1",
  },
  {
    id: "2",
    title: "Single Release",
    artists: ["Artist B"],
    year: 2021,
    type: "single",
    coverUrl: "https://example.com/b.jpg",
    listenUrl: "https://open.spotify.com/album/2",
  },
  {
    id: "3",
    title: "Comp Mix",
    artists: ["Various"],
    year: 2019,
    type: "compilation",
    coverUrl: "https://example.com/c.jpg",
    listenUrl: "https://open.spotify.com/album/3",
  },
];

describe("pickRandomAlbum", () => {
  test("returns the only matching album when the filtered set has one", () => {
    expect(
      pickRandomAlbum(library, {
        album: false,
        single: false,
        compilation: true,
      }),
    ).toEqual(library[2]);
  });

  test("returns an album from the filtered set when several match", () => {
    const result = pickRandomAlbum(library, {
      album: true,
      single: true,
      compilation: false,
    });
    expect(result).not.toBeNull();
    if (!result) throw new Error("expected a pick");
    expect(["1", "2"]).toContain(result.id);
  });

  test("re-shuffle membership: drawing repeatedly from the in-memory library returns members of the matching subset", () => {
    const types = { album: true, single: true, compilation: false };
    const matchingIds = ["1", "2"];

    for (let i = 0; i < 20; i++) {
      const pick = pickRandomAlbum(library, types);
      expect(pick).not.toBeNull();
      if (!pick) throw new Error("expected a pick");
      expect(matchingIds).toContain(pick.id);
    }
  });

  test("returns null (no Pick) when no albums match the selected types", () => {
    expect(
      pickRandomAlbum(library, {
        album: false,
        single: false,
        compilation: false,
      }),
    ).toBeNull();
  });

  test("returns null (no Pick) when library has albums but none match the selected types", () => {
    const albumsAndSinglesOnly: Album[] = [library[0], library[1]];
    const pick = pickRandomAlbum(albumsAndSinglesOnly, {
      album: false,
      single: false,
      compilation: true,
    });
    expect(pick).toBeNull();
  });

  test("returns null (no Pick) for an empty library", () => {
    expect(pickRandomAlbum([], DEFAULT_ALBUM_TYPE_SELECTION)).toBeNull();
  });

  test("applies type filters only at pick time, drawing from the types passed on that draw", () => {
    const albumsOnly = {
      album: true,
      single: false,
      compilation: false,
    };
    const singlesOnly = {
      album: false,
      single: true,
      compilation: false,
    };

    const firstDraw = pickRandomAlbum(library, albumsOnly);
    expect(firstDraw?.type).toBe("album");

    // A subsequent draw (Re-shuffle) on the same library applies the types selected for that draw
    const secondDraw = pickRandomAlbum(library, singlesOnly);
    expect(secondDraw?.type).toBe("single");
  });
});
