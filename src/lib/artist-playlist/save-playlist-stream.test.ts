import { describe, expect, test } from "bun:test";
import {
  encodeSavePlaylistStreamEvent,
  parseSavePlaylistStreamLine,
} from "@/lib/artist-playlist/save-playlist-stream";

describe("save playlist stream", () => {
  test("round-trips progress and a created playlist", () => {
    const progress = encodeSavePlaylistStreamEvent({
      type: "progress",
      label: "Retrieving the artist's songs",
      percent: 30,
    });
    const created = encodeSavePlaylistStreamEvent({
      type: "result",
      result: {
        kind: "created",
        url: "https://open.spotify.com/playlist/abc",
        title: "Ada discography",
        trackCount: 12,
        coverUrl: "https://mosaic.scdn.co/640/cover",
        truncated: false,
      },
    });
    const lines = new TextDecoder()
      .decode(new Uint8Array([...progress, ...created]))
      .trim()
      .split("\n");

    expect(lines.map(parseSavePlaylistStreamLine)).toEqual([
      {
        type: "progress",
        label: "Retrieving the artist's songs",
        percent: 30,
      },
      {
        type: "result",
        result: {
          kind: "created",
          url: "https://open.spotify.com/playlist/abc",
          title: "Ada discography",
          trackCount: 12,
          coverUrl: "https://mosaic.scdn.co/640/cover",
          truncated: false,
        },
      },
    ]);
  });
});
