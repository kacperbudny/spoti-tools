import * as z from "zod";
import { saveArtistPlaylist } from "@/lib/artist-playlist/save-playlist";
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

  try {
    const result = await saveArtistPlaylist(parsed.data);

    return Response.json(result, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof SessionDeadError) {
      return new Response(null, { status: 401 });
    }

    if (error instanceof SpotifyClientError) {
      return Response.json(
        { message: "Spotify failed. Try again." },
        { status: 502 },
      );
    }

    throw error;
  }
}
