import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth/server";
import { redirectFor, SURFACE_PATH, type Surface } from "@/lib/auth/surfaces";

export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function enforceSurface(opened: Surface) {
  const session = await getSession();
  const destination = redirectFor(session ? "user" : "visitor", opened);
  if (destination) {
    redirect(SURFACE_PATH[destination]);
  }
  return session;
}
