import Link from "next/link";
import { UserChrome } from "@/components/app/user-chrome";
import { RandomAlbumIdleForm } from "@/components/random-album/idle-form";
import { getSession } from "@/lib/auth/session";

export default async function RandomAlbumPage() {
  const session = await getSession();

  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-8">
      <UserChrome displayName={session?.user.name ?? ""} />
      <nav className="w-full max-w-lg">
        <Link
          href="/app"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to Dashboard
        </Link>
      </nav>
      <RandomAlbumIdleForm />
    </main>
  );
}
