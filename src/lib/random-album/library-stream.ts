import type { Album } from "@/lib/random-album/album";

export type LibraryProgressEvent = {
  type: "progress";
  loaded: number;
  total: number;
};

export type LibraryCompleteEvent = {
  type: "complete";
  library: Album[];
  pick: Album | null;
};

export type LibraryErrorEvent = {
  type: "error";
  reason: "source-unavailable";
  message: string;
};

export type LibrarySessionDeadEvent = {
  type: "session-dead";
};

export type LibraryStreamEvent =
  | LibraryProgressEvent
  | LibraryCompleteEvent
  | LibraryErrorEvent
  | LibrarySessionDeadEvent;

export function encodeLibraryStreamEvent(
  event: LibraryStreamEvent,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export function toLibraryStreamError(result: {
  reason: "session-dead" | "source-unavailable";
}): LibraryErrorEvent | LibrarySessionDeadEvent {
  if (result.reason === "session-dead") {
    return { type: "session-dead" };
  }

  return {
    type: "error",
    reason: "source-unavailable",
    message: "Spotify failed. Try again.",
  };
}
