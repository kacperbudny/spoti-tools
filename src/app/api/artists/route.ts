import * as z from "zod";
import { SessionDeadError } from "@/lib/auth/errors";
import { getSpotifyAccessToken } from "@/lib/auth/session";
import { SpotifyClient, SpotifyClientError } from "@/lib/spotify/client";

const artistSearchQuerySchema = z.object({
  q: z.string().trim().min(1),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = artistSearchQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return Response.json({ message: "Enter an artist name." }, { status: 400 });
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    const artists = await new SpotifyClient(accessToken).searchArtists(
      parsed.data.q,
    );

    return Response.json(
      { artists },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
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
