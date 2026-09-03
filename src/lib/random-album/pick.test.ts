import { describe, expect, test } from "bun:test";
import type { Album } from "@/lib/random-album/album";
import { DEFAULT_ALBUM_TYPE_SELECTION } from "@/lib/random-album/album-types";
import { pick } from "@/lib/random-album/pick";

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

describe("pick", () => {
  test("returns the only matching album when the filtered set has one", () => {
    expect(
      pick(library, { album: false, single: false, compilation: true }),
    ).toEqual(library[2]);
  });

  test("returns an album from the filtered set when several match", () => {
    const result = pick(library, DEFAULT_ALBUM_TYPE_SELECTION);
    expect(result).not.toBeNull();
    expect(["1", "2"]).toContain(result?.id);
  });

  test("returns null when no albums match the selected types", () => {
    expect(
      pick(library, { album: false, single: false, compilation: false }),
    ).toBeNull();
  });

  test("returns null for an empty library", () => {
    expect(pick([], DEFAULT_ALBUM_TYPE_SELECTION)).toBeNull();
  });
});
