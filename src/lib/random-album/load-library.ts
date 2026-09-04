import type { Album } from "@/lib/random-album/album";
import type {
  LibraryPageSource,
  LoadLibraryProgress,
  LoadLibraryResult,
} from "@/lib/random-album/library-source";

export async function loadLibrary(
  pageSource: LibraryPageSource,
  onProgress: LoadLibraryProgress,
): Promise<LoadLibraryResult> {
  const library: Album[] = [];
  let offset = 0;
  let total = 0;

  while (true) {
    const pageResult = await pageSource(offset);

    if (!pageResult.ok) {
      return { ok: false, reason: pageResult.reason };
    }

    const { page } = pageResult;
    total = page.total;

    for (const album of page.albums) {
      library.push(album);
    }

    onProgress(library.length, total);

    if (!page.hasMore) {
      break;
    }

    offset += page.albums.length;
  }

  return { ok: true, library };
}
