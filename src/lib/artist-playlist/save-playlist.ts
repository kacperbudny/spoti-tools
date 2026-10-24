import "server-only";

import { loadArtistDiscography } from "@/lib/artist-playlist/load-discography";
import { planArtistPlaylist } from "@/lib/artist-playlist/plan-artist-playlist";
import type { Release } from "@/lib/artist-playlist/release";
import type { ReleaseGroupSelection } from "@/lib/artist-playlist/release-groups";
import {
  findRememberedPlaylistId,
  rememberPlaylist,
} from "@/lib/artist-playlist/remember-playlist";
import {
  createSaveLogger,
  type SaveLogger,
} from "@/lib/artist-playlist/save-log";
import type { SavePlaylistResponse } from "@/lib/artist-playlist/save-playlist-response";
import {
  type SaveProgress,
  saveProgress,
} from "@/lib/artist-playlist/save-progress";
import { SessionDeadError } from "@/lib/auth/errors";
import { getSession, getSpotifyAccessToken } from "@/lib/auth/session";
import { SpotifyClient } from "@/lib/spotify/client";
import { spotifyAlbumGroups } from "@/lib/spotify/map-discography";

const PLAYLIST_WRITE_CHUNK = 100;

export async function saveArtistPlaylist(
  input: {
    artistId: string;
    artistName: string;
    selection: ReleaseGroupSelection;
  },
  onProgress?: (progress: SaveProgress) => void,
): Promise<SavePlaylistResponse> {
  const log = createSaveLogger(input.artistId);
  log("start", {
    artist: input.artistName,
    groups: spotifyAlbumGroups(input.selection).join(",") || "none",
  });

  try {
    return await runSave(input, log, onProgress);
  } catch (error) {
    log("failed", {
      error: error instanceof Error ? error.name : "Error",
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function runSave(
  input: {
    artistId: string;
    artistName: string;
    selection: ReleaseGroupSelection;
  },
  log: SaveLogger,
  onProgress?: (progress: SaveProgress) => void,
): Promise<SavePlaylistResponse> {
  const session = await getSession();

  if (!session) {
    throw new SessionDeadError();
  }

  const accessToken = await getSpotifyAccessToken();
  const client = new SpotifyClient(accessToken);
  const [rememberedPlaylistId, releases] = await Promise.all([
    findRememberedPlaylistId(session.user.id, input.artistId),
    loadArtistDiscography(
      client,
      input.artistId,
      input.selection,
      (update) => {
        onProgress?.(saveProgress(update.stage, update.loaded, update.total));
      },
      log,
    ),
  ]);
  const plan = planArtistPlaylist({
    artistId: input.artistId,
    artistName: input.artistName,
    releases,
    selection: input.selection,
    rememberedPlaylistId,
  });

  if (plan.kind === "nothing") {
    log("plan", { kind: "nothing", releases: releases.length });
    return { kind: "nothing" };
  }

  log("plan", {
    kind: plan.kind,
    tracks: plan.trackIds.length,
    dropped: plan.droppedTrackIds.length,
    truncated: plan.truncated,
    playlistId: plan.kind === "rewrite" ? plan.playlistId : null,
    releases: releases.length,
  });

  if (plan.kind === "rewrite") {
    log("playlist private", { playlistId: plan.playlistId });
    await client.setPlaylistDescription(plan.playlistId);
    await client.makePlaylistPrivate(plan.playlistId, plan.title);
    log("finished", { kind: "rewrite", playlistId: plan.playlistId });
    return {
      kind: "rewrite",
      url: `https://open.spotify.com/playlist/${plan.playlistId}`,
    };
  }

  const writeSteps = Math.ceil(plan.trackIds.length / PLAYLIST_WRITE_CHUNK) + 2;
  onProgress?.(saveProgress("playlist", 0, writeSteps));
  log("playlist create", { tracks: plan.trackIds.length });
  const created = await client.createPrivatePlaylist(plan.title);
  log("playlist created", { playlistId: created.id });
  await rememberPlaylist({
    userId: session.user.id,
    artistId: input.artistId,
    playlistId: created.id,
  });
  await client.setPlaylistDescription(created.id);
  onProgress?.(saveProgress("playlist", 1, writeSteps));
  await writePlaylistTracks(
    client,
    created.id,
    plan.trackIds,
    log,
    (written) => {
      onProgress?.(saveProgress("playlist", written + 1, writeSteps));
    },
  );
  log("playlist private", { playlistId: created.id });
  await client.makePlaylistPrivate(created.id, plan.title);
  const coverUrl = await playlistCover(
    client,
    created.id,
    releases,
    plan.trackIds[0],
  );
  log("cover", { playlistId: created.id, found: coverUrl !== null });
  onProgress?.(saveProgress("playlist", writeSteps, writeSteps));
  log("finished", {
    kind: "created",
    playlistId: created.id,
    tracks: plan.trackIds.length,
  });

  return {
    kind: "created",
    url: created.external_urls.spotify,
    title: plan.title,
    trackCount: plan.trackIds.length,
    coverUrl,
    truncated: plan.truncated,
  };
}

async function writePlaylistTracks(
  client: SpotifyClient,
  playlistId: string,
  trackIds: string[],
  log: SaveLogger,
  onWritten?: (written: number) => void,
): Promise<void> {
  const uris = trackIds.map((id) => `spotify:track:${id}`);
  const [first, ...rest] = chunk(uris, PLAYLIST_WRITE_CHUNK);

  if (!first) {
    return;
  }

  const chunks = rest.length + 1;
  log("playlist write", {
    playlistId,
    chunk: 1,
    chunks,
    tracks: first.length,
  });
  await client.replacePlaylistItems(playlistId, first);
  onWritten?.(1);

  let written = 1;
  for (const part of rest) {
    log("playlist write", {
      playlistId,
      chunk: written + 1,
      chunks,
      tracks: part.length,
    });
    await client.appendPlaylistItems(playlistId, part);
    written += 1;
    onWritten?.(written);
  }
}

async function playlistCover(
  client: SpotifyClient,
  playlistId: string,
  releases: Release[],
  firstTrackId: string | undefined,
): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const coverUrl = await client.getPlaylistCoverUrl(playlistId);
      if (coverUrl) {
        return coverUrl;
      }
    } catch {
      break;
    }

    if (attempt < 2) {
      await delay(300);
    }
  }

  return releaseCover(releases, firstTrackId);
}

function releaseCover(
  releases: Release[],
  trackId: string | undefined,
): string | null {
  if (!trackId) {
    return null;
  }

  const release = releases.find((item) =>
    item.tracks.some((track) => track.id === trackId),
  );
  return release?.imageUrl ?? null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
