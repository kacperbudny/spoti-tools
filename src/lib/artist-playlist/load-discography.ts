import type { Release } from "@/lib/artist-playlist/release";
import type { ReleaseGroupSelection } from "@/lib/artist-playlist/release-groups";
import type { SpotifyClient } from "@/lib/spotify/client";
import {
  mapDiscographyRelease,
  recordingIdsByTrackId,
  releaseGroupForAlbumGroup,
  spotifyAlbumGroups,
} from "@/lib/spotify/map-discography";
import type {
  SpotifyAlbumGroup,
  SpotifyAlbumTrack,
  SpotifyArtistAlbum,
} from "@/lib/spotify/types";

const ARTIST_ALBUMS_PAGE_SIZE = 10;
const ALBUM_TRACKS_PAGE_SIZE = 50;
const REQUEST_CONCURRENCY = 4;

export type DiscographyLoadProgress = {
  stage: "releases" | "tracks" | "recordings";
  loaded: number;
  total: number;
};

export async function loadArtistDiscography(
  client: SpotifyClient,
  artistId: string,
  selection: ReleaseGroupSelection,
  onProgress?: (progress: DiscographyLoadProgress) => void,
): Promise<Release[]> {
  const includeGroups = spotifyAlbumGroups(selection);

  if (includeGroups.length === 0) {
    return [];
  }

  onProgress?.({
    stage: "releases",
    loaded: 0,
    total: includeGroups.length,
  });

  let finishedGroups = 0;
  const groupedAlbums = (
    await Promise.all(
      includeGroups.map(async (albumGroup) => {
        const albums = await listArtistAlbums(client, artistId, [albumGroup]);
        finishedGroups += 1;
        onProgress?.({
          stage: "releases",
          loaded: finishedGroups,
          total: includeGroups.length,
        });
        const group = releaseGroupForAlbumGroup(albumGroup);
        return albums.map((album) => ({ album, group }));
      }),
    )
  ).flat();

  onProgress?.({ stage: "tracks", loaded: 0, total: groupedAlbums.length });
  let finishedAlbums = 0;
  const tracksByAlbum = await mapPool(
    groupedAlbums,
    REQUEST_CONCURRENCY,
    async ({ album }) => {
      const tracks = await listAlbumTracks(client, album.id);
      finishedAlbums += 1;
      onProgress?.({
        stage: "tracks",
        loaded: finishedAlbums,
        total: groupedAlbums.length,
      });
      return tracks;
    },
  );
  const recordingIds = await loadRecordingIds(
    client,
    tracksByAlbum.flatMap((tracks) =>
      tracks.flatMap((track) => (track.id ? [track.id] : [])),
    ),
    onProgress,
  );

  return groupedAlbums.map(({ album, group }, index) =>
    mapDiscographyRelease(
      album,
      group,
      tracksByAlbum[index] ?? [],
      recordingIds,
    ),
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
  onProgress?: (progress: DiscographyLoadProgress) => void,
): Promise<Map<string, string>> {
  const ids = [...new Set(trackIds)];
  onProgress?.({ stage: "recordings", loaded: 0, total: ids.length });
  const tracks = await client.getTracks(ids, (loaded) => {
    onProgress?.({ stage: "recordings", loaded, total: ids.length });
  });
  return recordingIdsByTrackId(tracks);
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
