import * as z from "zod";

export const spotifyAlbumTypeSchema = z.enum([
  "album",
  "single",
  "compilation",
]);

export const spotifySavedAlbumItemSchema = z.object({
  album: z.object({
    id: z.string(),
    name: z.string(),
    album_type: spotifyAlbumTypeSchema,
    artists: z.array(z.object({ name: z.string() })),
    release_date: z.string(),
    images: z.array(z.object({ url: z.string() })),
    external_urls: z.object({
      spotify: z.string(),
    }),
  }),
});

export const spotifySavedAlbumsPageSchema = z.object({
  items: z.array(spotifySavedAlbumItemSchema),
  total: z.number(),
  next: z.string().nullable(),
});

export type SpotifyAlbumType = z.infer<typeof spotifyAlbumTypeSchema>;
export type SpotifySavedAlbumItem = z.infer<typeof spotifySavedAlbumItemSchema>;
export type SpotifySavedAlbumsPage = z.infer<
  typeof spotifySavedAlbumsPageSchema
>;
