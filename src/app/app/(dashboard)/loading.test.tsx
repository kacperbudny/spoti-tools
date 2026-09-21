import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import Loading from "@/app/app/(dashboard)/loading";

afterEach(cleanup);

describe("Dashboard loading", () => {
  test("does not render headings", () => {
    render(<Loading />);

    expect(screen.queryByRole("heading")).toBeNull();
  });
});
