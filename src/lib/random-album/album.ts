import * as z from "zod";
import { albumTypeSchema } from "@/lib/random-album/album-types";

export const albumSchema = z.object({
  id: z.string(),
  title: z.string(),
  artists: z.array(z.string()),
  year: z.number().nullable(),
  type: albumTypeSchema,
  coverUrl: z.string().optional(),
  listenUrl: z.string(),
});

export type Album = z.infer<typeof albumSchema>;
