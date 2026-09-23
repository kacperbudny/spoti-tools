import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Dashboard } from "@/components/app/dashboard";

afterEach(cleanup);

describe("Dashboard", () => {
  test("greets the User by display name", () => {
    render(<Dashboard displayName="Ada" />);

    expect(
      screen.getByRole("heading", { name: /Hello, Ada\s*!/ }),
    ).toBeTruthy();
  });
});
