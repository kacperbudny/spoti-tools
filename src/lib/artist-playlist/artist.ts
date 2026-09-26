import * as z from "zod";

export const artistSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().optional(),
});

export type Artist = z.infer<typeof artistSchema>;
