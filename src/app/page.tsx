import { Button } from "@/components/ui/button";
import { signInWithSpotify } from "@/lib/auth/actions";
import { enforceSurface } from "@/lib/auth/session";
import { signInErrorMessage } from "@/lib/auth/sign-in-error";

export default async function LandingPage({ searchParams }: PageProps<"/">) {
  await enforceSurface("landing");
  const { error } = await searchParams;
  const message = signInErrorMessage(
    typeof error === "string"
      ? error
      : Array.isArray(error)
        ? error[0]
        : undefined,
  );

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      {message ? <p role="alert">{message}</p> : null}
      <form action={signInWithSpotify}>
        <Button type="submit">Sign-in with Spotify</Button>
      </form>
    </main>
  );
}
