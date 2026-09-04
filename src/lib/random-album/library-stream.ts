import type { Album } from "@/lib/random-album/album";

export type LibraryProgressEvent = {
  type: "progress";
  loaded: number;
  total: number;
};

export type LibraryCompleteEvent = {
  type: "complete";
  library: Album[];
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
