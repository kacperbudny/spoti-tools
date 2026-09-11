import Link from "next/link";
import { InstallSection } from "@/components/app/install-section";
import { TOOL_DESTINATIONS } from "@/components/app/tool-destinations";

export default function DashboardPage() {
  return (
    <>
      <section className="flex w-full max-w-lg flex-col gap-3">
        <h1 className="text-lg font-medium">Tools</h1>
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {TOOL_DESTINATIONS.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="block px-4 py-3 transition-colors hover:bg-muted"
              >
                {tool.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <InstallSection />
    </>
  );
}
