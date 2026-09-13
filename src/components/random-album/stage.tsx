"use client";

import { Disc3 } from "lucide-react";
import { AlbumPick } from "@/components/random-album/album-pick";
import { useRandomAlbum } from "@/components/random-album/use-random-album";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ALBUM_TYPE_LABELS, ALBUM_TYPES } from "@/lib/random-album/album-types";
import { cn } from "@/lib/utils";

export function RandomAlbumStage() {
  const {
    selection,
    currentPick: pick,
    progress,
    errorMessage,
    isLoading,
    handleToggle: onToggle,
    handleDraw: onDraw,
  } = useRandomAlbum();
  return (
    <section className="flex w-full max-w-lg flex-1 flex-col gap-8 pb-[env(safe-area-inset-bottom)]">
      <header className="flex flex-col gap-5">
        <h1 className="flex items-center gap-3 font-heading text-3xl font-medium tracking-tight">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cta text-cta-foreground"
          >
            <Disc3 className="size-5" />
          </span>
          Random album
        </h1>
        <fieldset
          className="grid w-full grid-cols-3 gap-2 md:flex md:w-auto md:flex-wrap"
          disabled={isLoading}
        >
          <legend className="sr-only">Album type</legend>
          {ALBUM_TYPES.map((type) => (
            <div
              key={type}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-center text-xs leading-tight md:flex-row md:items-center md:gap-2 md:px-3 md:text-left md:text-sm",
                selection[type]
                  ? "bg-cta/15 text-foreground"
                  : "bg-muted/60 text-muted-foreground",
              )}
            >
              <span id={`album-type-${type}-label`}>
                {ALBUM_TYPE_LABELS[type]}
              </span>
              <Switch
                size="sm"
                checked={selection[type]}
                onCheckedChange={() => onToggle(type)}
                aria-labelledby={`album-type-${type}-label`}
                className="data-checked:border-cta data-checked:bg-cta [&_[data-slot=switch-thumb]]:data-checked:bg-cta-foreground"
              />
            </div>
          ))}
        </fieldset>
      </header>

      {isLoading && progress ? (
        <Progress
          value={libraryLoadPercent(progress)}
          className="w-full flex-col gap-2"
        >
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Loading Library: {progress.loaded} out of {progress.total}…
          </p>
        </Progress>
      ) : null}

      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {pick ? (
        <div className="flex flex-col gap-6">
          <AlbumPick album={pick} />
          <div className="flex flex-col gap-2">
            <a
              href={pick.listenUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "h-12 w-full")}
            >
              Listen on Spotify
            </a>
            <Button
              type="button"
              variant="ghost"
              onClick={onDraw}
              disabled={isLoading}
              className="w-full text-muted-foreground"
            >
              Re-shuffle
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-auto">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full"
            onClick={onDraw}
            disabled={isLoading}
          >
            Start
          </Button>
        </div>
      )}
    </section>
  );
}

function libraryLoadPercent(progress: { loaded: number; total: number }) {
  if (progress.total === 0) {
    return 0;
  }

  return (progress.loaded / progress.total) * 100;
}
