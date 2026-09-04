"use client";

import { HTTPError } from "ky";
import { http } from "@/lib/http/ky";
import type { Album } from "@/lib/random-album/album";
import type { AlbumTypeSelection } from "@/lib/random-album/album-types";
import type { StartStreamEvent } from "@/lib/random-album/start-stream";

export type StartRandomAlbumResult = {
  library: Album[];
  pick: Album | null;
};

export class RandomAlbumStartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RandomAlbumStartError";
  }
}

export class RandomAlbumSessionDeadError extends Error {
  constructor() {
    super("Session expired");
    this.name = "RandomAlbumSessionDeadError";
  }
}

export async function fetchRandomAlbumLibrary(
  types: AlbumTypeSelection,
  onProgress?: (loaded: number, total: number) => void,
): Promise<StartRandomAlbumResult> {
  let response: Response;

  try {
    response = await http.post("/api/random-album/start", { json: types });
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new RandomAlbumStartError(
        "Could not start Random album. Try again.",
      );
    }

    throw error;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new RandomAlbumStartError("Spotify failed. Try again.");
  }

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

      const event = JSON.parse(line) as StartStreamEvent;

      switch (event.type) {
        case "progress":
          onProgress?.(event.loaded, event.total);
          break;
        case "complete":
          return { library: event.library, pick: event.pick };
        case "error":
          throw new RandomAlbumStartError(event.message);
        case "session-dead":
          throw new RandomAlbumSessionDeadError();
      }
    }
  }

  throw new RandomAlbumStartError("Spotify failed. Try again.");
}
