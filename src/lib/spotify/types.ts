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

export const spotifyArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  images: z.array(z.object({ url: z.string() })),
});

export const spotifyArtistSearchSchema = z.object({
  artists: z.object({
    items: z.array(spotifyArtistSchema),
  }),
});

export const spotifyAlbumGroupSchema = z.enum([
  "album",
  "single",
  "compilation",
  "appears_on",
]);

export const spotifyReleaseDatePrecisionSchema = z.enum([
  "year",
  "month",
  "day",
]);

export const spotifyArtistAlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  album_group: spotifyAlbumGroupSchema,
  release_date: z.string(),
  release_date_precision: spotifyReleaseDatePrecisionSchema,
});

export const spotifyArtistAlbumsPageSchema = z.object({
  items: z.array(spotifyArtistAlbumSchema),
  next: z.string().nullable(),
});

export const spotifyAlbumTrackSchema = z.object({
  id: z.string().nullable(),
  disc_number: z.number(),
  track_number: z.number(),
  artists: z.array(z.object({ id: z.string().optional() })),
});

export const spotifyAlbumTracksPageSchema = z.object({
  items: z.array(spotifyAlbumTrackSchema),
  next: z.string().nullable(),
});

export const spotifyFullTrackSchema = z.object({
  id: z.string(),
  external_ids: z
    .object({
      isrc: z.string().optional(),
    })
    .nullish(),
});

export const spotifyTracksSchema = z.object({
  tracks: z.array(spotifyFullTrackSchema.nullable()),
});

export const spotifyCreatedPlaylistSchema = z.object({
  id: z.string(),
  external_urls: z.object({
    spotify: z.string(),
  }),
});

export const spotifyPlaylistSnapshotSchema = z.object({
  snapshot_id: z.string(),
});

export type SpotifyAlbumType = z.infer<typeof spotifyAlbumTypeSchema>;
export type SpotifySavedAlbumItem = z.infer<typeof spotifySavedAlbumItemSchema>;
export type SpotifySavedAlbumsPage = z.infer<
  typeof spotifySavedAlbumsPageSchema
>;
export type SpotifyArtist = z.infer<typeof spotifyArtistSchema>;
export type SpotifyArtistSearch = z.infer<typeof spotifyArtistSearchSchema>;
export type SpotifyAlbumGroup = z.infer<typeof spotifyAlbumGroupSchema>;
export type SpotifyArtistAlbum = z.infer<typeof spotifyArtistAlbumSchema>;
export type SpotifyArtistAlbumsPage = z.infer<
  typeof spotifyArtistAlbumsPageSchema
>;
export type SpotifyAlbumTrack = z.infer<typeof spotifyAlbumTrackSchema>;
export type SpotifyAlbumTracksPage = z.infer<
  typeof spotifyAlbumTracksPageSchema
>;
export type SpotifyFullTrack = z.infer<typeof spotifyFullTrackSchema>;
export type SpotifyCreatedPlaylist = z.infer<
  typeof spotifyCreatedPlaylistSchema
>;
