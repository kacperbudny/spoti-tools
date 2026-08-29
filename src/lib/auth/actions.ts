"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function signInWithSpotify() {
  const result = await auth.api.signInSocial({
    body: {
      provider: "spotify",
      callbackURL: "/app",
      errorCallbackURL: "/",
      disableRedirect: true,
    },
    headers: await headers(),
  });

  if (result.url) {
    redirect(result.url);
  }

  redirect("/?error=sign_in_failed");
}

export async function signOut() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    redirect("/");
  }

  await auth.api.signOut({ headers: requestHeaders });
  redirect("/");
}
