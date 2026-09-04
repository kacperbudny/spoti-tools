import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

export type SpotifyAccessTokenResult =
  | { ok: true; accessToken: string }
  | { ok: false; reason: "session-dead" };

export async function getSpotifyAccessToken(): Promise<SpotifyAccessTokenResult> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    return { ok: false, reason: "session-dead" };
  }

  const accounts = await auth.api.listUserAccounts({ headers: requestHeaders });
  const spotifyAccount = accounts.find(
    (account) => account.providerId === "spotify",
  );

  if (!spotifyAccount) {
    return { ok: false, reason: "session-dead" };
  }

  try {
    const token = await auth.api.getAccessToken({
      body: { accountId: spotifyAccount.id },
      headers: requestHeaders,
    });

    return { ok: true, accessToken: token.accessToken };
  } catch {
    return { ok: false, reason: "session-dead" };
  }
}
