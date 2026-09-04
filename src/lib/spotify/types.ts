export type SpotifyAlbumType = "album" | "single" | "compilation";

export type SpotifySavedAlbumItem = {
  album: {
    id: string;
    name: string;
    album_type: SpotifyAlbumType;
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

export type SpotifySavedAlbumsError =
  | { kind: "session-dead" }
  | { kind: "request-failed" };

export type SpotifySavedAlbumsResult =
  | { ok: true; page: SpotifySavedAlbumsPage }
  | { ok: false; error: SpotifySavedAlbumsError };
