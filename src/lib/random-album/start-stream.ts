import type { Album } from "@/lib/random-album/album";

export type StartProgressEvent = {
  type: "progress";
  loaded: number;
  total: number;
};

export type StartCompleteEvent = {
  type: "complete";
  library: Album[];
  pick: Album | null;
};

export type StartErrorEvent = {
  type: "error";
  reason: "source-unavailable";
  message: string;
};

export type StartSessionDeadEvent = {
  type: "session-dead";
};

export type StartStreamEvent =
  | StartProgressEvent
  | StartCompleteEvent
  | StartErrorEvent
  | StartSessionDeadEvent;

export function encodeStartStreamEvent(event: StartStreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export function toStartError(result: {
  reason: "session-dead" | "source-unavailable";
}): StartErrorEvent | StartSessionDeadEvent {
  if (result.reason === "session-dead") {
    return { type: "session-dead" };
  }

  return {
    type: "error",
    reason: "source-unavailable",
    message: "Spotify failed. Try again.",
  };
}
