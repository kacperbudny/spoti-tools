import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import Loading from "@/app/app/(dashboard)/loading";

afterEach(cleanup);

describe("Dashboard loading", () => {
  test("heading placeholders are phrasing content", () => {
    const { container } = render(<Loading />);
    const headings = [...container.querySelectorAll("h1, h2")];

    expect(headings.length).toBeGreaterThan(0);
    for (const heading of headings) {
      expect(heading.querySelector("div")).toBeNull();
      expect(heading.querySelector("[data-slot=skeleton]")?.tagName).toBe(
        "SPAN",
      );
    }
  });
});
