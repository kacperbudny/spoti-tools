"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { SURFACE_PATH } from "@/lib/auth/surfaces";

export async function signInWithSpotify() {
  const result = await auth.api.signInSocial({
    body: {
      provider: "spotify",
      callbackURL: SURFACE_PATH.dashboard,
      errorCallbackURL: SURFACE_PATH.landing,
      disableRedirect: true,
    },
    headers: await headers(),
  });

  if (result.url) {
    redirect(result.url);
  }

  redirect(`${SURFACE_PATH.landing}?error=sign_in_failed`);
}

export async function signOut() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    redirect(SURFACE_PATH.landing);
  }
  await auth.api.signOut({ headers: requestHeaders });
  redirect(SURFACE_PATH.landing);
}
