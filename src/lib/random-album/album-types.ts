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
  const next = { ...selection, [type]: !selection[type] };
  const enabledCount = ALBUM_TYPES.filter(
    (albumType) => next[albumType],
  ).length;

  if (enabledCount === 0) {
    return selection;
  }

  return next;
}
