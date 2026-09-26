import { HTTPError } from "ky";
import * as z from "zod";
import {
  type Artist,
  artistSearchResponseSchema,
} from "@/lib/artist-playlist/artist";
import { SessionDeadError } from "@/lib/auth/errors";
import { http } from "@/lib/http/ky";

export class ArtistSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArtistSearchError";
  }
}

export async function searchArtists(query: string): Promise<Artist[]> {
  try {
    const body: unknown = await http
      .get("/api/artists/search", {
        searchParams: { q: query },
      })
      .json();

    return artistSearchResponseSchema.parse(body).artists;
  } catch (error) {
    if (error instanceof HTTPError) {
      if (error.response.status === 401) {
        throw new SessionDeadError();
      }

      throw new ArtistSearchError("Spotify failed. Try again.");
    }

    if (error instanceof z.ZodError) {
      throw new ArtistSearchError("Spotify failed. Try again.");
    }

    throw error;
  }
}
