import { describe, expect, test } from "bun:test";
import type { Artist } from "@/lib/artist-playlist/artist";
import { mapSpotifyArtistSearch } from "@/lib/spotify/map-artist";
import { spotifyArtistSearchSchema } from "@/lib/spotify/types";

describe("mapSpotifyArtistSearch", () => {
  test("maps each hit and uses Spotify's first image", () => {
    const page = spotifyArtistSearchSchema.parse({
      artists: {
        items: [
          {
            id: "ada",
            name: "Ada",
            images: [
              {
                url: "https://example.com/ada-wide.jpg",
                height: 640,
                width: 640,
              },
              {
                url: "https://example.com/ada-small.jpg",
                height: 64,
                width: 64,
              },
            ],
          },
          {
            id: "ada-2",
            name: "Ada",
            images: [],
          },
        ],
      },
    });

    expect(mapSpotifyArtistSearch(page)).toEqual([
      {
        id: "ada",
        name: "Ada",
        imageUrl: "https://example.com/ada-wide.jpg",
      },
      {
        id: "ada-2",
        name: "Ada",
      },
    ] satisfies Artist[]);
  });
});
