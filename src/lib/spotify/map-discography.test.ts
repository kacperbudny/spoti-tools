import { describe, expect, test } from "bun:test";
import { mapDiscographyRelease } from "@/lib/spotify/map-discography";
import { spotifyArtistAlbumsPageSchema } from "@/lib/spotify/types";

const album = {
  id: "album-1",
  name: "Lady Jesus",
  release_date: "2021-01-08",
  release_date_precision: "day" as const,
};

describe("spotifyArtistAlbumsPageSchema", () => {
  test("parses an artist album when album_group is absent or null", () => {
    expect(
      spotifyArtistAlbumsPageSchema.parse({
        items: [album, { ...album, id: "album-2", album_group: null }],
        next: null,
      }),
    ).toEqual({
      items: [album, { ...album, id: "album-2" }],
      next: null,
    });
  });

  test("keeps the release cover when Spotify sends one", () => {
    expect(
      mapDiscographyRelease(
        { ...album, images: [{ url: "https://example.com/cover.jpg" }] },
        "album",
        [],
        new Map(),
      ).imageUrl,
    ).toBe("https://example.com/cover.jpg");
  });
});
