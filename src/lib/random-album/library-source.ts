import type { Album } from "@/lib/random-album/album";

export type LibraryPage = {
  albums: Album[];
  total: number;
  hasMore: boolean;
};

export type FetchLibraryPageResult =
  | { ok: true; page: LibraryPage }
  | { ok: false; reason: "session-dead" | "source-unavailable" };

export type LibraryPageSource = (
  offset: number,
) => Promise<FetchLibraryPageResult>;

export type LoadLibraryProgress = (loaded: number, total: number) => void;

export type LoadLibraryResult =
  | { ok: true; library: Album[] }
  | { ok: false; reason: "session-dead" | "source-unavailable" };
