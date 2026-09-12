import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen, within } from "@testing-library/react";
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

mock.module("@/lib/auth/actions", () => ({
  signOut: async () => {},
}));

mock.module("@/lib/install/install-action", () => ({
  resolveInstallAction: () => "native-prompt",
}));

let pathname = "/app";

mock.module("next/navigation", () => ({
  usePathname: () => pathname,
}));

const { AuthenticatedShell } = await import(
  "@/components/app/authenticated-shell"
);

afterEach(cleanup);

describe("AuthenticatedShell", () => {
  test("desktop nav lists Dashboard and Random album destinations", () => {
    pathname = "/app";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    const nav = screen.getByRole("navigation");
    expect(
      within(nav).getByRole("link", { name: "Dashboard" }).getAttribute("href"),
    ).toBe("/app");
    expect(
      within(nav)
        .getByRole("link", { name: "Random album" })
        .getAttribute("href"),
    ).toBe("/app/random-album");
  });

  test("desktop nav includes Sign-out", () => {
    pathname = "/app";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    expect(
      within(screen.getByRole("navigation")).getByRole("button", {
        name: "Sign-out",
      }),
    ).toBeTruthy();
  });

  test("phone Dashboard top bar shows display name and Sign-out", () => {
    pathname = "/app";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    const topBar = screen.getByRole("banner");
    expect(within(topBar).getByText("Ada")).toBeTruthy();
    expect(
      within(topBar).getByRole("button", { name: "Sign-out" }),
    ).toBeTruthy();
  });

  test("phone Tool top bar is Back to Dashboard only", () => {
    pathname = "/app/random-album";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    const topBar = screen.getByRole("banner");
    expect(
      within(topBar)
        .getByRole("link", { name: "Back to Dashboard" })
        .getAttribute("href"),
    ).toBe("/app");
    expect(
      within(topBar).queryByRole("button", { name: "Sign-out" }),
    ).toBeNull();
    expect(within(topBar).queryByText("Ada")).toBeNull();
  });

  test("desktop nav footer includes a quiet Install", () => {
    pathname = "/app";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    expect(
      within(screen.getByRole("navigation")).getByRole("button", {
        name: "Install",
      }),
    ).toBeTruthy();
  });

  test("desktop nav still includes Install on a Tool page", () => {
    pathname = "/app/random-album";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    expect(
      within(screen.getByRole("navigation")).getByRole("button", {
        name: "Install",
      }),
    ).toBeTruthy();
  });

  test("phone Tool top bar does not include Install", () => {
    pathname = "/app/random-album";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    expect(
      within(screen.getByRole("banner")).queryByRole("button", {
        name: "Install",
      }),
    ).toBeNull();
  });

  test("desktop nav groups tool destinations under a Tools label", () => {
    pathname = "/app";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    expect(
      within(screen.getByRole("navigation")).getByText("Tools"),
    ).toBeTruthy();
  });

  test("desktop nav footer shows the user's name and email with a Sign-out control", () => {
    pathname = "/app";
    render(<AuthenticatedShell displayName="Ada" email="ada@example.com" />);

    const nav = screen.getByRole("navigation");
    expect(within(nav).getByText("Ada")).toBeTruthy();
    expect(within(nav).getByText("ada@example.com")).toBeTruthy();
    expect(within(nav).getByRole("button", { name: "Sign-out" })).toBeTruthy();
  });
});
