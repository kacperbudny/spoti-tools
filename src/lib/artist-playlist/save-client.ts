import { HTTPError } from "ky";
import * as z from "zod";
import type { ReleaseGroupSelection } from "@/lib/artist-playlist/release-groups";
import type { SavePlaylistResponse } from "@/lib/artist-playlist/save-playlist-response";
import { savePlaylistResponseSchema } from "@/lib/artist-playlist/save-playlist-response";
import { SessionDeadError } from "@/lib/auth/errors";
import { http } from "@/lib/http/ky";

export class SavePlaylistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavePlaylistError";
  }
}

export async function requestSavePlaylist(input: {
  artistId: string;
  artistName: string;
  selection: ReleaseGroupSelection;
}): Promise<SavePlaylistResponse> {
  try {
    const body: unknown = await http
      .post("/api/artist-playlist", {
        json: input,
        timeout: 300_000,
      })
      .json();

    return savePlaylistResponseSchema.parse(body);
  } catch (error) {
    if (error instanceof HTTPError) {
      if (error.response.status === 401) {
        throw new SessionDeadError();
      }

      throw new SavePlaylistError("Spotify failed. Try again.");
    }

    if (error instanceof z.ZodError) {
      throw new SavePlaylistError("Spotify failed. Try again.");
    }

    throw error;
  }
}
