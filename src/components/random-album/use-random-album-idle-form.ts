"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SessionDeadError } from "@/lib/auth/errors";
import type { Album } from "@/lib/random-album/album";
import {
  type AlbumType,
  type AlbumTypeSelection,
  DEFAULT_ALBUM_TYPE_SELECTION,
  hasSelectedAlbumType,
  toggleAlbumType,
} from "@/lib/random-album/album-types";
import {
  fetchSpotifyLibrary,
  LibraryLoadError,
} from "@/lib/random-album/library-client";
import { pickRandomAlbum } from "@/lib/random-album/pick-random-album";

export function useRandomAlbumIdleForm() {
  const router = useRouter();
  const [selection, setSelection] = useState<AlbumTypeSelection>(
    DEFAULT_ALBUM_TYPE_SELECTION,
  );
  const [currentPick, setCurrentPick] = useState<Album | null>(null);
  const [progress, setProgress] = useState<{
    loaded: number;
    total: number;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const libraryMutation = useMutation<Album[], Error, AlbumTypeSelection>({
    mutationFn: () =>
      fetchSpotifyLibrary((loaded, total) => {
        setProgress({ loaded, total });
      }),
    onMutate: () => {
      setProgress(null);
      setFormError(null);
    },
    onSuccess: (loadedLibrary, types) => {
      setProgress(null);

      if (loadedLibrary.length === 0) {
        setCurrentPick(null);
        setFormError(EMPTY_LIBRARY_MESSAGE);
        return;
      }

      applyPick(loadedLibrary, types);
    },
    onError: (error) => {
      setProgress(null);

      if (error instanceof SessionDeadError) {
        router.push("/");
        return;
      }

      setFormError(getLibraryError(error));
    },
  });

  const library = libraryMutation.data ?? null;
  const libraryError = getLibraryError(libraryMutation.error);

  function applyPick(source: Album[], types: AlbumTypeSelection) {
    const nextPick = pickRandomAlbum(source, types);

    if (!nextPick) {
      setCurrentPick(null);
      setFormError(NO_MATCHING_TYPES_MESSAGE);
      return;
    }

    setCurrentPick(nextPick);
    setFormError(null);
  }

  function handleToggle(type: AlbumType) {
    setSelection((current) => {
      const next = toggleAlbumType(current, type);
      if (hasSelectedAlbumType(next)) {
        setFormError(null);
      }
      return next;
    });
  }

  function handleLoadLibrary() {
    if (!hasSelectedAlbumType(selection)) {
      setFormError("Select at least one album type.");
      return;
    }

    if (library && library.length > 0) {
      applyPick(library, selection);
      return;
    }

    libraryMutation.mutate(selection);
  }

  function handleReshuffle() {
    if (!hasSelectedAlbumType(selection)) {
      setFormError("Select at least one album type.");
      return;
    }

    if (!library || library.length === 0) {
      setCurrentPick(null);
      setFormError(EMPTY_LIBRARY_MESSAGE);
      return;
    }

    applyPick(library, selection);
  }

  return {
    selection,
    currentPick,
    progress,
    errorMessage: formError ?? libraryError,
    showReshuffle: currentPick !== null,
    isLoading: libraryMutation.isPending,
    handleToggle,
    handleLoadLibrary,
    handleReshuffle,
  };
}

const EMPTY_LIBRARY_MESSAGE =
  "The Library has no saved albums. Save some on Spotify and try again.";

const NO_MATCHING_TYPES_MESSAGE =
  "Nothing in the Library matches these types. Turn on another type or try again.";

function getLibraryError(error: unknown): string | null {
  if (error instanceof LibraryLoadError) {
    return error.message;
  }

  if (error) {
    return "Something went wrong. Try again.";
  }

  return null;
}
