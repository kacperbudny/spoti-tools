"use client";

import { ListMusic, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useArtistPick } from "@/components/artist-playlist/use-artist-pick";
import { useArtistSearch } from "@/components/artist-playlist/use-artist-search";
import { useSavePlaylist } from "@/components/artist-playlist/use-save-playlist";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import type { Artist } from "@/lib/artist-playlist/artist";
import {
  RELEASE_GROUP_LABELS,
  RELEASE_GROUPS,
  type ReleaseGroup,
  type ReleaseGroupSelection,
} from "@/lib/artist-playlist/release-groups";
import type { SavePlaylistResponse } from "@/lib/artist-playlist/save-playlist-response";
import { cn } from "@/lib/utils";

export function ArtistPlaylistStage() {
  const search = useArtistSearch();
  const pick = useArtistPick(search.matches);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    if (search.handleSearch(event)) {
      pick.clearPick();
    }
  }

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

      {pick.pickedArtist ? (
        <ArtistPlaylistConfigureStep
          artist={pick.pickedArtist}
          selection={pick.selection}
          canSave={pick.canSave}
          onChangeArtist={pick.clearPick}
          onToggle={pick.handleToggle}
        />
      ) : (
        <ArtistPlaylistSearchStep
          query={search.query}
          matches={search.matches}
          isSearching={search.isSearching}
          hasSearched={search.hasSearched}
          errorMessage={search.errorMessage}
          onQueryChange={search.setQuery}
          onSearch={handleSearch}
          onPick={pick.handlePick}
        />
      )}
    </section>
  );
}

function ArtistPlaylistConfigureStep({
  artist,
  selection,
  canSave,
  onChangeArtist,
  onToggle,
}: {
  artist: Artist;
  selection: ReleaseGroupSelection;
  canSave: boolean;
  onChangeArtist: () => void;
  onToggle: (group: ReleaseGroup) => void;
}) {
  const save = useSavePlaylist(selection);

  if (save.result?.kind === "created") {
    return (
      <PlaylistSavedScreen
        title={save.result.title}
        trackCount={save.result.trackCount}
        url={save.result.url}
        truncated={save.result.truncated}
        onChooseAnother={onChangeArtist}
      />
    );
  }

  return (
    <>
      <div className="flex w-full flex-col items-start gap-2">
        <SelectedArtist artist={artist} />
        <ChangeArtistButton onClick={onChangeArtist} />
      </div>
      <ReleaseGroupFieldset selection={selection} onToggle={onToggle} />
      <SavePlaylistForm
        artist={artist}
        selection={selection}
        canSave={canSave}
        save={save}
      />
    </>
  );
}

function SavePlaylistForm({
  artist,
  selection,
  canSave,
  save,
}: {
  artist: Artist;
  selection: ReleaseGroupSelection;
  canSave: boolean;
  save: ReturnType<typeof useSavePlaylist>;
}) {
  return (
    <>
      <SavePlaylistButton
        disabled={!canSave || save.isSaving}
        pending={save.isSaving}
        onSave={() =>
          save.save({
            artistId: artist.id,
            artistName: artist.name,
            selection,
          })
        }
      />
      {save.isSaving ? (
        <SavePlaylistProgress
          label={save.progress?.label ?? "Retrieving the artist's songs"}
          percent={save.progress?.percent ?? null}
        />
      ) : null}
      <SavePlaylistOutcome
        result={save.result}
        errorMessage={save.errorMessage}
      />
    </>
  );
}

function ArtistPlaylistSearchStep({
  query,
  matches,
  isSearching,
  hasSearched,
  errorMessage,
  onQueryChange,
  onSearch,
  onPick,
}: {
  query: string;
  matches: Artist[];
  isSearching: boolean;
  hasSearched: boolean;
  errorMessage: string | null;
  onQueryChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onPick: (artistId: string) => void;
}) {
  return (
    <>
      <ArtistSearchForm
        query={query}
        isSearching={isSearching}
        onQueryChange={onQueryChange}
        onSearch={onSearch}
      />

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

      {hasSearched && matches.length === 0 ? (
        <output className="block text-sm text-muted-foreground">
          No artists match that name.
        </output>
      ) : null}

      {matches.length > 0 ? (
        <ArtistMatchList matches={matches} onPick={onPick} />
      ) : null}
    </>
  );
}

function ArtistSearchForm({
  query,
  isSearching,
  onQueryChange,
  onSearch,
}: {
  query: string;
  isSearching: boolean;
  onQueryChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSearch} className="flex flex-col gap-3">
      <label htmlFor="artist-name" className="flex flex-col gap-2 text-sm">
        Artist name
        <Input
          id="artist-name"
          value={query}
          onValueChange={onQueryChange}
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
  );
}

function ArtistMatchList({
  matches,
  onPick,
}: {
  matches: Artist[];
  onPick: (artistId: string) => void;
}) {
  return (
    <ul aria-label="Matching artists" className="flex flex-col gap-2">
      {matches.map((artist) => (
        <li key={artist.id}>
          <ArtistMatch artist={artist} onPick={onPick} />
        </li>
      ))}
    </ul>
  );
}

function ChangeArtistButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="text-muted-foreground"
    >
      Choose a different artist
    </Button>
  );
}

function ReleaseGroupFieldset({
  selection,
  onToggle,
}: {
  selection: ReleaseGroupSelection;
  onToggle: (group: ReleaseGroup) => void;
}) {
  return (
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
            onCheckedChange={() => onToggle(group)}
            aria-labelledby={`release-group-${group}-label`}
            className="data-checked:border-cta data-checked:bg-cta [&_[data-slot=switch-thumb]]:data-checked:bg-cta-foreground"
          />
        </div>
      ))}
    </fieldset>
  );
}

function SavePlaylistButton({
  disabled,
  pending,
  onSave,
}: {
  disabled: boolean;
  pending: boolean;
  onSave: () => void;
}) {
  return (
    <Button
      type="button"
      size="lg"
      className="relative h-12 w-full overflow-hidden disabled:opacity-100"
      disabled={disabled}
      aria-busy={pending}
      onClick={onSave}
    >
      {pending ? <SaveButtonShimmer /> : null}
      <span className="relative flex items-center gap-2">
        {pending ? (
          <span className="animate-spin">
            <Loader2 />
          </span>
        ) : null}
        {pending ? "Saving…" : "Save"}
      </span>
    </Button>
  );
}

function SaveButtonShimmer() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <span className="absolute inset-y-0 w-1/2 animate-[save-shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </span>
  );
}

function SavePlaylistProgress({
  label,
  percent,
}: {
  label: string;
  percent: number | null;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {label}
      </p>
      <Progress value={percent} aria-label={label} className="w-full" />
    </div>
  );
}

function PlaylistSavedScreen({
  title,
  trackCount,
  url,
  truncated,
  onChooseAnother,
}: {
  title: string;
  trackCount: number;
  url: string;
  truncated: boolean;
  onChooseAnother: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-3xl font-medium tracking-tight">
          Playlist successfully saved
        </h2>
        <p className="text-lg">{title}</p>
        <p className="text-muted-foreground">{songCount(trackCount)}</p>
        {truncated ? (
          <p className="text-sm text-muted-foreground">
            The oldest 10,000 tracks were saved. The rest did not fit.
          </p>
        ) : null}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full")}
      >
        Open playlist on Spotify
      </a>
      <ChangeArtistButton onClick={onChooseAnother} />
    </div>
  );
}

function SavePlaylistOutcome({
  result,
  errorMessage,
}: {
  result: SavePlaylistResponse | null;
  errorMessage: string | null;
}) {
  const playlistUrl = result && result.kind !== "nothing" ? result.url : null;

  return (
    <>
      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      {result?.kind === "nothing" ? (
        <output className="block text-sm text-muted-foreground">
          There is nothing to save.
        </output>
      ) : null}
      {playlistUrl ? (
        <a
          href={playlistUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "h-12 w-full")}
        >
          Open playlist on Spotify
        </a>
      ) : null}
    </>
  );
}

function songCount(count: number) {
  return count === 1 ? "1 song" : `${count} songs`;
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
