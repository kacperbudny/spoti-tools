import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { mockInstallAffordance } from "@/test/mock-install-affordance";

mockInstallAffordance();

const { InstallSection } = await import("@/components/app/install-section");

afterEach(cleanup);

describe("InstallSection", () => {
  test("names the Install affordance and explains what it does", () => {
    render(<InstallSection />);

    expect(screen.getByRole("heading", { name: "Install" })).toBeTruthy();
    expect(screen.getByText("Install as an", { exact: false })).toBeTruthy();
    expect(
      screen.getByText(
        "Add SpotiTools to your home screen and use it as an application.",
      ),
    ).toBeTruthy();
  });

  test("offers Install as the primary action and Hide as dismiss", () => {
    render(<InstallSection />);

    expect(
      screen.getByRole("button", { name: "Install SpotiTools" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Hide" })).toBeTruthy();
  });
});
