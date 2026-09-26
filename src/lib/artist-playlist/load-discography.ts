import type { Release } from "@/lib/artist-playlist/release";
import type { ReleaseGroupSelection } from "@/lib/artist-playlist/release-groups";
import type { SpotifyClient } from "@/lib/spotify/client";
import {
  mapDiscographyRelease,
  recordingIdsByTrackId,
  spotifyAlbumGroups,
} from "@/lib/spotify/map-discography";
import type {
  SpotifyAlbumGroup,
  SpotifyAlbumTrack,
  SpotifyArtistAlbum,
} from "@/lib/spotify/types";

const ARTIST_ALBUMS_PAGE_SIZE = 10;
const ALBUM_TRACKS_PAGE_SIZE = 50;
const RECORDING_BATCH = 50;
const REQUEST_CONCURRENCY = 4;

export async function loadArtistDiscography(
  client: SpotifyClient,
  artistId: string,
  selection: ReleaseGroupSelection,
): Promise<Release[]> {
  const includeGroups = spotifyAlbumGroups(selection);

  if (includeGroups.length === 0) {
    return [];
  }

  const albums = await listArtistAlbums(client, artistId, includeGroups);
  const tracksByAlbum = await mapPool(albums, REQUEST_CONCURRENCY, (album) =>
    listAlbumTracks(client, album.id),
  );
  const recordingIds = await loadRecordingIds(
    client,
    tracksByAlbum.flatMap((tracks) =>
      tracks.flatMap((track) => (track.id ? [track.id] : [])),
    ),
  );

  return albums.map((album, index) =>
    mapDiscographyRelease(album, tracksByAlbum[index] ?? [], recordingIds),
  );
}

async function listArtistAlbums(
  client: SpotifyClient,
  artistId: string,
  includeGroups: readonly SpotifyAlbumGroup[],
): Promise<SpotifyArtistAlbum[]> {
  const albums: SpotifyArtistAlbum[] = [];
  let offset = 0;

  while (true) {
    const page = await client.getArtistAlbumsPage(
      artistId,
      includeGroups,
      offset,
      ARTIST_ALBUMS_PAGE_SIZE,
    );
    albums.push(...page.items);

    if (page.next === null || page.items.length === 0) {
      return albums;
    }

    offset += page.items.length;
  }
}

async function listAlbumTracks(
  client: SpotifyClient,
  albumId: string,
): Promise<SpotifyAlbumTrack[]> {
  const tracks: SpotifyAlbumTrack[] = [];
  let offset = 0;

  while (true) {
    const page = await client.getAlbumTracksPage(
      albumId,
      offset,
      ALBUM_TRACKS_PAGE_SIZE,
    );
    tracks.push(...page.items);

    if (page.next === null || page.items.length === 0) {
      return tracks;
    }

    offset += page.items.length;
  }
}

async function loadRecordingIds(
  client: SpotifyClient,
  trackIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(trackIds)];
  const batches: string[][] = [];

  for (let index = 0; index < uniqueIds.length; index += RECORDING_BATCH) {
    batches.push(uniqueIds.slice(index, index + RECORDING_BATCH));
  }

  const pages = await mapPool(batches, REQUEST_CONCURRENCY, (batch) =>
    client.getTracks(batch),
  );
  const recordingIds = new Map<string, string>();

  for (const page of pages) {
    for (const [trackId, recordingId] of recordingIdsByTrackId(page)) {
      recordingIds.set(trackId, recordingId);
    }
  }

  return recordingIds;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await mapper(items[index] as T);
      }
    },
  );

  await Promise.all(workers);
  return results;
}
