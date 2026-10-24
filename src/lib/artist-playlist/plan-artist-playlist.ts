import type { Release, Track } from "@/lib/artist-playlist/release";
import type { ReleaseGroupSelection } from "@/lib/artist-playlist/release-groups";

const PLAYLIST_TRACK_CAP = 10_000;

type PlannedTracks = {
  title: string;
  trackIds: string[];
  truncated: boolean;
  droppedTrackIds: string[];
};

export type ArtistPlaylistPlan =
  | { kind: "nothing" }
  | ({ kind: "create" } & PlannedTracks)
  | ({ kind: "rewrite"; playlistId: string } & PlannedTracks);

export function planArtistPlaylist(input: {
  artistId: string;
  artistName: string;
  releases: Release[];
  selection: ReleaseGroupSelection;
  rememberedPlaylistId?: string | null;
}): ArtistPlaylistPlan {
  const ordered = input.releases
    .filter((release) => input.selection[release.group])
    .toSorted(compareReleases)
    .flatMap((release) => release.tracks.toSorted(compareTracks));

  const seen = new Set<string>();
  const kept: Track[] = [];
  const droppedTrackIds: string[] = [];

  for (const track of ordered) {
    if (!track.artistIds.includes(input.artistId)) {
      droppedTrackIds.push(track.id);
      continue;
    }

    const key = track.recordingId
      ? `recording:${track.recordingId}`
      : `track:${track.id}`;

    if (seen.has(key)) {
      droppedTrackIds.push(track.id);
      continue;
    }

    seen.add(key);
    kept.push(track);
  }

  const truncated = kept.length > PLAYLIST_TRACK_CAP;

  if (truncated) {
    for (const track of kept.slice(PLAYLIST_TRACK_CAP)) {
      droppedTrackIds.push(track.id);
    }
  }

  const trackIds = kept.slice(0, PLAYLIST_TRACK_CAP).map((track) => track.id);

  if (trackIds.length === 0) {
    return { kind: "nothing" };
  }

  const planned = {
    title: `${input.artistName} discography`,
    trackIds,
    truncated,
    droppedTrackIds,
  };

  if (input.rememberedPlaylistId) {
    return {
      kind: "rewrite",
      playlistId: input.rememberedPlaylistId,
      ...planned,
    };
  }

  return { kind: "create", ...planned };
}

function compareReleases(a: Release, b: Release): number {
  const byDate = releaseSortTime(a) - releaseSortTime(b);

  if (byDate !== 0) {
    return byDate;
  }

  const byLength = a.tracks.length - b.tracks.length;

  if (byLength !== 0) {
    return byLength;
  }

  if (a.id < b.id) {
    return -1;
  }

  if (a.id > b.id) {
    return 1;
  }

  return 0;
}

function compareTracks(a: Track, b: Track): number {
  return a.discNumber - b.discNumber || a.trackNumber - b.trackNumber;
}

function releaseSortTime(release: Release): number {
  const [yearPart, monthPart = "1", dayPart = "1"] =
    release.releaseDate.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (release.releaseDatePrecision === "year") {
    return Date.UTC(year, 0, 1);
  }

  if (release.releaseDatePrecision === "month") {
    return Date.UTC(year, month - 1, 1);
  }

  return Date.UTC(year, month - 1, day);
}
