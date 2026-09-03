import Link from "next/link";
import { UserChrome } from "@/components/app/user-chrome";
import { getSession } from "@/lib/auth/session";

const TOOLS = [{ href: "/app/random-album", label: "Random album" }] as const;

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-8">
      <UserChrome displayName={session?.user.name ?? ""} />
      <section className="flex w-full max-w-lg flex-col gap-3">
        <h1 className="text-lg font-medium">Tools</h1>
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="block px-4 py-3 transition-colors hover:bg-muted"
              >
                {tool.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
