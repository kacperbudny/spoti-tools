"use client";

import { HTTPError } from "ky";
import { http } from "@/lib/http/ky";
import type { Album } from "@/lib/random-album/album";
import type { LibraryStreamEvent } from "@/lib/random-album/library-stream";

export class LibraryLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LibraryLoadError";
  }
}

export class RandomAlbumSessionDeadError extends Error {
  constructor() {
    super("Session expired");
    this.name = "RandomAlbumSessionDeadError";
  }
}

export async function fetchRandomAlbumLibrary(
  onProgress?: (loaded: number, total: number) => void,
): Promise<Album[]> {
  let response: Response;

  try {
    response = await http.post("/api/random-album/library");
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new LibraryLoadError("Could not load the Library. Try again.");
    }

    throw error;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new LibraryLoadError("Spotify failed. Try again.");
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

      const event = JSON.parse(line) as LibraryStreamEvent;

      switch (event.type) {
        case "progress":
          onProgress?.(event.loaded, event.total);
          break;
        case "complete":
          return event.library;
        case "error":
          throw new LibraryLoadError(event.message);
        case "session-dead":
          throw new RandomAlbumSessionDeadError();
      }
    }
  }

  throw new LibraryLoadError("Spotify failed. Try again.");
}
