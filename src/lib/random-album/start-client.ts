"use client";

import type { Album } from "@/lib/random-album/album";
import type { AlbumTypeSelection } from "@/lib/random-album/album-types";
import type { StartStreamEvent } from "@/lib/random-album/start-stream";

type StartRandomAlbumCallbacks = {
  onProgress: (loaded: number, total: number) => void;
  onComplete: (library: Album[], pick: Album | null) => void;
  onSpotifyError: (message: string) => void;
  onSessionDead: () => void;
};

export async function startRandomAlbum(
  types: AlbumTypeSelection,
  callbacks: StartRandomAlbumCallbacks,
) {
  const response = await fetch("/api/random-album/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ types }),
  });

  if (!response.ok) {
    callbacks.onSpotifyError("Could not start Random album. Try again.");
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onSpotifyError("Spotify failed. Try again.");
    return;
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
          callbacks.onProgress(event.loaded, event.total);
          break;
        case "complete":
          callbacks.onComplete(event.library, event.pick);
          break;
        case "error":
          callbacks.onSpotifyError(event.message);
          break;
        case "session-dead":
          callbacks.onSessionDead();
          break;
      }
    }
  }
}
