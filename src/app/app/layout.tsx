import { redirect } from "next/navigation";
import { UserChrome } from "@/components/app/user-chrome";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/app">) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-8">
      <UserChrome user={session.user} />
      {children}
    </main>
  );
}
