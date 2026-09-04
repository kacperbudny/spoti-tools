import type { AlbumType } from "@/lib/random-album/album-types";

export type Album = {
  id: string;
  title: string;
  artists: string[];
  year: number | null;
  type: AlbumType;
  coverUrl?: string;
  listenUrl: string;
};
