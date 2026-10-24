const STAGE_RANGE = {
  releases: [0, 10],
  tracks: [10, 30],
  recordings: [30, 90],
  playlist: [90, 100],
} as const;

export type SaveProgressStage = keyof typeof STAGE_RANGE;

export type SaveProgress = {
  label: string;
  percent: number;
  loaded: number | null;
  total: number | null;
};

export function saveProgress(
  stage: SaveProgressStage,
  loaded: number,
  total: number,
): SaveProgress {
  const [start, end] = STAGE_RANGE[stage];
  const ratio = total <= 0 ? 0 : Math.min(1, Math.max(0, loaded / total));
  const countingSongs = stage === "recordings";

  return {
    label:
      stage === "playlist"
        ? "Saving the playlist"
        : "Retrieving the artist's songs",
    percent: Math.round(start + (end - start) * ratio),
    loaded: countingSongs ? loaded : null,
    total: countingSongs ? total : null,
  };
}
