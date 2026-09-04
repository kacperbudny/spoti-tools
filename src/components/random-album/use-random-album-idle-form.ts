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
import { pick } from "@/lib/random-album/pick";
import {
  fetchRandomAlbumLibrary,
  RandomAlbumSessionDeadError,
  RandomAlbumStartError,
} from "@/lib/random-album/start-client";

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

  const startMutation = useMutation({
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
      setNoPickMessage(getNoPickMessage(library, nextPick, "start"));
    },
    onError: (error) => {
      setProgress(null);

      if (error instanceof RandomAlbumSessionDeadError) {
        router.push("/");
      }
    },
  });

  const library = startMutation.data?.library ?? null;
  const startError = getStartError(startMutation.error);

  function handleToggle(type: AlbumType) {
    setSelection((current) => {
      const next = toggleAlbumType(current, type);
      if (hasSelectedAlbumType(next)) {
        setValidationError(null);
      }
      return next;
    });
  }

  function handleStart() {
    if (!hasSelectedAlbumType(selection)) {
      setValidationError("Select at least one album type.");
      return;
    }

    startMutation.mutate(selection);
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
    errorMessage: validationError ?? startError,
    showReshuffle: currentPick !== null,
    isLoading: startMutation.isPending,
    handleToggle,
    handleStart,
    handleReshuffle,
  };
}

function getNoPickMessage(
  library: Album[],
  nextPick: Album | null,
  context: "start" | "reshuffle",
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

function getStartError(error: unknown): string | null {
  if (error instanceof RandomAlbumStartError) {
    return error.message;
  }

  if (error) {
    return "Something went wrong. Try again.";
  }

  return null;
}
