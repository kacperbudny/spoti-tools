import { albumTypeSelectionSchema } from "@/lib/random-album/album-types";
import { loadLibrary } from "@/lib/random-album/load-library";
import { pick } from "@/lib/random-album/pick";
import {
  encodeStartStreamEvent,
  toStartError,
} from "@/lib/random-album/start-stream";
import { getSpotifyAccessToken } from "@/lib/spotify/access-token";
import { createSpotifyLibrarySource } from "@/lib/spotify/library-source";

export async function POST(request: Request) {
  const body = (await request.json()) as { types?: unknown };
  const parsedTypes = albumTypeSelectionSchema.safeParse(body.types);

  if (!parsedTypes.success) {
    return Response.json(
      {
        error: parsedTypes.error.issues[0]?.message,
      },
      { status: 400 },
    );
  }

  const types = parsedTypes.data;

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
      const pageSource = createSpotifyLibrarySource(tokenResult.accessToken);
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
