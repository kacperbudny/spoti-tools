import { HTTPError } from "ky";
import { SessionDeadError } from "@/lib/auth/errors";
import { http } from "@/lib/http/ky";
import type { Album } from "@/lib/random-album/album";
import {
  type LibraryStreamEvent,
  parseLibraryStreamLine,
} from "@/lib/random-album/library-stream";

export class LibraryLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LibraryLoadError";
  }
}

export async function fetchSpotifyLibrary(
  onProgress?: (loaded: number, total: number) => void,
): Promise<Album[]> {
  let response: Response;

  try {
    response = await http.get("/api/library");
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new LibraryLoadError("Could not load the Library. Try again.");
    }

    throw error;
  }

  if (!response.body) {
    throw new LibraryLoadError("Spotify failed. Try again.");
  }

  for await (const event of readLibraryEvents(response.body)) {
    switch (event.type) {
      case "progress":
        onProgress?.(event.loaded, event.total);
        break;
      case "complete":
        return event.library;
      case "error":
        throw new LibraryLoadError(event.message);
      case "session-dead":
        throw new SessionDeadError();
    }
  }

  throw new LibraryLoadError("Spotify failed. Try again.");
}

async function* readLibraryEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<LibraryStreamEvent> {
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
        yield parseLibraryStreamLine(line);
      } catch {
        throw new LibraryLoadError("Spotify failed. Try again.");
      }
    }
  }
}
