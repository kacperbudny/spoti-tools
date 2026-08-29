import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/app">) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return children;
}
