import "server-only";

import { loadArtistDiscography } from "@/lib/artist-playlist/load-discography";
import { planArtistPlaylist } from "@/lib/artist-playlist/plan-artist-playlist";
import type { ReleaseGroupSelection } from "@/lib/artist-playlist/release-groups";
import {
  findRememberedPlaylistId,
  rememberPlaylist,
} from "@/lib/artist-playlist/remember-playlist";
import type { SavePlaylistResponse } from "@/lib/artist-playlist/save-playlist-response";
import { SessionDeadError } from "@/lib/auth/errors";
import { getSession, getSpotifyAccessToken } from "@/lib/auth/session";
import { SpotifyClient } from "@/lib/spotify/client";

const PLAYLIST_WRITE_CHUNK = 100;

export async function saveArtistPlaylist(input: {
  artistId: string;
  artistName: string;
  selection: ReleaseGroupSelection;
}): Promise<SavePlaylistResponse> {
  const session = await getSession();

  if (!session) {
    throw new SessionDeadError();
  }

  const accessToken = await getSpotifyAccessToken();
  const client = new SpotifyClient(accessToken);
  const [rememberedPlaylistId, releases] = await Promise.all([
    findRememberedPlaylistId(session.user.id, input.artistId),
    loadArtistDiscography(client, input.artistId, input.selection),
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
    return {
      kind: "rewrite",
      url: `https://open.spotify.com/playlist/${plan.playlistId}`,
    };
  }

  const created = await client.createPrivatePlaylist(plan.title);
  await rememberPlaylist({
    userId: session.user.id,
    artistId: input.artistId,
    playlistId: created.id,
  });
  await writePlaylistTracks(client, created.id, plan.trackIds);

  return {
    kind: "created",
    url: created.external_urls.spotify,
    truncated: plan.truncated,
  };
}

async function writePlaylistTracks(
  client: SpotifyClient,
  playlistId: string,
  trackIds: string[],
): Promise<void> {
  const uris = trackIds.map((id) => `spotify:track:${id}`);
  const [first, ...rest] = chunk(uris, PLAYLIST_WRITE_CHUNK);

  if (!first) {
    return;
  }

  await client.replacePlaylistItems(playlistId, first);

  for (const part of rest) {
    await client.appendPlaylistItems(playlistId, part);
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
