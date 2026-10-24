import * as z from "zod";
import { savePlaylistResponseSchema } from "@/lib/artist-playlist/save-playlist-response";

export const savePlaylistStreamEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("progress"),
    label: z.string(),
    percent: z.number().min(0).max(100),
  }),
  z.object({
    type: z.literal("result"),
    result: savePlaylistResponseSchema,
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("session-dead"),
  }),
]);

export type SavePlaylistStreamEvent = z.infer<
  typeof savePlaylistStreamEventSchema
>;

export function parseSavePlaylistStreamLine(
  line: string,
): SavePlaylistStreamEvent {
  return savePlaylistStreamEventSchema.parse(JSON.parse(line));
}

export function encodeSavePlaylistStreamEvent(
  event: SavePlaylistStreamEvent,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}
