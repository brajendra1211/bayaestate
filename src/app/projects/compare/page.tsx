import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Compare Projects",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ ids?: string }>;

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default async function CompareProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { ids } = await searchParams;
  const idList = (ids ?? "").split(",").filter(Boolean).slice(0, 3);

  const projects = idList.length
    ? await prisma.project.findMany({
        where: { id: { in: idList } },
        include: {
          developer: { select: { name: true, verified: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
          floorPlans: { orderBy: { order: "asc" } },
        },
      })
    : [];

  // Preserve the order the user picked them in.
  const ordered = idList.map((id) => projects.find((project) => project.id === id)).filter(Boolean) as typeof projects;

  const rows: { label: string; render: (p: (typeof ordered)[number]) => React.ReactNode }[] = [
    { label: "Developer", render: (p) => p.developer.name },
    { label: "Status", render: (p) => STATUS_LABELS[p.status] ?? p.status },
    { label: "Location", render: (p) => [p.locality, p.city].filter(Boolean).join(", ") || "—" },
    {
      label: "Price range",
      render: (p) => (p.priceMin || p.priceMax ? `${p.priceMin ? inr.format(p.priceMin) : "—"} – ${p.priceMax ? inr.format(p.priceMax) : "—"}` : "—"),
    },
    {
      label: "Configurations",
      render: (p) =>
        p.floorPlans.length
          ? p.floorPlans.map((fp) => fp.configuration).join(", ")
          : "—",
    },
    {
      label: "Possession",
      render: (p) => (p.possessionDate ? p.possessionDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"),
    },
    { label: "RERA", render: (p) => p.reraNumber ?? "Not registered" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Compare Projects</h1>

      {ordered.length < 2 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Pick at least 2 projects from the{" "}
          <Link href="/projects" className="text-blue-600 hover:underline">
            projects page
          </Link>{" "}
          to compare them.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm">
            <thead>
              <tr>
                <th className="w-40 border-b border-slate-200 bg-slate-50 p-3 text-left font-medium text-slate-500" />
                {ordered.map((project) => (
                  <th key={project.id} className="border-b border-slate-200 p-3 text-left align-top">
                    <div className="relative mb-2 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                      {project.images[0]?.url ? (
                        <Image src={project.images[0].url} alt={project.name} fill className="object-cover" sizes="200px" />
                      ) : null}
                    </div>
                    <Link href={`/projects/${project.slug}`} className="font-semibold text-slate-900 hover:underline">
                      {project.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="odd:bg-slate-50/50">
                  <td className="border-b border-slate-100 p-3 font-medium text-slate-500">{row.label}</td>
                  {ordered.map((project) => (
                    <td key={project.id} className="border-b border-slate-100 p-3 text-slate-700">
                      {row.render(project)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
