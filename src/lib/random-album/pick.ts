import type { Album } from "@/lib/random-album/album";
import type { AlbumTypeSelection } from "@/lib/random-album/album-types";

export function pick(
  library: Album[],
  types: AlbumTypeSelection,
): Album | null {
  const matching = library.filter((album) => types[album.type]);

  if (matching.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * matching.length);
  return matching[index] ?? null;
}
