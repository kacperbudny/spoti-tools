import { describe, expect, test } from "bun:test";
import { SPOTIFY_SIGN_IN_SCOPES } from "./spotify-scopes";

describe("SPOTIFY_SIGN_IN_SCOPES", () => {
  test("first Sign-in asks for identity, library read, and playlist write", () => {
    expect([...SPOTIFY_SIGN_IN_SCOPES]).toEqual([
      "user-read-private",
      "user-read-email",
      "user-library-read",
      "playlist-modify-public",
      "playlist-modify-private",
    ]);
  });
});
