"use client";

import { ListMusic } from "lucide-react";
import { useArtistPlaylist } from "@/components/artist-playlist/use-artist-playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Artist } from "@/lib/artist-playlist/artist";
import {
  RELEASE_GROUP_LABELS,
  RELEASE_GROUPS,
} from "@/lib/artist-playlist/release-groups";
import { cn } from "@/lib/utils";

export function ArtistPlaylistStage() {
  const {
    query,
    selection,
    matches,
    pickedArtist,
    canSave,
    isSearching,
    errorMessage,
    emptyMessage,
    setQuery,
    handleSearch,
    handleToggle,
    handlePick,
    handleChangeArtist,
  } = useArtistPlaylist();

  return (
    <section className="flex w-full max-w-lg flex-1 flex-col gap-8 pb-[env(safe-area-inset-bottom)]">
      <header className="flex flex-col gap-5">
        <h1 className="flex items-center gap-3 font-heading text-3xl font-medium tracking-tight">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cta text-cta-foreground"
          >
            <ListMusic className="size-5" />
          </span>
          Artist playlist
        </h1>
      </header>

      {pickedArtist ? (
        <>
          <div className="flex w-full flex-col items-start gap-2">
            <SelectedArtist artist={pickedArtist} />
            <Button
              type="button"
              variant="ghost"
              onClick={handleChangeArtist}
              className="text-muted-foreground"
            >
              Choose a different artist
            </Button>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 w-full text-base">
              What do you want to include in your playlist?
            </legend>
            {RELEASE_GROUPS.map((group) => (
              <div
                key={group}
                className={cn(
                  "flex items-center gap-4 rounded-2xl pr-4 text-base",
                  selection[group]
                    ? "bg-foreground/10 text-foreground"
                    : "bg-muted/60 text-muted-foreground",
                )}
              >
                <label
                  id={`release-group-${group}-label`}
                  htmlFor={`release-group-${group}`}
                  className="min-w-0 flex-1 cursor-pointer py-4 pl-4"
                >
                  {RELEASE_GROUP_LABELS[group]}
                </label>
                <Switch
                  id={`release-group-${group}`}
                  checked={selection[group]}
                  onCheckedChange={() => handleToggle(group)}
                  aria-labelledby={`release-group-${group}-label`}
                  className="data-checked:border-cta data-checked:bg-cta [&_[data-slot=switch-thumb]]:data-checked:bg-cta-foreground"
                />
              </div>
            ))}
          </fieldset>
          <Button
            type="button"
            size="lg"
            className="h-12 w-full"
            disabled={!canSave}
          >
            Save
          </Button>
        </>
      ) : (
        <>
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <label
              htmlFor="artist-name"
              className="flex flex-col gap-2 text-sm"
            >
              Artist name
              <Input
                id="artist-name"
                value={query}
                onValueChange={setQuery}
                autoComplete="off"
                disabled={isSearching}
                className="h-12 px-4 text-base"
              />
            </label>
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full"
              disabled={isSearching || query.trim() === ""}
            >
              Search
            </Button>
          </form>

          {isSearching ? (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              Searching…
            </p>
          ) : null}

          {errorMessage ? (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {emptyMessage ? (
            <output className="block text-sm text-muted-foreground">
              {emptyMessage}
            </output>
          ) : null}

          {matches && matches.length > 0 ? (
            <ul aria-label="Matching artists" className="flex flex-col gap-2">
              {matches.map((artist) => (
                <li key={artist.id}>
                  <ArtistMatch artist={artist} onPick={handlePick} />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}

function SelectedArtist({ artist }: { artist: Artist }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-foreground/25 bg-foreground/15 px-4 py-3">
      <ArtistRow artist={artist} />
    </div>
  );
}

function ArtistMatch({
  artist,
  onPick,
}: {
  artist: Artist;
  onPick: (artistId: string) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onPick(artist.id)}
      className="h-auto w-full justify-start gap-3 px-3 py-2 whitespace-normal"
    >
      <ArtistRow artist={artist} />
    </Button>
  );
}

function ArtistRow({ artist }: { artist: Artist }) {
  return (
    <>
      <ArtistImage artist={artist} />
      <span className="min-w-0 flex-1 truncate text-left">{artist.name}</span>
    </>
  );
}

function ArtistImage({ artist }: { artist: Artist }) {
  if (!artist.imageUrl) {
    return (
      <span aria-hidden className="size-10 shrink-0 rounded-full bg-muted" />
    );
  }

  return (
    // biome-ignore lint/performance/noImgElement: Spotify artist images are external and dynamic.
    <img
      src={artist.imageUrl}
      alt=""
      className="size-10 shrink-0 rounded-full object-cover"
    />
  );
}
