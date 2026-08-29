import { describe, expect, test } from "bun:test";
import { signInErrorMessage } from "./sign-in-error";

describe("signInErrorMessage", () => {
  test("no error query shows nothing", () => {
    expect(signInErrorMessage(undefined)).toBeNull();
  });

  test("cancelling Spotify Sign-in shows a short error", () => {
    expect(signInErrorMessage("access_denied")).toBe(
      "Sign-in did not complete. You can try again.",
    );
  });

  test("other Sign-in failures show the same short error", () => {
    expect(signInErrorMessage("oauth_provider_error")).toBe(
      "Sign-in did not complete. You can try again.",
    );
  });
});
