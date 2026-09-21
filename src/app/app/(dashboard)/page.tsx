import { redirect } from "next/navigation";
import { Dashboard } from "@/components/app/dashboard";
import { InstallSection } from "@/components/app/install-section";
import { getSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <Dashboard displayName={session.user.name}>
      <InstallSection />
    </Dashboard>
  );
}
