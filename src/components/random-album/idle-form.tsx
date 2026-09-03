"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ALBUM_TYPE_LABELS,
  ALBUM_TYPES,
  type AlbumTypeSelection,
  DEFAULT_ALBUM_TYPE_SELECTION,
  toggleAlbumType,
} from "@/lib/random-album/album-types";

export function RandomAlbumIdleForm() {
  const [selection, setSelection] = useState<AlbumTypeSelection>(
    DEFAULT_ALBUM_TYPE_SELECTION,
  );

  function handleToggle(type: (typeof ALBUM_TYPES)[number]) {
    setSelection((current) => toggleAlbumType(current, type));
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
      <Button type="button">Start</Button>
    </section>
  );
}
