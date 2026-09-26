import { describe, expect, test } from "bun:test";
import {
  DEFAULT_RELEASE_GROUP_SELECTION,
  hasAnyReleaseGroupSelected,
  toggleReleaseGroup,
} from "@/lib/artist-playlist/release-groups";

describe("toggleReleaseGroup", () => {
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

describe("hasAnyReleaseGroupSelected", () => {
  test("is true when at least one group is on", () => {
    expect(
      hasAnyReleaseGroupSelected({
        album: false,
        single: false,
        compilation: false,
        appearances: true,
      }),
    ).toBe(true);
  });

  test("is false when every group is off", () => {
    expect(
      hasAnyReleaseGroupSelected({
        album: false,
        single: false,
        compilation: false,
        appearances: false,
      }),
    ).toBe(false);
  });
});
