"use client";

import { AlbumPick } from "@/components/random-album/album-pick";
import { useRandomAlbumIdleForm } from "@/components/random-album/use-random-album-idle-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ALBUM_TYPE_LABELS, ALBUM_TYPES } from "@/lib/random-album/album-types";

export function RandomAlbumIdleForm() {
  const {
    selection,
    currentPick,
    progress,
    errorMessage,
    showReshuffle,
    isLoading,
    handleToggle,
    handleLoadLibrary,
    handleReshuffle,
  } = useRandomAlbumIdleForm();

  return (
    <section className="flex w-full max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-lg font-medium">Random album</h1>
        <fieldset className="flex flex-col gap-3" disabled={isLoading}>
          <legend className="text-sm text-muted-foreground">Album type</legend>
          {ALBUM_TYPES.map((type) => (
            <Card key={type} size="sm">
              <CardContent className="flex items-center justify-between gap-4">
                <span id={`album-type-${type}-label`}>
                  {ALBUM_TYPE_LABELS[type]}
                </span>
                <Switch
                  checked={selection[type]}
                  onCheckedChange={() => handleToggle(type)}
                  aria-labelledby={`album-type-${type}-label`}
                />
              </CardContent>
            </Card>
          ))}
        </fieldset>
      </div>

      {isLoading && progress ? (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Loading Library: {progress.loaded} out of {progress.total}…
        </p>
      ) : null}

      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {currentPick ? <AlbumPick album={currentPick} /> : null}

      {showReshuffle ? (
        <Button type="button" onClick={handleReshuffle} disabled={isLoading}>
          Re-shuffle
        </Button>
      ) : (
        <Button type="button" onClick={handleLoadLibrary} disabled={isLoading}>
          Start
        </Button>
      )}
    </section>
  );
}
