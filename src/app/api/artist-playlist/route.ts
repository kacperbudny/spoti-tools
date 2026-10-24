import * as z from "zod";
import { saveArtistPlaylist } from "@/lib/artist-playlist/save-playlist";
import { encodeSavePlaylistStreamEvent } from "@/lib/artist-playlist/save-playlist-stream";
import { SessionDeadError } from "@/lib/auth/errors";
import { SpotifyClientError } from "@/lib/spotify/client";

export const maxDuration = 300;

const savePlaylistRequestSchema = z.object({
  artistId: z.string().trim().min(1),
  artistName: z.string().trim().min(1),
  selection: z.object({
    album: z.boolean(),
    single: z.boolean(),
    compilation: z.boolean(),
    appearances: z.boolean(),
  }),
});

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = savePlaylistRequestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { message: "Choose an artist and what to include." },
      { status: 400 },
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const result = await saveArtistPlaylist(parsed.data, (progress) => {
          controller.enqueue(
            encodeSavePlaylistStreamEvent({ type: "progress", ...progress }),
          );
        });
        controller.enqueue(
          encodeSavePlaylistStreamEvent({ type: "result", result }),
        );
      } catch (error) {
        if (error instanceof SessionDeadError) {
          controller.enqueue(
            encodeSavePlaylistStreamEvent({ type: "session-dead" }),
          );
        } else if (error instanceof SpotifyClientError) {
          controller.enqueue(
            encodeSavePlaylistStreamEvent({
              type: "error",
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
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "private, no-store",
    },
  });
}
