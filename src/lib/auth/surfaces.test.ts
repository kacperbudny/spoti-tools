import { describe, expect, test } from "bun:test";
import { redirectFor, SURFACE_PATH } from "./surfaces";

describe("redirectFor", () => {
  test("a Visitor who opens the Landing stays on the Landing", () => {
    expect(redirectFor("visitor", "landing")).toBeNull();
  });

  test("a User who opens the Landing is sent to the Dashboard", () => {
    expect(redirectFor("user", "landing")).toBe("dashboard");
  });

  test("a Visitor who opens the Dashboard is sent to the Landing", () => {
    expect(redirectFor("visitor", "dashboard")).toBe("landing");
  });

  test("a User who opens the Dashboard stays on the Dashboard", () => {
    expect(redirectFor("user", "dashboard")).toBeNull();
  });
});

describe("SURFACE_PATH", () => {
  test("the Landing is at / and the Dashboard is at /app", () => {
    expect(SURFACE_PATH.landing).toBe("/");
    expect(SURFACE_PATH.dashboard).toBe("/app");
  });
});
