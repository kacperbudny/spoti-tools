import * as z from "zod";

export const ALBUM_TYPES = ["album", "single", "compilation"] as const;

export type AlbumType = (typeof ALBUM_TYPES)[number];

export const ALBUM_TYPE_LABELS: Record<AlbumType, string> = {
  album: "Album",
  single: "Single/EP",
  compilation: "Compilation",
};

export type AlbumTypeSelection = Record<AlbumType, boolean>;

export const DEFAULT_ALBUM_TYPE_SELECTION: AlbumTypeSelection = {
  album: true,
  single: true,
  compilation: false,
};

export function toggleAlbumType(
  selection: AlbumTypeSelection,
  type: AlbumType,
): AlbumTypeSelection {
  return { ...selection, [type]: !selection[type] };
}

export function hasSelectedAlbumType(selection: AlbumTypeSelection): boolean {
  return ALBUM_TYPES.some((albumType) => selection[albumType]);
}

export const albumTypeSelectionSchema = z
  .object({
    album: z.boolean(),
    single: z.boolean(),
    compilation: z.boolean(),
  })
  .refine(hasSelectedAlbumType, {
    message: "Select at least one album type.",
  });
