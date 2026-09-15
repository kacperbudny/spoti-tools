import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import type { Album } from "@/lib/random-album/album";
import { DEFAULT_ALBUM_TYPE_SELECTION } from "@/lib/random-album/album-types";

let stage = idleStage();

mock.module("@/components/random-album/use-random-album", () => ({
  useRandomAlbum: () => stage,
}));

const { RandomAlbumStage } = await import("@/components/random-album/stage");

afterEach(() => {
  cleanup();
  stage = idleStage();
});

describe("RandomAlbumStage", () => {
  test("idle stage shows the Tool title, album types, and Start", () => {
    render(<RandomAlbumStage />);

    expect(screen.getByRole("heading", { name: "Random album" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Album" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Single/EP" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Compilation" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Re-shuffle" })).toBeNull();
  });

  test("Pick stage shows cover, metadata, Listen on Spotify, Re-shuffle, and types", () => {
    stage = idleStage({ currentPick: nightDrive });
    render(<RandomAlbumStage />);

    expect(
      screen.getByRole("img", { name: "Night Drive cover art" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Night Drive" })).toBeTruthy();
    expect(screen.getByText("Neon Roads")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Listen on Spotify" })
        .getAttribute("href"),
    ).toBe("https://open.spotify.com/album/night-drive");
    expect(screen.getByRole("button", { name: "Re-shuffle" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Album" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Single/EP" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Compilation" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
  });

  test("empty Library message stays on the stage with Start", () => {
    stage = idleStage({
      errorMessage:
        "The library has no saved albums. Save some on Spotify and try again.",
    });
    render(<RandomAlbumStage />);

    expect(screen.getByRole("alert").textContent).toBe(
      "The library has no saved albums. Save some on Spotify and try again.",
    );
    expect(screen.getByRole("button", { name: "Start" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Re-shuffle" })).toBeNull();
    expect(
      screen.queryByRole("link", { name: "Listen on Spotify" }),
    ).toBeNull();
  });

  test("no-match message stays on the stage with Start", () => {
    stage = idleStage({
      errorMessage:
        "Nothing in the library matches these types. Turn on another type or try again.",
    });
    render(<RandomAlbumStage />);

    expect(screen.getByRole("alert").textContent).toBe(
      "Nothing in the library matches these types. Turn on another type or try again.",
    );
    expect(screen.getByRole("button", { name: "Start" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Re-shuffle" })).toBeNull();
  });

  test("select at least one album type stays on the stage", () => {
    stage = idleStage({
      errorMessage: "Select at least one album type.",
    });
    render(<RandomAlbumStage />);

    expect(screen.getByRole("alert").textContent).toBe(
      "Select at least one album type.",
    );
    expect(screen.getByRole("button", { name: "Start" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Re-shuffle" })).toBeNull();
  });

  test("Start and Re-shuffle ask for a draw", () => {
    const handleDraw = mock(() => {});
    stage = idleStage({ handleDraw });
    const { rerender } = render(<RandomAlbumStage />);

    screen.getByRole("button", { name: "Start" }).click();
    expect(handleDraw).toHaveBeenCalledTimes(1);

    stage = idleStage({ currentPick: nightDrive, handleDraw });
    rerender(<RandomAlbumStage />);
    screen.getByRole("button", { name: "Re-shuffle" }).click();
    expect(handleDraw).toHaveBeenCalledTimes(2);
  });

  test("Library crawl shows a progress bar and the count", () => {
    stage = idleStage({
      isLoading: true,
      progress: { loaded: 20, total: 100 },
    });
    render(<RandomAlbumStage />);

    expect(screen.getByRole("progressbar")).toBeTruthy();
    expect(screen.getByText("Loading library: 20 out of 100…")).toBeTruthy();
  });
});

function idleStage(overrides: Partial<ReturnType<typeof defaultStage>> = {}) {
  return { ...defaultStage(), ...overrides };
}

function defaultStage() {
  return {
    selection: DEFAULT_ALBUM_TYPE_SELECTION,
    currentPick: null as Album | null,
    progress: null as { loaded: number; total: number } | null,
    errorMessage: null as string | null,
    isLoading: false,
    handleToggle: mock(() => {}),
    handleDraw: mock(() => {}),
  };
}

const nightDrive: Album = {
  id: "night-drive",
  title: "Night Drive",
  artists: ["Neon Roads"],
  year: 2022,
  type: "album",
  coverUrl: "https://example.com/night-drive.jpg",
  listenUrl: "https://open.spotify.com/album/night-drive",
};
