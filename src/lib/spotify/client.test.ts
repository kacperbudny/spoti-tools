import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { http } from "@/lib/http/ky";
import { SpotifyClient } from "@/lib/spotify/client";

afterEach(() => {
  mock.restore();
});

describe("SpotifyClient", () => {
  test("loads each recording from its own track", async () => {
    const paths: string[] = [];
    spyOn(http, "get").mockImplementation((input) => {
      const url =
        input instanceof URL
          ? input
          : new URL(input instanceof Request ? input.url : String(input));
      paths.push(`${url.pathname}${url.search}`);
      const id = url.pathname.split("/").pop();

      return {
        json: async () => ({
          id,
          external_ids: { isrc: `ISRC-${id}` },
        }),
      } as unknown as ReturnType<typeof http.get>;
    });

    const tracks = await new SpotifyClient("token").getTracks([
      "track-1",
      "track-2",
    ]);

    expect(paths).toEqual(["/v1/tracks/track-1", "/v1/tracks/track-2"]);
    expect(tracks).toEqual([
      { id: "track-1", external_ids: { isrc: "ISRC-track-1" } },
      { id: "track-2", external_ids: { isrc: "ISRC-track-2" } },
    ]);
  });

  test("creates a private playlist with a blank description", async () => {
    let body: unknown;
    spyOn(http, "post").mockImplementation((_input, options) => {
      body = options?.json;

      return {
        json: async () => ({
          id: "playlist-1",
          external_urls: {
            spotify: "https://open.spotify.com/playlist/playlist-1",
          },
        }),
      } as unknown as ReturnType<typeof http.post>;
    });

    await new SpotifyClient("token").createPrivatePlaylist("Ada discography");

    expect(body).toEqual({
      name: "Ada discography",
      public: false,
      description: " ",
    });
  });

  test("keeps the playlist private and replaces a missing description", async () => {
    let body: unknown;
    let path = "";
    spyOn(http, "put").mockImplementation((input, options) => {
      const url =
        input instanceof URL
          ? input
          : new URL(input instanceof Request ? input.url : String(input));
      path = url.pathname;
      body = options?.json;

      return {
        text: async () => "",
      } as unknown as ReturnType<typeof http.put>;
    });

    await new SpotifyClient("token").setPrivatePlaylistDetails("playlist-1");

    expect(path).toBe("/v1/playlists/playlist-1");
    expect(body).toEqual({ public: false, description: " " });
  });

  test("reads the playlist cover from the first image", async () => {
    spyOn(http, "get").mockImplementation(
      () =>
        ({
          json: async () => [
            {
              url: "https://mosaic.scdn.co/640/cover",
              height: 640,
              width: 640,
            },
            {
              url: "https://mosaic.scdn.co/300/cover",
              height: 300,
              width: 300,
            },
          ],
        }) as unknown as ReturnType<typeof http.get>,
    );

    const coverUrl = await new SpotifyClient("token").getPlaylistCoverUrl(
      "playlist-1",
    );

    expect(coverUrl).toBe("https://mosaic.scdn.co/640/cover");
  });
});
