import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

mock.module("next/link", () => ({
  default({ href, children, ...props }: { href: string; children: ReactNode }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

const { DashboardCatalog } = await import("@/components/app/dashboard-catalog");

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
        name: /A random Album from your saved Library\./,
      }),
    ).toBeTruthy();
  });
});
