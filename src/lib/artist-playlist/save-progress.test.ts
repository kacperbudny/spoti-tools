import { describe, expect, test } from "bun:test";
import { saveProgress } from "@/lib/artist-playlist/save-progress";

describe("saveProgress", () => {
  test("names the discography read and the playlist write", () => {
    expect(saveProgress("releases", 0, 4).label).toBe(
      "Retrieving the artist's songs",
    );
    expect(saveProgress("playlist", 0, 2).label).toBe("Saving the playlist");
    expect(saveProgress("tracks", 23, 153)).toMatchObject({
      loaded: 23,
      total: 153,
    });
    expect(saveProgress("releases", 1, 4)).toMatchObject({
      loaded: null,
      total: null,
    });
    expect(saveProgress("playlist", 1, 2)).toMatchObject({
      loaded: null,
      total: null,
    });
  });

  test("fills each stage in order without moving backward", () => {
    expect(saveProgress("releases", 0, 4).percent).toBe(0);
    expect(saveProgress("releases", 4, 4).percent).toBe(10);
    expect(saveProgress("tracks", 0, 10).percent).toBe(10);
    expect(saveProgress("tracks", 5, 10).percent).toBe(50);
    expect(saveProgress("tracks", 10, 10).percent).toBe(90);
    expect(saveProgress("playlist", 0, 2).percent).toBe(90);
    expect(saveProgress("playlist", 1, 2).percent).toBe(95);
    expect(saveProgress("playlist", 2, 2).percent).toBe(100);
  });
});
