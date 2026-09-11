import { expect, test } from "bun:test";
import { THEME_COLOR } from "@/lib/theme";

test("browser chrome color is the near-black canvas, not white", () => {
  // sRGB of the visual session canvas oklch(0.09 0 0)
  expect(THEME_COLOR).toBe("#020202");
});
