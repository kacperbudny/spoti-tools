import "server-only";

import { loadArtistDiscography } from "@/lib/artist-playlist/load-discography";
import { planArtistPlaylist } from "@/lib/artist-playlist/plan-artist-playlist";
import type { Release } from "@/lib/artist-playlist/release";
import type { ReleaseGroupSelection } from "@/lib/artist-playlist/release-groups";
import {
  findRememberedPlaylistId,
  rememberPlaylist,
} from "@/lib/artist-playlist/remember-playlist";
import type { SavePlaylistResponse } from "@/lib/artist-playlist/save-playlist-response";
import {
  type SaveProgress,
  saveProgress,
} from "@/lib/artist-playlist/save-progress";
import { SessionDeadError } from "@/lib/auth/errors";
import { getSession, getSpotifyAccessToken } from "@/lib/auth/session";
import { SpotifyClient } from "@/lib/spotify/client";

const PLAYLIST_WRITE_CHUNK = 100;

export async function saveArtistPlaylist(
  input: {
    artistId: string;
    artistName: string;
    selection: ReleaseGroupSelection;
  },
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
    loadArtistDiscography(client, input.artistId, input.selection, (update) => {
      onProgress?.(saveProgress(update.stage, update.loaded, update.total));
    }),
  ]);
  const plan = planArtistPlaylist({
    artistId: input.artistId,
    artistName: input.artistName,
    releases,
    selection: input.selection,
    rememberedPlaylistId,
  });

  if (plan.kind === "nothing") {
    return { kind: "nothing" };
  }

  if (plan.kind === "rewrite") {
    await client.setPrivatePlaylistDetails(plan.playlistId);
    return {
      kind: "rewrite",
      url: `https://open.spotify.com/playlist/${plan.playlistId}`,
    };
  }

  const writeSteps = Math.ceil(plan.trackIds.length / PLAYLIST_WRITE_CHUNK) + 2;
  onProgress?.(saveProgress("playlist", 0, writeSteps));
  const created = await client.createPrivatePlaylist(plan.title);
  await rememberPlaylist({
    userId: session.user.id,
    artistId: input.artistId,
    playlistId: created.id,
  });
  await client.setPrivatePlaylistDetails(created.id);
  onProgress?.(saveProgress("playlist", 1, writeSteps));
  await writePlaylistTracks(client, created.id, plan.trackIds, (written) => {
    onProgress?.(saveProgress("playlist", written + 1, writeSteps));
  });
  const coverUrl = await playlistCover(
    client,
    created.id,
    releases,
    plan.trackIds[0],
  );
  onProgress?.(saveProgress("playlist", writeSteps, writeSteps));

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
  onWritten?: (written: number) => void,
): Promise<void> {
  const uris = trackIds.map((id) => `spotify:track:${id}`);
  const [first, ...rest] = chunk(uris, PLAYLIST_WRITE_CHUNK);

  if (!first) {
    return;
  }

  await client.replacePlaylistItems(playlistId, first);
  onWritten?.(1);

  let written = 1;
  for (const part of rest) {
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
