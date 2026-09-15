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

const { Dashboard } = await import("@/components/app/dashboard");

afterEach(cleanup);

describe("Dashboard", () => {
  test("greets the User by display name", () => {
    render(<Dashboard displayName="Ada" />);

    expect(screen.getByRole("heading", { name: /Hello, Ada\s*!/ })).toBeTruthy();
  });
});
