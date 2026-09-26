import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { loadArtistDiscography } from "@/lib/artist-playlist/load-discography";
import { DEFAULT_RELEASE_GROUP_SELECTION } from "@/lib/artist-playlist/release-groups";
import { SpotifyClient } from "@/lib/spotify/client";

afterEach(() => {
  spyOn(SpotifyClient.prototype, "getArtistAlbumsPage").mockRestore();
});

describe("loadArtistDiscography", () => {
  test("asks for artist albums ten at a time", async () => {
    const limits: number[] = [];
    spyOn(SpotifyClient.prototype, "getArtistAlbumsPage").mockImplementation(
      async (_artistId, _includeGroups, _offset, limit) => {
        limits.push(limit);
        return { items: [], next: null };
      },
    );

    await loadArtistDiscography(
      new SpotifyClient("token"),
      "1294QqYm1VuxxjRiL9M0h9",
      DEFAULT_RELEASE_GROUP_SELECTION,
    );

    expect(limits).toEqual([10]);
  });
});
