import * as z from "zod";
import { albumSchema } from "@/lib/random-album/album";

export const libraryStreamEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("progress"),
    loaded: z.number(),
    total: z.number(),
  }),
  z.object({
    type: z.literal("complete"),
    library: z.array(albumSchema),
  }),
  z.object({
    type: z.literal("error"),
    reason: z.literal("source-unavailable"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("session-dead"),
  }),
]);

export type LibraryStreamEvent = z.infer<typeof libraryStreamEventSchema>;

export function parseLibraryStreamLine(line: string): LibraryStreamEvent {
  return libraryStreamEventSchema.parse(JSON.parse(line));
}

export function encodeLibraryStreamEvent(
  event: LibraryStreamEvent,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}
