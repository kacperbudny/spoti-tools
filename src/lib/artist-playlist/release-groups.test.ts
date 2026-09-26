import { describe, expect, test } from "bun:test";
import {
  DEFAULT_RELEASE_GROUP_SELECTION,
  hasSelectedReleaseGroup,
  RELEASE_GROUP_LABELS,
  toggleReleaseGroup,
} from "@/lib/artist-playlist/release-groups";

describe("release group selection", () => {
  test("starts with Album, Single/EP, Compilation, and Appearances on", () => {
    expect(RELEASE_GROUP_LABELS).toEqual({
      album: "Album",
      single: "Single/EP",
      compilation: "Compilation",
      appearances: "Appearances",
    });
    expect(DEFAULT_RELEASE_GROUP_SELECTION).toEqual({
      album: true,
      single: true,
      compilation: true,
      appearances: true,
    });
  });

  test("turns one group off", () => {
    expect(
      toggleReleaseGroup(DEFAULT_RELEASE_GROUP_SELECTION, "appearances"),
    ).toEqual({
      album: true,
      single: true,
      compilation: true,
      appearances: false,
    });
  });
});

describe("hasSelectedReleaseGroup", () => {
  test("is true when at least one group is on", () => {
    expect(
      hasSelectedReleaseGroup({
        album: false,
        single: false,
        compilation: false,
        appearances: true,
      }),
    ).toBe(true);
  });

  test("is false when every group is off", () => {
    expect(
      hasSelectedReleaseGroup({
        album: false,
        single: false,
        compilation: false,
        appearances: false,
      }),
    ).toBe(false);
  });
});
