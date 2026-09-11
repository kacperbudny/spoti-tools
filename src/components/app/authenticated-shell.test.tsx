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

const { AuthenticatedShell } = await import(
  "@/components/app/authenticated-shell"
);

afterEach(cleanup);

describe("AuthenticatedShell", () => {
  test("desktop nav lists Dashboard and Random album destinations", () => {
    render(<AuthenticatedShell displayName="Ada" pathname="/app" />);

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
    render(<AuthenticatedShell displayName="Ada" pathname="/app" />);

    expect(
      within(screen.getByRole("navigation")).getByRole("button", {
        name: "Sign-out",
      }),
    ).toBeTruthy();
  });

  test("phone Dashboard top bar shows display name and Sign-out", () => {
    render(<AuthenticatedShell displayName="Ada" pathname="/app" />);

    const topBar = screen.getByRole("banner");
    expect(within(topBar).getByText("Ada")).toBeTruthy();
    expect(
      within(topBar).getByRole("button", { name: "Sign-out" }),
    ).toBeTruthy();
  });

  test("phone Tool top bar is Back to Dashboard only", () => {
    render(
      <AuthenticatedShell displayName="Ada" pathname="/app/random-album" />,
    );

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
    render(<AuthenticatedShell displayName="Ada" pathname="/app" />);

    expect(
      within(screen.getByRole("navigation")).getByRole("button", {
        name: "Install",
      }),
    ).toBeTruthy();
  });

  test("desktop nav still includes Install on a Tool page", () => {
    render(
      <AuthenticatedShell displayName="Ada" pathname="/app/random-album" />,
    );

    expect(
      within(screen.getByRole("navigation")).getByRole("button", {
        name: "Install",
      }),
    ).toBeTruthy();
  });

  test("phone Tool top bar does not include Install", () => {
    render(
      <AuthenticatedShell displayName="Ada" pathname="/app/random-album" />,
    );

    expect(
      within(screen.getByRole("banner")).queryByRole("button", {
        name: "Install",
      }),
    ).toBeNull();
  });
});
