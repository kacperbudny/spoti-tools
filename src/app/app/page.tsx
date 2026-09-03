import Link from "next/link";

const TOOLS = [{ href: "/app/random-album", label: "Random album" }] as const;

export default function DashboardPage() {
  return (
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
  );
}
