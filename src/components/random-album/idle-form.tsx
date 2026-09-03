"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ALBUM_TYPE_LABELS,
  ALBUM_TYPES,
  type AlbumTypeSelection,
  DEFAULT_ALBUM_TYPE_SELECTION,
  hasSelectedAlbumType,
  toggleAlbumType,
} from "@/lib/random-album/album-types";

export function RandomAlbumIdleForm() {
  const [selection, setSelection] = useState<AlbumTypeSelection>(
    DEFAULT_ALBUM_TYPE_SELECTION,
  );
  const [startError, setStartError] = useState<string | null>(null);

  function handleToggle(type: (typeof ALBUM_TYPES)[number]) {
    setSelection((current) => {
      const next = toggleAlbumType(current, type);
      if (hasSelectedAlbumType(next)) {
        setStartError(null);
      }
      return next;
    });
  }

  function handleStart() {
    if (!hasSelectedAlbumType(selection)) {
      setStartError("Select at least one album type.");
      return;
    }

    setStartError(null);
  }

  return (
    <section className="flex w-full max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-lg font-medium">Random album</h1>
        <fieldset className="flex flex-col gap-3">
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
      {startError ? (
        <p role="alert" className="text-sm text-destructive">
          {startError}
        </p>
      ) : null}
      <Button type="button" onClick={handleStart}>
        Start
      </Button>
    </section>
  );
}
