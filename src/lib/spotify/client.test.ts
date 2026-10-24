import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { HTTPError } from "ky";
import { http } from "@/lib/http/ky";
import {
  SpotifyClient,
  SpotifyClientError,
  SpotifyRateLimitError,
} from "@/lib/spotify/client";

afterEach(() => {
  mock.restore();
});

describe("SpotifyClient", () => {
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
      collaborative: false,
      description: " ",
    });
  });

  test("writes a blank description on its own", async () => {
    let body: unknown;
    spyOn(http, "put").mockImplementation((_input, options) => {
      body = options?.json;

      return {
        text: async () => "",
      } as unknown as ReturnType<typeof http.put>;
    });

    await new SpotifyClient("token").setPlaylistDescription("playlist-1");

    expect(body).toEqual({ description: " " });
  });

  test("sets the playlist private after other edits, and repeats the name", async () => {
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

    await new SpotifyClient("token").makePlaylistPrivate(
      "playlist-1",
      "Ada discography",
    );

    expect(path).toBe("/v1/playlists/playlist-1");
    expect(body).toEqual({ name: "Ada discography", public: false });
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

  test("logs a failed request with the path and status, not the access token", async () => {
    const lines: unknown[][] = [];
    spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      lines.push(args);
    });
    const response = new Response(null, {
      status: 429,
      headers: { "retry-after": "30" },
    });
    spyOn(http, "get").mockImplementation(() => {
      throw new HTTPError(
        response,
        new Request(
          "https://api.spotify.com/v1/artists/ada/albums?offset=0&limit=10",
        ),
        {} as never,
      );
    });

    await expect(
      new SpotifyClient("super-secret-token").getArtistAlbumsPage(
        "ada",
        ["album"],
        0,
      ),
    ).rejects.toBeInstanceOf(SpotifyClientError);

    const text = JSON.stringify(lines);
    expect(text).toContain("/v1/artists/ada/albums");
    expect(text).toContain("429");
    expect(text).not.toContain("super-secret-token");
  });

  test("a day-long rate limit fails instead of waiting", async () => {
    spyOn(globalThis, "fetch").mockImplementation(
      (async () =>
        new Response(null, {
          status: 429,
          headers: { "retry-after": "82459" },
        })) as unknown as typeof fetch,
    );
    const started = Date.now();

    const error = await new SpotifyClient("token")
      .getArtistAlbumsPage("ada", ["album"], 0)
      .then(
        () => null,
        (caught: unknown) => caught,
      );

    expect(Date.now() - started).toBeLessThan(1_000);
    expect(error).toBeInstanceOf(SpotifyRateLimitError);
    expect(error instanceof Error ? error.message : "").toBe(
      "Spotify is rate limiting requests. Try again in about 23 hours.",
    );
  });
});
