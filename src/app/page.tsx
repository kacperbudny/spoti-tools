import { redirect } from "next/navigation";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { signInWithSpotify } from "@/lib/auth/actions";
import { getSession } from "@/lib/auth/session";

export default async function LandingPage({ searchParams }: PageProps<"/">) {
  const session = await getSession();

  if (session) {
    redirect("/app");
  }

  const { error } = landingSearchParamsSchema.parse(await searchParams);

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <form
        action={signInWithSpotify}
        className="flex w-full max-w-md flex-col items-center gap-4"
      >
        <Button type="submit" variant="cta" size="lg">
          Sign-in with Spotify
        </Button>
        {error ? (
          <p role="alert" className="text-center text-sm text-muted-foreground">
            Sign-in did not complete. You can try again.
          </p>
        ) : null}
      </form>
    </main>
  );
}

const landingSearchParamsSchema = z.object({
  error: z.union([z.string(), z.array(z.string())]).optional(),
});
