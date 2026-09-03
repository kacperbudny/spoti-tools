import type { AlbumType } from "@/lib/random-album/album-types";

export type SpotifySavedAlbumItem = {
  album: {
    id: string;
    name: string;
    album_type: AlbumType;
    artists: Array<{ name: string }>;
    release_date: string;
    images: Array<{ url: string }>;
    external_urls: {
      spotify: string;
    };
  };
};

export type SpotifySavedAlbumsPage = {
  items: SpotifySavedAlbumItem[];
  total: number;
  next: string | null;
};

export type FetchLibraryPageResult =
  | { ok: true; page: SpotifySavedAlbumsPage }
  | { ok: false; reason: "session-dead" | "spotify-failed" };

export type LibraryPageSource = (
  offset: number,
) => Promise<FetchLibraryPageResult>;

export type LoadLibraryProgress = (loaded: number, total: number) => void;

export type LoadLibraryResult =
  | { ok: true; library: import("@/lib/random-album/album").Album[] }
  | { ok: false; reason: "session-dead" | "spotify-failed" };
