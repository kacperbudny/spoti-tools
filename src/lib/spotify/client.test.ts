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
});
