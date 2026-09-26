import type { ReleaseGroup } from "@/lib/artist-playlist/release-groups";

export type ReleaseDatePrecision = "year" | "month" | "day";

export type Track = {
  id: string;
  recordingId?: string;
  artistIds: string[];
  discNumber: number;
  trackNumber: number;
};

export type Release = {
  id: string;
  name: string;
  group: ReleaseGroup;
  releaseDate: string;
  releaseDatePrecision: ReleaseDatePrecision;
  tracks: Track[];
};
