import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import type { getSession } from "@/lib/auth/session";

type AppUser = NonNullable<Awaited<ReturnType<typeof getSession>>>["user"];

type UserChromeProps = {
  user: AppUser;
};

export function UserChrome({ user }: UserChromeProps) {
  return (
    <header className="flex w-full max-w-lg items-center justify-between gap-4">
      <p>{user.name}</p>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          Sign-out
        </Button>
      </form>
    </header>
  );
}
