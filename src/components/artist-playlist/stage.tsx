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
    pickedArtistId,
    canSave,
    isSearching,
    errorMessage,
    emptyMessage,
    setQuery,
    handleSearch,
    handleToggle,
    handlePick,
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
        <fieldset className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap">
          <legend className="sr-only">releases</legend>
          {RELEASE_GROUPS.map((group) => (
            <div
              key={group}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-center text-xs leading-tight md:flex-row md:items-center md:gap-2 md:px-3 md:text-left md:text-sm",
                selection[group]
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted/60 text-muted-foreground",
              )}
            >
              <span id={`release-group-${group}-label`}>
                {RELEASE_GROUP_LABELS[group]}
              </span>
              <Switch
                size="sm"
                checked={selection[group]}
                onCheckedChange={() => handleToggle(group)}
                aria-labelledby={`release-group-${group}-label`}
                className="data-checked:border-cta data-checked:bg-cta [&_[data-slot=switch-thumb]]:data-checked:bg-cta-foreground"
              />
            </div>
          ))}
        </fieldset>
      </header>

      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <label htmlFor="artist-name" className="flex flex-col gap-2 text-sm">
          Artist name
          <Input
            id="artist-name"
            value={query}
            onValueChange={setQuery}
            autoComplete="off"
            disabled={isSearching}
          />
        </label>
        <Button type="submit" disabled={isSearching || query.trim() === ""}>
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
              <ArtistMatch
                artist={artist}
                pressed={artist.id === pickedArtistId}
                onPick={handlePick}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full"
          disabled={!canSave}
        >
          Save
        </Button>
      </div>
    </section>
  );
}

function ArtistMatch({
  artist,
  pressed,
  onPick,
}: {
  artist: Artist;
  pressed: boolean;
  onPick: (artistId: string) => void;
}) {
  return (
    <Button
      type="button"
      variant={pressed ? "secondary" : "outline"}
      aria-pressed={pressed}
      onClick={() => onPick(artist.id)}
      className="h-auto w-full justify-start gap-3 px-3 py-2 whitespace-normal"
    >
      <ArtistImage artist={artist} />
      <span className="min-w-0 flex-1 truncate text-left">{artist.name}</span>
    </Button>
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
