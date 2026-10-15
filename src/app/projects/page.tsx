import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import { ProjectsGrid, type ProjectSummary } from "@/components/ProjectsGrid";
import type { Prisma } from "@/generated/prisma/client";

type SearchParams = Promise<{ status?: string; city?: string }>;

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
  const { status, city } = await searchParams;
  const statusFilter = status && PROJECT_STATUSES.has(status) ? status : undefined;

  const where: Prisma.ProjectWhereInput | undefined =
    statusFilter || city
      ? {
          ...(statusFilter ? { status: statusFilter as Prisma.ProjectWhereInput["status"] } : {}),
          ...(city ? { city: { contains: city } } : {}),
        }
      : undefined;

  const projects = await prisma.project.findMany({
    where,
    include: {
      developer: { select: { name: true, slug: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const summaries: ProjectSummary[] = projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    name: project.name,
    status: project.status,
    priceMin: project.priceMin,
    priceMax: project.priceMax,
    image: project.images[0]?.url ?? null,
    place: [project.locality, project.city].filter(Boolean).join(", "),
    developerName: project.developer.name,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-24 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {statusFilter === "UPCOMING" ? "Latest Launches" : "New Projects"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Explore residential and commercial projects from verified developers.
      </p>

      {summaries.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No projects listed yet.
        </p>
      ) : (
        <div className="mt-8">
          <ProjectsGrid projects={summaries} />
        </div>
      )}
    </div>
  );
}
