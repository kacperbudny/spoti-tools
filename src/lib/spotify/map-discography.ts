import type { Release, Track } from "@/lib/artist-playlist/release";
import {
  RELEASE_GROUPS,
  type ReleaseGroupSelection,
} from "@/lib/artist-playlist/release-groups";
import type {
  SpotifyAlbumGroup,
  SpotifyAlbumTrack,
  SpotifyArtistAlbum,
  SpotifyFullTrack,
} from "@/lib/spotify/types";

export function spotifyAlbumGroups(
  selection: ReleaseGroupSelection,
): SpotifyAlbumGroup[] {
  return RELEASE_GROUPS.filter((group) => selection[group]).map((group) =>
    group === "appearances" ? "appears_on" : group,
  );
}

export function recordingIdsByTrackId(
  tracks: Array<SpotifyFullTrack | null>,
): Map<string, string> {
  const recordingIds = new Map<string, string>();

  for (const track of tracks) {
    const recordingId = track?.external_ids?.isrc;

    if (track && recordingId) {
      recordingIds.set(track.id, recordingId);
    }
  }

  return recordingIds;
}

export function mapDiscographyRelease(
  album: SpotifyArtistAlbum,
  tracks: SpotifyAlbumTrack[],
  recordingIds: ReadonlyMap<string, string>,
): Release {
  return {
    id: album.id,
    name: album.name,
    group:
      album.album_group === "appears_on" ? "appearances" : album.album_group,
    releaseDate: album.release_date,
    releaseDatePrecision: album.release_date_precision,
    tracks: tracks.flatMap((track) => mapTrack(track, recordingIds)),
  };
}

function mapTrack(
  track: SpotifyAlbumTrack,
  recordingIds: ReadonlyMap<string, string>,
): Track[] {
  if (!track.id) {
    return [];
  }

  const recordingId = recordingIds.get(track.id);

  return [
    {
      id: track.id,
      recordingId: recordingId || undefined,
      artistIds: track.artists.flatMap((artist) =>
        artist.id ? [artist.id] : [],
      ),
      discNumber: track.disc_number,
      trackNumber: track.track_number,
    },
  ];
}
