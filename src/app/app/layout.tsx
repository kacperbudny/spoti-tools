import { redirect } from "next/navigation";
import { AuthenticatedShell } from "@/components/app/authenticated-shell";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/app">) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <AuthenticatedShell
      displayName={session.user.name}
      email={session.user.email}
    >
      {children}
    </AuthenticatedShell>
  );
}
