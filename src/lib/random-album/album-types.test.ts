import { describe, expect, test } from "bun:test";
import {
  DEFAULT_ALBUM_TYPE_SELECTION,
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

  test("keeps at least one type enabled", () => {
    const onlyAlbum = { album: true, single: false, compilation: false };

    expect(toggleAlbumType(onlyAlbum, "album")).toEqual(onlyAlbum);
  });
});
