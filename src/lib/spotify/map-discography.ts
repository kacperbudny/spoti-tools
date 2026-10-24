import type { Release, Track } from "@/lib/artist-playlist/release";
import {
  RELEASE_GROUPS,
  type ReleaseGroup,
  type ReleaseGroupSelection,
} from "@/lib/artist-playlist/release-groups";
import type {
  SpotifyAlbumGroup,
  SpotifyAlbumTrack,
  SpotifyArtistAlbum,
} from "@/lib/spotify/types";

export function spotifyAlbumGroups(
  selection: ReleaseGroupSelection,
): SpotifyAlbumGroup[] {
  return RELEASE_GROUPS.filter((group) => selection[group]).map((group) =>
    group === "appearances" ? "appears_on" : group,
  );
}

export function releaseGroupForAlbumGroup(
  group: SpotifyAlbumGroup,
): ReleaseGroup {
  return group === "appears_on" ? "appearances" : group;
}

export function mapDiscographyRelease(
  album: SpotifyArtistAlbum,
  group: ReleaseGroup,
  tracks: SpotifyAlbumTrack[],
): Release {
  const imageUrl = album.images?.[0]?.url;

  return {
    id: album.id,
    name: album.name,
    group,
    releaseDate: album.release_date,
    releaseDatePrecision: album.release_date_precision,
    ...(imageUrl ? { imageUrl } : {}),
    tracks: tracks.flatMap(mapTrack),
  };
}

function mapTrack(track: SpotifyAlbumTrack): Track[] {
  if (!track.id) {
    return [];
  }

  return [
    {
      id: track.id,
      artistIds: track.artists.flatMap((artist) =>
        artist.id ? [artist.id] : [],
      ),
      discNumber: track.disc_number,
      trackNumber: track.track_number,
    },
  ];
}
