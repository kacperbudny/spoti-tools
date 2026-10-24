import { describe, expect, test } from "bun:test";
import { shouldLogTick } from "@/lib/artist-playlist/save-log";

describe("shouldLogTick", () => {
  test("logs the start, the first result, each step, and the end", () => {
    expect(shouldLogTick(0, 153, 25)).toBe(true);
    expect(shouldLogTick(1, 153, 25)).toBe(true);
    expect(shouldLogTick(24, 153, 25)).toBe(false);
    expect(shouldLogTick(25, 153, 25)).toBe(true);
    expect(shouldLogTick(153, 153, 25)).toBe(true);
  });
});
