import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { loadArtistDiscography } from "@/lib/artist-playlist/load-discography";
import { DEFAULT_RELEASE_GROUP_SELECTION } from "@/lib/artist-playlist/release-groups";
import { SpotifyClient } from "@/lib/spotify/client";
import type { SpotifyAlbumGroup } from "@/lib/spotify/types";

afterEach(() => {
  mock.restore();
});

describe("loadArtistDiscography", () => {
  test("asks for each release group ten albums at a time", async () => {
    const calls: Array<{
      groups: readonly SpotifyAlbumGroup[];
      limit: number | undefined;
    }> = [];
    spyOn(SpotifyClient.prototype, "getArtistAlbumsPage").mockImplementation(
      async (_artistId, includeGroups, _offset, limit) => {
        calls.push({ groups: includeGroups, limit });
        return { items: [], next: null };
      },
    );

    await loadArtistDiscography(
      new SpotifyClient("token"),
      "1294QqYm1VuxxjRiL9M0h9",
      DEFAULT_RELEASE_GROUP_SELECTION,
    );

    expect(calls).toEqual([
      { groups: ["album"], limit: 10 },
      { groups: ["single"], limit: 10 },
      { groups: ["compilation"], limit: 10 },
      { groups: ["appears_on"], limit: 10 },
    ]);
  });

  test("labels a release from the group that was requested", async () => {
    spyOn(SpotifyClient.prototype, "getArtistAlbumsPage").mockImplementation(
      async (_artistId, includeGroups) => {
        if (includeGroups[0] !== "appears_on") {
          return { items: [], next: null };
        }

        return {
          items: [
            {
              id: "appear-1",
              name: "Someone Else",
              release_date: "2019-05-01",
              release_date_precision: "day",
            },
          ],
          next: null,
        };
      },
    );
    spyOn(SpotifyClient.prototype, "getAlbumTracksPage").mockImplementation(
      async () => ({ items: [], next: null }),
    );

    const releases = await loadArtistDiscography(
      new SpotifyClient("token"),
      "1294QqYm1VuxxjRiL9M0h9",
      DEFAULT_RELEASE_GROUP_SELECTION,
    );

    expect(releases).toEqual([
      expect.objectContaining({ id: "appear-1", group: "appearances" }),
    ]);
  });
});
