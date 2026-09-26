"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { Artist } from "@/lib/artist-playlist/artist";
import {
  DEFAULT_RELEASE_GROUP_SELECTION,
  hasSelectedReleaseGroup,
  type ReleaseGroup,
  type ReleaseGroupSelection,
  toggleReleaseGroup,
} from "@/lib/artist-playlist/release-groups";
import {
  ArtistSearchError,
  searchArtists,
} from "@/lib/artist-playlist/search-client";
import { SessionDeadError } from "@/lib/auth/errors";

export function useArtistPlaylist() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<ReleaseGroupSelection>(
    DEFAULT_RELEASE_GROUP_SELECTION,
  );
  const [matches, setMatches] = useState<Artist[] | null>(null);
  const [pickedArtistId, setPickedArtistId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: searchArtists,
    onMutate: () => {
      setMatches(null);
      setPickedArtistId(null);
      setFormError(null);
    },
    onSuccess: (artists) => {
      setMatches(artists);
    },
    onError: (error) => {
      if (error instanceof SessionDeadError) {
        router.push("/");
        return;
      }

      setFormError(searchErrorMessage(error));
    },
  });

  const pickedArtist =
    matches?.find((artist) => artist.id === pickedArtistId) ?? null;
  const canSave = pickedArtist !== null && hasSelectedReleaseGroup(selection);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = query.trim();

    if (!name) {
      return;
    }

    searchMutation.mutate(name);
  }

  function handleToggle(group: ReleaseGroup) {
    setSelection((current) => toggleReleaseGroup(current, group));
  }

  function handlePick(artistId: string) {
    setPickedArtistId(artistId);
  }

  function handleChangeArtist() {
    setPickedArtistId(null);
  }

  return {
    query,
    selection,
    matches,
    pickedArtist,
    canSave,
    isSearching: searchMutation.isPending,
    errorMessage: formError,
    emptyMessage:
      matches !== null && matches.length === 0 ? NO_ARTIST_MATCHES : null,
    setQuery,
    handleSearch,
    handleToggle,
    handlePick,
    handleChangeArtist,
  };
}

const NO_ARTIST_MATCHES = "No artists match that name.";

function searchErrorMessage(error: unknown): string {
  if (error instanceof ArtistSearchError) {
    return error.message;
  }

  return "Something went wrong. Try again.";
}
