"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlbumPick } from "@/components/random-album/album-pick";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Album } from "@/lib/random-album/album";
import {
  ALBUM_TYPE_LABELS,
  ALBUM_TYPES,
  type AlbumTypeSelection,
  DEFAULT_ALBUM_TYPE_SELECTION,
  hasSelectedAlbumType,
  toggleAlbumType,
} from "@/lib/random-album/album-types";
import { pick } from "@/lib/random-album/pick";
import { startRandomAlbum } from "@/lib/random-album/start-client";

export function RandomAlbumIdleForm() {
  const router = useRouter();
  const [selection, setSelection] = useState<AlbumTypeSelection>(
    DEFAULT_ALBUM_TYPE_SELECTION,
  );
  const [library, setLibrary] = useState<Album[] | null>(null);
  const [currentPick, setCurrentPick] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<{
    loaded: number;
    total: number;
  } | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [noPickMessage, setNoPickMessage] = useState<string | null>(null);

  function handleToggle(type: (typeof ALBUM_TYPES)[number]) {
    setSelection((current) => {
      const next = toggleAlbumType(current, type);
      if (hasSelectedAlbumType(next)) {
        setStartError(null);
      }
      return next;
    });
  }

  async function handleStart() {
    if (!hasSelectedAlbumType(selection)) {
      setStartError("Select at least one album type.");
      return;
    }

    setStartError(null);
    setNoPickMessage(null);
    setIsLoading(true);
    setProgress(null);
    setCurrentPick(null);
    setLibrary(null);

    await startRandomAlbum(selection, {
      onProgress: (loaded, total) => {
        setProgress({ loaded, total });
      },
      onComplete: (loadedLibrary, nextPick) => {
        setLibrary(loadedLibrary);
        setCurrentPick(nextPick);
        setIsLoading(false);
        setProgress(null);

        if (loadedLibrary.length === 0) {
          setNoPickMessage("The Library has no saved albums.");
          return;
        }

        if (!nextPick) {
          setNoPickMessage(
            "Nothing in the Library matches these types. Turn on another type or Start again.",
          );
        }
      },
      onSpotifyError: (message) => {
        setIsLoading(false);
        setProgress(null);
        setStartError(message);
      },
      onSessionDead: () => {
        setIsLoading(false);
        setProgress(null);
        router.push("/");
      },
    });
  }

  function handleReshuffle() {
    if (!library || !hasSelectedAlbumType(selection)) {
      setStartError("Select at least one album type.");
      return;
    }

    setStartError(null);
    setNoPickMessage(null);

    const nextPick = pick(library, selection);

    if (!nextPick) {
      setNoPickMessage(
        "Nothing in the Library matches these types. Turn on another type or Re-shuffle again.",
      );
      return;
    }

    setCurrentPick(nextPick);
  }

  const showReshuffle = currentPick !== null;

  return (
    <section className="flex w-full max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-lg font-medium">Random album</h1>
        <fieldset className="flex flex-col gap-3" disabled={isLoading}>
          <legend className="text-sm text-muted-foreground">Album type</legend>
          {ALBUM_TYPES.map((type) => (
            <div
              key={type}
              className="group/field-label flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3"
            >
              <span id={`album-type-${type}-label`}>
                {ALBUM_TYPE_LABELS[type]}
              </span>
              <Switch
                checked={selection[type]}
                onCheckedChange={() => handleToggle(type)}
                aria-labelledby={`album-type-${type}-label`}
              />
            </div>
          ))}
        </fieldset>
      </div>

      {isLoading && progress ? (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Loading Library: {progress.loaded} out of {progress.total}…
        </p>
      ) : null}

      {startError ? (
        <p role="alert" className="text-sm text-destructive">
          {startError}
        </p>
      ) : null}

      {noPickMessage ? (
        <p className="text-sm text-muted-foreground">{noPickMessage}</p>
      ) : null}

      {currentPick ? <AlbumPick album={currentPick} /> : null}

      {showReshuffle ? (
        <Button type="button" onClick={handleReshuffle} disabled={isLoading}>
          Re-shuffle
        </Button>
      ) : (
        <Button type="button" onClick={handleStart} disabled={isLoading}>
          Start
        </Button>
      )}
    </section>
  );
}
