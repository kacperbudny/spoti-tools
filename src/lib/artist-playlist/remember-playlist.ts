import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { artistPlaylist } from "@/db/schema";

export async function findRememberedPlaylistId(
  userId: string,
  artistId: string,
): Promise<string | null> {
  const rows = await db
    .select({ playlistId: artistPlaylist.playlistId })
    .from(artistPlaylist)
    .where(
      and(
        eq(artistPlaylist.userId, userId),
        eq(artistPlaylist.artistId, artistId),
      ),
    )
    .limit(1);

  return rows[0]?.playlistId ?? null;
}

export async function rememberPlaylist(input: {
  userId: string;
  artistId: string;
  playlistId: string;
}): Promise<void> {
  await db.insert(artistPlaylist).values({
    userId: input.userId,
    artistId: input.artistId,
    playlistId: input.playlistId,
  });
}
