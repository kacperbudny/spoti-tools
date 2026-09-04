import { SessionDeadError } from "@/lib/auth/errors";
import { getSpotifyAccessToken } from "@/lib/auth/session";
import { encodeLibraryStreamEvent } from "@/lib/random-album/library-stream";
import { SpotifyClient, SpotifyUnavailableError } from "@/lib/spotify/client";
import { loadSpotifyLibrary } from "@/lib/spotify/load-spotify-library";

export async function POST() {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const accessToken = await getSpotifyAccessToken();
        const library = await loadSpotifyLibrary(
          new SpotifyClient(accessToken),
          (loaded, total) => {
            controller.enqueue(
              encodeLibraryStreamEvent({ type: "progress", loaded, total }),
            );
          },
        );

        controller.enqueue(
          encodeLibraryStreamEvent({
            type: "complete",
            library,
          }),
        );
      } catch (error) {
        if (error instanceof SessionDeadError) {
          controller.enqueue(
            encodeLibraryStreamEvent({ type: "session-dead" }),
          );
        } else if (error instanceof SpotifyUnavailableError) {
          controller.enqueue(
            encodeLibraryStreamEvent({
              type: "error",
              reason: "source-unavailable",
              message: "Spotify failed. Try again.",
            }),
          );
        } else {
          throw error;
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
