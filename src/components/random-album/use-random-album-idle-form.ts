"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Album } from "@/lib/random-album/album";
import {
  type AlbumType,
  type AlbumTypeSelection,
  DEFAULT_ALBUM_TYPE_SELECTION,
  hasSelectedAlbumType,
  toggleAlbumType,
} from "@/lib/random-album/album-types";
import {
  fetchRandomAlbumLibrary,
  LibraryLoadError,
  RandomAlbumSessionDeadError,
} from "@/lib/random-album/library-client";
import { pick } from "@/lib/random-album/pick";

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [noPickMessage, setNoPickMessage] = useState<string | null>(null);

  const libraryMutation = useMutation({
    mutationFn: (types: AlbumTypeSelection) =>
      fetchRandomAlbumLibrary(types, (loaded, total) => {
        setProgress({ loaded, total });
      }),
    onMutate: () => {
      setProgress(null);
      setCurrentPick(null);
      setNoPickMessage(null);
      setValidationError(null);
    },
    onSuccess: ({ library, pick: nextPick }) => {
      setProgress(null);
      setCurrentPick(nextPick);
      setNoPickMessage(getNoPickMessage(library, nextPick, "load"));
    },
    onError: (error) => {
      setProgress(null);

      if (error instanceof RandomAlbumSessionDeadError) {
        router.push("/");
      }
    },
  });

  const library = libraryMutation.data?.library ?? null;
  const libraryError = getLibraryError(libraryMutation.error);

  function handleToggle(type: AlbumType) {
    setSelection((current) => {
      const next = toggleAlbumType(current, type);
      if (hasSelectedAlbumType(next)) {
        setValidationError(null);
      }
      return next;
    });
  }

  function handleLoadLibrary() {
    if (!hasSelectedAlbumType(selection)) {
      setValidationError("Select at least one album type.");
      return;
    }

    libraryMutation.mutate(selection);
  }

  function handleReshuffle() {
    if (!library || !hasSelectedAlbumType(selection)) {
      setValidationError("Select at least one album type.");
      return;
    }

    setValidationError(null);
    setNoPickMessage(null);

    const nextPick = pick(library, selection);

    if (!nextPick) {
      setNoPickMessage(getNoPickMessage(library, nextPick, "reshuffle"));
      return;
    }

    setCurrentPick(nextPick);
  }

  return {
    selection,
    currentPick,
    progress,
    noPickMessage,
    errorMessage: validationError ?? libraryError,
    showReshuffle: currentPick !== null,
    isLoading: libraryMutation.isPending,
    handleToggle,
    handleLoadLibrary,
    handleReshuffle,
  };
}

function getNoPickMessage(
  library: Album[],
  nextPick: Album | null,
  context: "load" | "reshuffle",
): string | null {
  if (library.length === 0) {
    return "The Library has no saved albums.";
  }

  if (!nextPick) {
    return context === "reshuffle"
      ? "Nothing in the Library matches these types. Turn on another type or Re-shuffle again."
      : "Nothing in the Library matches these types. Turn on another type or try again.";
  }

  return null;
}

function getLibraryError(error: unknown): string | null {
  if (error instanceof LibraryLoadError) {
    return error.message;
  }

  if (error) {
    return "Something went wrong. Try again.";
  }

  return null;
}
