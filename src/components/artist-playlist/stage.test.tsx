import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import type { Artist } from "@/lib/artist-playlist/artist";
import { DEFAULT_RELEASE_GROUP_SELECTION } from "@/lib/artist-playlist/release-groups";
import type { SavePlaylistResponse } from "@/lib/artist-playlist/save-playlist-response";
import type { SaveProgress } from "@/lib/artist-playlist/save-progress";

const resetSearch = mock(() => {});
const clearPick = mock(() => {});
let save = idleSave();

mock.module("@/components/artist-playlist/use-artist-search", () => ({
  useArtistSearch: () => ({
    query: "",
    matches: [ada],
    isSearching: false,
    hasSearched: true,
    errorMessage: null,
    setQuery: () => {},
    handleSearch: () => false,
    reset: resetSearch,
  }),
}));

mock.module("@/components/artist-playlist/use-artist-pick", () => ({
  useArtistPick: () => ({
    selection: DEFAULT_RELEASE_GROUP_SELECTION,
    pickedArtist: ada,
    canSave: true,
    handleToggle: () => {},
    handlePick: () => {},
    clearPick,
  }),
}));

mock.module("@/components/artist-playlist/use-save-playlist", () => ({
  useSavePlaylist: () => save,
}));

const { ArtistPlaylistStage } = await import(
  "@/components/artist-playlist/stage"
);

afterEach(() => {
  cleanup();
  save = idleSave();
});

describe("ArtistPlaylistStage", () => {
  test("saving shows a busy button, the current step, and a progress bar", () => {
    save = idleSave({
      isSaving: true,
      progress: {
        label: "Retrieving the artist's songs",
        percent: 60,
        loaded: 23,
        total: 153,
      },
    });
    render(<ArtistPlaylistStage />);

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect((button as HTMLButtonElement).disabled).toBe(true);
    const status = screen.getByText(
      "Retrieving the artist's songs: 23 out of 153…",
    );
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.className).toContain("animate-pulse");
    expect(screen.getByRole("progressbar")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Playlist successfully saved!" }),
    ).toBeNull();
  });

  test("saving pulses the status until the song count arrives", () => {
    save = idleSave({ isSaving: true });
    render(<ArtistPlaylistStage />);

    const status = screen.getByText("Retrieving the artist's songs");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.className).toContain("animate-pulse");
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  test("a saved playlist replaces the form with the title, song count, and link", () => {
    save = idleSave({
      result: {
        kind: "created",
        url: "https://open.spotify.com/playlist/ada",
        title: "Ada discography",
        trackCount: 12,
        coverUrl: "https://example.com/ada-cover.jpg",
        truncated: false,
      },
    });
    render(<ArtistPlaylistStage />);

    const heading = screen.getByRole("heading", {
      name: "Playlist successfully saved!",
    });
    expect(heading.className).not.toContain("text-cta");
    expect(heading.querySelector("svg")?.getAttribute("class")).toContain(
      "text-cta",
    );
    const cover = screen.getByRole("img", { name: "Ada discography cover" });
    expect(cover.getAttribute("src")).toBe("https://example.com/ada-cover.jpg");
    expect(cover.className).toContain("size-32");
    expect(cover.className).toContain("rounded-lg");
    expect(cover.closest("a")?.getAttribute("href")).toBe(
      "https://open.spotify.com/playlist/ada",
    );
    expect(cover.closest("a")?.parentElement?.className).toContain(
      "items-center",
    );
    expect(
      screen
        .getByRole("link", { name: "Ada discography" })
        .getAttribute("href"),
    ).toBe("https://open.spotify.com/playlist/ada");
    expect(screen.getByText("12 songs")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Open playlist on Spotify" })
        .getAttribute("href"),
    ).toBe("https://open.spotify.com/playlist/ada");
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(
      screen.queryByRole("group", {
        name: "What do you want to include in your playlist?",
      }),
    ).toBeNull();
  });

  test("one saved song is singular", () => {
    save = idleSave({
      result: {
        kind: "created",
        url: "https://open.spotify.com/playlist/ada",
        title: "Ada discography",
        trackCount: 1,
        coverUrl: null,
        truncated: true,
      },
    });
    render(<ArtistPlaylistStage />);

    expect(
      screen.queryByRole("img", { name: "Ada discography cover" }),
    ).toBeNull();
    expect(screen.getByText("1 song")).toBeTruthy();
    expect(
      screen.getByText(
        "The oldest 10,000 tracks were saved. The rest did not fit.",
      ),
    ).toBeTruthy();
  });

  test("nothing to save stays on the form", () => {
    save = idleSave({ result: { kind: "nothing" } });
    render(<ArtistPlaylistStage />);

    expect(screen.getByText("There is nothing to save.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Playlist successfully saved!" }),
    ).toBeNull();
  });

  test("create another playlist clears the search and the picked artist", () => {
    save = idleSave({
      result: {
        kind: "created",
        url: "https://open.spotify.com/playlist/ada",
        title: "Ada discography",
        trackCount: 12,
        coverUrl: null,
        truncated: false,
      },
    });
    resetSearch.mockClear();
    clearPick.mockClear();
    render(<ArtistPlaylistStage />);

    screen.getByRole("button", { name: "Create another playlist" }).click();

    expect(resetSearch).toHaveBeenCalledTimes(1);
    expect(clearPick).toHaveBeenCalledTimes(1);
  });
});

function idleSave(
  overrides: Partial<{
    result: SavePlaylistResponse | null;
    errorMessage: string | null;
    progress: SaveProgress | null;
    isSaving: boolean;
    save: () => void;
  }> = {},
) {
  return {
    result: null as SavePlaylistResponse | null,
    errorMessage: null as string | null,
    progress: null as SaveProgress | null,
    isSaving: false,
    save: () => {},
    ...overrides,
  };
}

const ada: Artist = {
  id: "ada",
  name: "Ada",
  imageUrl: "https://example.com/ada.jpg",
};
