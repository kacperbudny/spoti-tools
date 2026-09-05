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
      setCurrentPick(null);
      setFormError(null);
    },
    onSuccess: (library, types) => {
      setProgress(null);
      const nextPick = pickRandomAlbum(library, types);
      setCurrentPick(nextPick);
      setFormError(nextPick ? null : EMPTY_PICK_ERROR);
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

    libraryMutation.mutate(selection);
  }

  function handleReshuffle() {
    if (!library || !hasSelectedAlbumType(selection)) {
      setFormError("Select at least one album type.");
      return;
    }

    setFormError(null);

    const nextPick = pickRandomAlbum(library, selection);

    if (!nextPick) {
      setCurrentPick(null);
      setFormError(EMPTY_PICK_ERROR);
      return;
    }

    setCurrentPick(nextPick);
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

const EMPTY_PICK_ERROR =
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
