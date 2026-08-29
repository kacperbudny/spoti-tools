import { enforceSurface } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/app">) {
  await enforceSurface("dashboard");
  return children;
}
