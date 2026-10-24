import { describe, expect, test } from "bun:test";
import { HTTPError } from "ky";
import { spotifyFailureFields, spotifyPath } from "@/lib/spotify/log";

describe("spotify logs", () => {
  test("keeps the path and drops a token query", () => {
    expect(
      spotifyPath(
        "https://api.spotify.com/v1/artists/ada/albums?offset=20&limit=10&access_token=super-secret-token",
      ),
    ).toBe("/v1/artists/ada/albums?offset=20&limit=10");
  });

  test("records status and retry-after without the access token", () => {
    const response = new Response(null, {
      status: 429,
      headers: { "retry-after": "30" },
    });
    const error = new HTTPError(
      response,
      new Request("https://api.spotify.com/v1/tracks/track-1"),
      {} as never,
    );
    const fields = spotifyFailureFields(
      error,
      "GET",
      "https://api.spotify.com/v1/tracks/track-1",
      1200,
    );

    expect(fields).toEqual({
      event: "failed",
      method: "GET",
      path: "/v1/tracks/track-1",
      status: 429,
      retryAfter: "30",
      elapsedMs: 1200,
    });
    expect(JSON.stringify(fields)).not.toContain("super-secret-token");
  });
});
