import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { SessionDeadError } from "@/lib/auth/errors";
import { auth } from "@/lib/auth/server";

export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function getSpotifyAccessToken(): Promise<string> {
  const session = await getSession();

  if (!session) {
    throw new SessionDeadError();
  }

  const requestHeaders = await headers();
  const accounts = await auth.api.listUserAccounts({ headers: requestHeaders });
  const spotifyAccount = accounts.find(
    (account) => account.providerId === "spotify",
  );

  if (!spotifyAccount) {
    throw new SessionDeadError();
  }

  try {
    const token = await auth.api.getAccessToken({
      body: { accountId: spotifyAccount.id },
      headers: requestHeaders,
    });

    return token.accessToken;
  } catch {
    throw new SessionDeadError();
  }
}
