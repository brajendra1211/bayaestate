import Image from "next/image";
import Link from "next/link";
import type { HomeProject } from "./types";

const PROJECT_STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  notation: "compact",
});

export function FeaturedProjectsSection({ projects }: { projects: HomeProject[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Featured Projects</h2>
        <Link href="/projects" className="text-sm font-medium text-blue-600 hover:underline">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="overflow-hidden rounded-2xl border border-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full bg-slate-100">
              {project.images[0]?.url ? (
                <Image
                  src={project.images[0].url}
                  alt={project.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                />
              ) : null}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {PROJECT_STATUS_LABELS[project.status] ?? project.status}
              </span>
            </div>
            <div className="space-y-1 p-4">
              <h3 className="truncate font-semibold text-slate-900">{project.name}</h3>
              <p className="text-sm text-slate-500">by {project.developer.name}</p>
              {(project.priceMin || project.priceMax) && (
                <p className="pt-1 text-sm font-semibold text-slate-900">
                  {project.priceMin ? inr.format(project.priceMin) : ""}
                  {project.priceMin && project.priceMax ? " – " : ""}
                  {project.priceMax ? inr.format(project.priceMax) : ""}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
