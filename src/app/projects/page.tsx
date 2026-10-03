import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import type { Prisma } from "@/generated/prisma/client";

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

type SearchParams = Promise<{ status?: string }>;

const PROJECT_STATUSES = new Set(["UPCOMING", "UNDER_CONSTRUCTION", "READY_TO_MOVE"]);

export function generateMetadata(): Metadata {
  const title = "New Real Estate Projects";
  const description = "Browse upcoming, under-construction and ready-to-move projects from verified developers.";
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/projects") },
  };
}

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams;
  const statusFilter = status && PROJECT_STATUSES.has(status) ? status : undefined;

  const where: Prisma.ProjectWhereInput | undefined = statusFilter
    ? { status: statusFilter as Prisma.ProjectWhereInput["status"] }
    : undefined;

  const projects = await prisma.project.findMany({
    where,
    include: {
      developer: { select: { name: true, slug: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {statusFilter === "UPCOMING" ? "Latest Launches" : "New Projects"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Explore residential and commercial projects from verified developers.
      </p>

      {projects.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No projects listed yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const image = project.images[0]?.url;
            const place = [project.locality, project.city].filter(Boolean).join(", ");
            return (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="overflow-hidden rounded-2xl border border-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  {image ? (
                    <Image
                      src={image}
                      alt={project.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No photo</div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                  </span>
                </div>
                <div className="space-y-1 p-4">
                  <h2 className="truncate font-semibold text-slate-900">{project.name}</h2>
                  <p className="truncate text-sm text-slate-500">{place || "—"}</p>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
