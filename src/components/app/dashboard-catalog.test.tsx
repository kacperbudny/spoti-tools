import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { DashboardCatalog } from "@/components/app/dashboard-catalog";

afterEach(cleanup);

describe("DashboardCatalog", () => {
  test("names Random album and opens that Tool", () => {
    render(<DashboardCatalog />);

    expect(
      screen.getByRole("link", { name: /Random album/ }).getAttribute("href"),
    ).toBe("/app/random-album");
  });

  test("Random album card uses the catalog one-liner", () => {
    render(<DashboardCatalog />);

    expect(
      screen.getByRole("link", {
        name: /A random album from your saved library\./,
      }),
    ).toBeTruthy();
  });

  test("labels the catalog Tools", () => {
    render(<DashboardCatalog />);

    expect(screen.getByRole("heading", { name: "Tools" })).toBeTruthy();
  });

  test("names Artist playlist and opens that Tool", () => {
    render(<DashboardCatalog />);

    expect(
      screen
        .getByRole("link", { name: /Artist playlist/ })
        .getAttribute("href"),
    ).toBe("/app/artist-playlist");
  });

  test("Artist playlist card uses the catalog one-liner", () => {
    render(<DashboardCatalog />);

    expect(
      screen.getByRole("link", {
        name: /Save an artist's discography to a private playlist\./,
      }),
    ).toBeTruthy();
  });
});
