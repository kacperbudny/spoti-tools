import Link from "next/link";
import { RandomAlbumIdleForm } from "@/components/random-album/idle-form";

export default function RandomAlbumPage() {
  return (
    <>
      <nav className="w-full max-w-lg">
        <Link
          href="/app"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to Dashboard
        </Link>
      </nav>
      <RandomAlbumIdleForm />
    </>
  );
}
