import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { getSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <p>{session?.user.name}</p>
      <form action={signOut}>
        <Button type="submit">Sign-out</Button>
      </form>
    </main>
  );
}
