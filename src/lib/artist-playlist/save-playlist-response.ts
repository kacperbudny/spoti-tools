import * as z from "zod";

export const savePlaylistResponseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("nothing"),
  }),
  z.object({
    kind: z.literal("created"),
    url: z.string(),
    title: z.string(),
    trackCount: z.number().int().nonnegative(),
    truncated: z.boolean(),
  }),
  z.object({
    kind: z.literal("rewrite"),
    url: z.string(),
  }),
]);

export type SavePlaylistResponse = z.infer<typeof savePlaylistResponseSchema>;
