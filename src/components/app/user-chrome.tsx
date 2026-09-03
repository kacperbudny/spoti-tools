import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

type UserChromeProps = {
  displayName: string;
};

export function UserChrome({ displayName }: UserChromeProps) {
  return (
    <header className="flex w-full max-w-lg items-center justify-between gap-4">
      <p>{displayName}</p>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          Sign-out
        </Button>
      </form>
    </header>
  );
}
