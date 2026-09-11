import { redirect } from "next/navigation";
import { AuthenticatedShellFromRoute } from "@/components/app/authenticated-shell";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/app">) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <AuthenticatedShellFromRoute displayName={session.user.name}>
      {children}
    </AuthenticatedShellFromRoute>
  );
}
