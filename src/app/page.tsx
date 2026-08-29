import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signInWithSpotify } from "@/lib/auth/actions";
import { getSession } from "@/lib/auth/session";

export default async function LandingPage({ searchParams }: PageProps<"/">) {
  const session = await getSession();

  if (session) {
    redirect("/app");
  }

  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      {error ? (
        <p role="alert">Sign-in did not complete. You can try again.</p>
      ) : null}
      <form action={signInWithSpotify}>
        <Button type="submit">Sign-in with Spotify</Button>
      </form>
    </main>
  );
}
