"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  RELEASE_GROUPS,
  type ReleaseGroupSelection,
} from "@/lib/artist-playlist/release-groups";
import {
  requestSavePlaylist,
  SavePlaylistError,
} from "@/lib/artist-playlist/save-client";
import type { SavePlaylistResponse } from "@/lib/artist-playlist/save-playlist-response";
import type { SaveProgress } from "@/lib/artist-playlist/save-progress";
import { SessionDeadError } from "@/lib/auth/errors";

export function useSavePlaylist(selection: ReleaseGroupSelection) {
  const router = useRouter();
  const [result, setResult] = useState<SavePlaylistResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<SaveProgress | null>(null);
  const selectionKey = RELEASE_GROUPS.map((group) =>
    String(selection[group]),
  ).join();
  const [seenSelection, setSeenSelection] = useState(selectionKey);

  if (seenSelection !== selectionKey) {
    setSeenSelection(selectionKey);
    setResult(null);
    setErrorMessage(null);
    setProgress(null);
  }

  const saveMutation = useMutation({
    mutationFn: (input: Parameters<typeof requestSavePlaylist>[0]) =>
      requestSavePlaylist(input, setProgress),
    onMutate: () => {
      setResult(null);
      setErrorMessage(null);
      setProgress(null);
    },
    onSuccess: (value) => {
      setProgress(null);
      setResult(value);
    },
    onError: (error) => {
      if (error instanceof SessionDeadError) {
        router.push("/");
        return;
      }

      setErrorMessage(saveErrorMessage(error));
    },
  });

  return {
    result,
    errorMessage,
    progress,
    isSaving: saveMutation.isPending,
    save: saveMutation.mutate,
  };
}

function saveErrorMessage(error: unknown): string {
  if (error instanceof SavePlaylistError) {
    return error.message;
  }

  return "Something went wrong. Try again.";
}
