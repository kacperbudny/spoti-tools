"use client";

import { useState } from "react";
import type { Artist } from "@/lib/artist-playlist/artist";
import {
  DEFAULT_RELEASE_GROUP_SELECTION,
  hasAnyReleaseGroupSelected,
  type ReleaseGroup,
  type ReleaseGroupSelection,
  toggleReleaseGroup,
} from "@/lib/artist-playlist/release-groups";

export function useArtistPick(matches: Artist[]) {
  const [selection, setSelection] = useState<ReleaseGroupSelection>(
    DEFAULT_RELEASE_GROUP_SELECTION,
  );
  const [pickedArtistId, setPickedArtistId] = useState<string | null>(null);

  const pickedArtist =
    matches.find((artist) => artist.id === pickedArtistId) ?? null;
  const canSave =
    pickedArtist !== null && hasAnyReleaseGroupSelected(selection);

  function handleToggle(group: ReleaseGroup) {
    setSelection((current) => toggleReleaseGroup(current, group));
  }

  function handlePick(artistId: string) {
    setPickedArtistId(artistId);
  }

  function clearPick() {
    setPickedArtistId(null);
  }

  return {
    selection,
    pickedArtist,
    canSave,
    handleToggle,
    handlePick,
    clearPick,
  };
}
