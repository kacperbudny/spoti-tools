import { HTTPError } from "ky";
import * as z from "zod";
import type { ReleaseGroupSelection } from "@/lib/artist-playlist/release-groups";
import type { SavePlaylistResponse } from "@/lib/artist-playlist/save-playlist-response";
import {
  parseSavePlaylistStreamLine,
  type SavePlaylistStreamEvent,
} from "@/lib/artist-playlist/save-playlist-stream";
import type { SaveProgress } from "@/lib/artist-playlist/save-progress";
import { SessionDeadError } from "@/lib/auth/errors";
import { http } from "@/lib/http/ky";

export class SavePlaylistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavePlaylistError";
  }
}

export async function requestSavePlaylist(
  input: {
    artistId: string;
    artistName: string;
    selection: ReleaseGroupSelection;
  },
  onProgress?: (progress: SaveProgress) => void,
): Promise<SavePlaylistResponse> {
  let response: Awaited<ReturnType<typeof http.post>>;

  try {
    response = await http.post("/api/artist-playlist", {
      json: input,
      timeout: 300_000,
    });
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      throw new SessionDeadError();
    }

    if (error instanceof HTTPError) {
      throw new SavePlaylistError("Spotify failed. Try again.");
    }

    throw error;
  }

  if (!response.body) {
    throw new SavePlaylistError("Spotify failed. Try again.");
  }

  for await (const event of readSavePlaylistEvents(response.body)) {
    switch (event.type) {
      case "progress":
        onProgress?.({ label: event.label, percent: event.percent });
        break;
      case "result":
        return event.result;
      case "error":
        throw new SavePlaylistError(event.message);
      case "session-dead":
        throw new SessionDeadError();
    }
  }

  throw new SavePlaylistError("Spotify failed. Try again.");
}

async function* readSavePlaylistEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SavePlaylistStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex === -1) {
        break;
      }

      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (!line) {
        continue;
      }

      try {
        yield parseSavePlaylistStreamLine(line);
      } catch (error) {
        if (error instanceof z.ZodError || error instanceof SyntaxError) {
          throw new SavePlaylistError("Spotify failed. Try again.");
        }

        throw error;
      }
    }
  }
}
