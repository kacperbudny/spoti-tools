import { describe, expect, test } from "bun:test";
import { planArtistPlaylist } from "@/lib/artist-playlist/plan-artist-playlist";
import type { Release, Track } from "@/lib/artist-playlist/release";
import {
  DEFAULT_RELEASE_GROUP_SELECTION,
  type ReleaseGroupSelection,
} from "@/lib/artist-playlist/release-groups";

const ARTIST = "ada";

function track(id: string, overrides: Partial<Track> = {}): Track {
  return {
    id,
    artistIds: [ARTIST],
    discNumber: 1,
    trackNumber: 1,
    ...overrides,
  };
}

function release(
  overrides: Partial<Release> & Pick<Release, "id" | "tracks">,
): Release {
  return {
    name: overrides.id,
    group: "album",
    releaseDate: "2000-01-01",
    releaseDatePrecision: "day",
    ...overrides,
  };
}

function plan(
  overrides: Partial<Parameters<typeof planArtistPlaylist>[0]> = {},
) {
  return planArtistPlaylist({
    artistId: ARTIST,
    artistName: "Ada",
    releases: [],
    selection: DEFAULT_RELEASE_GROUP_SELECTION,
    ...overrides,
  });
}

describe("planArtistPlaylist", () => {
  test("nothing to save when the discography is empty", () => {
    expect(plan()).toEqual({ kind: "nothing" });
  });

  test("nothing to save when no track credits the artist, even if a playlist is remembered", () => {
    expect(
      plan({
        rememberedPlaylistId: "playlist-1",
        releases: [
          release({
            id: "comp",
            group: "compilation",
            tracks: [track("other", { artistIds: ["someone-else"] })],
          }),
        ],
      }),
    ).toEqual({ kind: "nothing" });
  });

  test("nothing to save when every box is off", () => {
    const selection: ReleaseGroupSelection = {
      album: false,
      single: false,
      compilation: false,
      appearances: false,
    };

    expect(
      plan({
        selection,
        releases: [release({ id: "album", tracks: [track("t")] })],
      }),
    ).toEqual({ kind: "nothing" });
  });

  test("keeps only tracks that credit the artist on a compilation, a split, an appearance, and a guest feature", () => {
    expect(
      plan({
        releases: [
          release({
            id: "comp",
            group: "compilation",
            releaseDate: "1990",
            releaseDatePrecision: "year",
            tracks: [
              track("comp-ada"),
              track("comp-other", {
                artistIds: ["someone-else"],
                trackNumber: 2,
              }),
            ],
          }),
          release({
            id: "split",
            releaseDate: "1991-01-01",
            tracks: [
              track("split-ada"),
              track("split-other", {
                artistIds: ["someone-else"],
                trackNumber: 2,
              }),
            ],
          }),
          release({
            id: "appears",
            group: "appearances",
            releaseDate: "1992-01-01",
            tracks: [
              track("app-other", { artistIds: ["someone-else"] }),
              track("app-ada", { trackNumber: 2 }),
            ],
          }),
          release({
            id: "own",
            releaseDate: "1993-01-01",
            tracks: [track("feature", { artistIds: [ARTIST, "guest"] })],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["comp-ada", "split-ada", "app-ada", "feature"],
      truncated: false,
      droppedTrackIds: ["comp-other", "split-other", "app-other"],
    });
  });

  test("keeps one copy of a recording and keeps a remix and a live version", () => {
    expect(
      plan({
        releases: [
          release({
            id: "single",
            group: "single",
            releaseDate: "1998-05-01",
            tracks: [track("single-version", { recordingId: "SONG" })],
          }),
          release({
            id: "album",
            releaseDate: "2001-05-01",
            tracks: [
              track("album-version", { recordingId: "SONG" }),
              track("remix", { recordingId: "SONG-RMX", trackNumber: 2 }),
              track("live", { recordingId: "SONG-LIVE", trackNumber: 3 }),
            ],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["single-version", "remix", "live"],
      truncated: false,
      droppedTrackIds: ["album-version"],
    });
  });

  test("keeps one copy when two tracks share a Spotify id and have no recording id", () => {
    expect(
      plan({
        releases: [
          release({
            id: "single",
            group: "single",
            releaseDate: "1998-01-01",
            tracks: [track("same-id")],
          }),
          release({
            id: "album",
            releaseDate: "2001-01-01",
            tracks: [track("same-id")],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["same-id"],
      truncated: false,
      droppedTrackIds: ["same-id"],
    });
  });

  test("keeps each track that has no recording id", () => {
    expect(
      plan({
        releases: [
          release({
            id: "album",
            tracks: [
              track("with-id", { recordingId: "SONG" }),
              track("no-id-a", { trackNumber: 2 }),
              track("no-id-b", { trackNumber: 3 }),
            ],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["with-id", "no-id-a", "no-id-b"],
      truncated: false,
      droppedTrackIds: [],
    });
  });

  test("orders a year-only date at the start of that year and a month-only date at the start of that month", () => {
    expect(
      plan({
        releases: [
          release({
            id: "june-mid",
            releaseDate: "2000-06-15",
            tracks: [track("june-mid")],
          }),
          release({
            id: "new-years",
            releaseDate: "2000-01-01",
            tracks: [
              track("ny-1"),
              track("ny-2", { trackNumber: 2 }),
              track("ny-3", { trackNumber: 3 }),
              track("ny-4", { trackNumber: 4 }),
            ],
          }),
          release({
            id: "year",
            releaseDate: "1999",
            releaseDatePrecision: "year",
            tracks: [track("year-track")],
          }),
          release({
            id: "june",
            releaseDate: "2000-06",
            releaseDatePrecision: "month",
            tracks: [track("june")],
          }),
          release({
            id: "ep",
            group: "single",
            releaseDate: "2000-01-01",
            tracks: [track("ep")],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: [
        "year-track",
        "ep",
        "ny-1",
        "ny-2",
        "ny-3",
        "ny-4",
        "june",
        "june-mid",
      ],
      truncated: false,
      droppedTrackIds: [],
    });
  });

  test("a longer year-only release follows an explicit new-year's day release", () => {
    expect(
      plan({
        releases: [
          release({
            id: "year",
            releaseDate: "1999",
            releaseDatePrecision: "year",
            tracks: [track("y1"), track("y2", { trackNumber: 2 })],
          }),
          release({
            id: "day",
            releaseDate: "1999-01-01",
            tracks: [track("day")],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["day", "y1", "y2"],
      truncated: false,
      droppedTrackIds: [],
    });
  });

  test("same day, the shorter release comes first, counting every track on it", () => {
    expect(
      plan({
        releases: [
          release({
            id: "long",
            tracks: [
              track("kept"),
              track("other-a", { artistIds: ["x"], trackNumber: 2 }),
              track("other-b", { artistIds: ["y"], trackNumber: 3 }),
            ],
          }),
          release({
            id: "short",
            group: "single",
            tracks: [track("short-1"), track("short-2", { trackNumber: 2 })],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["short-1", "short-2", "kept"],
      truncated: false,
      droppedTrackIds: ["other-a", "other-b"],
    });
  });

  test("same day and length, release id keeps the order stable", () => {
    expect(
      plan({
        releases: [
          release({ id: "b", tracks: [track("from-b")] }),
          release({ id: "a", tracks: [track("from-a")] }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["from-a", "from-b"],
      truncated: false,
      droppedTrackIds: [],
    });
  });

  test("inside a release, disc number then track number", () => {
    expect(
      plan({
        releases: [
          release({
            id: "discs",
            tracks: [
              track("d2t1", { discNumber: 2, trackNumber: 1 }),
              track("d1t2", { discNumber: 1, trackNumber: 2 }),
              track("d1t1", { discNumber: 1, trackNumber: 1 }),
            ],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["d1t1", "d1t2", "d2t1"],
      truncated: false,
      droppedTrackIds: [],
    });
  });

  test("a live album and a remix album are included when album is on", () => {
    expect(
      plan({
        selection: {
          album: true,
          single: false,
          compilation: false,
          appearances: false,
        },
        releases: [
          release({
            id: "live",
            name: "Live at the Hall",
            tracks: [track("live-1")],
          }),
          release({
            id: "remixes",
            name: "Remixes",
            tracks: [track("remix-1", { recordingId: "RMX" })],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["live-1", "remix-1"],
      truncated: false,
      droppedTrackIds: [],
    });
  });

  test("appearances off leaves those releases out", () => {
    expect(
      plan({
        selection: {
          album: true,
          single: true,
          compilation: true,
          appearances: false,
        },
        releases: [
          release({ id: "own", tracks: [track("own")] }),
          release({
            id: "appears",
            group: "appearances",
            tracks: [track("guest-spot")],
          }),
        ],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: ["own"],
      truncated: false,
      droppedTrackIds: [],
    });
  });

  test("saves the oldest 10,000 tracks and drops the rest", () => {
    const tracks = Array.from({ length: 10_001 }, (_, index) =>
      track(`t${index}`, { trackNumber: index + 1 }),
    );

    expect(
      plan({
        releases: [release({ id: "huge", tracks })],
      }),
    ).toEqual({
      kind: "create",
      title: "Ada discography",
      trackIds: tracks.slice(0, 10_000).map((item) => item.id),
      truncated: true,
      droppedTrackIds: ["t10000"],
    });
  });

  test("a remembered playlist rewrites instead of creating, with the same track list", () => {
    expect(
      plan({
        rememberedPlaylistId: "playlist-1",
        releases: [release({ id: "album", tracks: [track("t")] })],
      }),
    ).toEqual({
      kind: "rewrite",
      playlistId: "playlist-1",
      title: "Ada discography",
      trackIds: ["t"],
      truncated: false,
      droppedTrackIds: [],
    });
  });
});
