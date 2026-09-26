export const RELEASE_GROUPS = [
  "album",
  "single",
  "compilation",
  "appearances",
] as const;

export type ReleaseGroup = (typeof RELEASE_GROUPS)[number];

export type ReleaseGroupSelection = Record<ReleaseGroup, boolean>;

export const RELEASE_GROUP_LABELS: Record<ReleaseGroup, string> = {
  album: "Albums",
  single: "Singles and EPs",
  compilation: "Compilations",
  appearances: "Appearances",
};

export const DEFAULT_RELEASE_GROUP_SELECTION: ReleaseGroupSelection = {
  album: true,
  single: true,
  compilation: true,
  appearances: true,
};

export function toggleReleaseGroup(
  selection: ReleaseGroupSelection,
  group: ReleaseGroup,
): ReleaseGroupSelection {
  return { ...selection, [group]: !selection[group] };
}

export function hasAnyReleaseGroupSelected(
  selection: ReleaseGroupSelection,
): boolean {
  return RELEASE_GROUPS.some((group) => selection[group]);
}
