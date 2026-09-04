import { getSpotifyAccessToken, SessionDeadError } from "@/lib/auth/session";
import { albumTypeSelectionSchema } from "@/lib/random-album/album-types";
import {
  encodeLibraryStreamEvent,
  toLibraryStreamError,
} from "@/lib/random-album/library-stream";
import { pick } from "@/lib/random-album/pick";
import { loadLibrary } from "@/lib/spotify/load-library";

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

  let accessToken: string;

  try {
    accessToken = await getSpotifyAccessToken();
  } catch (error) {
    if (error instanceof SessionDeadError) {
      return new Response(
        Buffer.from(encodeLibraryStreamEvent({ type: "session-dead" })),
        {
          headers: { "Content-Type": "application/x-ndjson" },
        },
      );
    }

    throw error;
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const result = await loadLibrary(accessToken, (loaded, total) => {
        controller.enqueue(
          encodeLibraryStreamEvent({ type: "progress", loaded, total }),
        );
      });

      if (!result.ok) {
        controller.enqueue(
          encodeLibraryStreamEvent(toLibraryStreamError(result)),
        );
        controller.close();
        return;
      }

      controller.enqueue(
        encodeLibraryStreamEvent({
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
