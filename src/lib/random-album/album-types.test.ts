import { describe, expect, test } from "bun:test";
import {
  DEFAULT_ALBUM_TYPE_SELECTION,
  hasSelectedAlbumType,
  toggleAlbumType,
} from "@/lib/random-album/album-types";

describe("toggleAlbumType", () => {
  test("toggles a type on or off", () => {
    expect(
      toggleAlbumType(DEFAULT_ALBUM_TYPE_SELECTION, "compilation"),
    ).toEqual({
      album: true,
      single: true,
      compilation: true,
    });
  });

  test("allows all types to be off", () => {
    const onlyAlbum = { album: true, single: false, compilation: false };

    expect(toggleAlbumType(onlyAlbum, "album")).toEqual({
      album: false,
      single: false,
      compilation: false,
    });
  });
});

describe("hasSelectedAlbumType", () => {
  test("is true when at least one type is selected", () => {
    expect(hasSelectedAlbumType(DEFAULT_ALBUM_TYPE_SELECTION)).toBe(true);
  });

  test("is false when no types are selected", () => {
    expect(
      hasSelectedAlbumType({
        album: false,
        single: false,
        compilation: false,
      }),
    ).toBe(false);
  });
});
