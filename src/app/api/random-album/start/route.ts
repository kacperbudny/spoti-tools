import {
  ALBUM_TYPES,
  type AlbumTypeSelection,
} from "@/lib/random-album/album-types";
import { loadLibrary } from "@/lib/random-album/load-library";
import { pick } from "@/lib/random-album/pick";
import { createSpotifyPageSource } from "@/lib/random-album/spotify-page-source";
import { getSpotifyAccessToken } from "@/lib/random-album/spotify-token";
import {
  encodeStartStreamEvent,
  toStartError,
} from "@/lib/random-album/start-stream";

function parseAlbumTypeSelection(value: unknown): AlbumTypeSelection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const selection = {} as AlbumTypeSelection;

  for (const type of ALBUM_TYPES) {
    if (typeof record[type] !== "boolean") {
      return null;
    }
    selection[type] = record[type];
  }

  return selection;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { types?: unknown };
  const types = parseAlbumTypeSelection(body.types);

  if (!types || !ALBUM_TYPES.some((albumType) => types[albumType])) {
    return Response.json(
      { error: "Select at least one album type." },
      { status: 400 },
    );
  }

  const tokenResult = await getSpotifyAccessToken();

  if (!tokenResult.ok) {
    return new Response(
      Buffer.from(encodeStartStreamEvent({ type: "session-dead" })),
      {
        headers: { "Content-Type": "application/x-ndjson" },
      },
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const pageSource = createSpotifyPageSource(tokenResult.accessToken);
      const result = await loadLibrary(pageSource, (loaded, total) => {
        controller.enqueue(
          encodeStartStreamEvent({ type: "progress", loaded, total }),
        );
      });

      if (!result.ok) {
        controller.enqueue(encodeStartStreamEvent(toStartError(result)));
        controller.close();
        return;
      }

      controller.enqueue(
        encodeStartStreamEvent({
          type: "complete",
          library: result.library,
          pick: pick(result.library, types),
        }),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
