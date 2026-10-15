"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
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

export type ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  status: string;
  priceMin: number | null;
  priceMax: number | null;
  image: string | null;
  place: string;
  developerName: string;
};

const MAX_COMPARE = 3;

export function ProjectsGrid({ projects }: { projects: ProjectSummary[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const isSelected = selected.includes(project.id);
          return (
            <div
              key={project.id}
              className={`overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-md ${
                isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
              }`}
            >
              <Link href={`/projects/${project.slug}`} className="block">
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No photo</div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {STATUS_LABELS[project.status] ?? project.status}
                  </span>
                </div>
                <div className="space-y-1 p-4">
                  <h2 className="truncate font-semibold text-slate-900">{project.name}</h2>
                  <p className="truncate text-sm text-slate-500">{project.place || "—"}</p>
                  <p className="text-sm text-slate-500">by {project.developerName}</p>
                  {(project.priceMin || project.priceMax) && (
                    <p className="pt-1 text-sm font-semibold text-slate-900">
                      {project.priceMin ? inr.format(project.priceMin) : ""}
                      {project.priceMin && project.priceMax ? " – " : ""}
                      {project.priceMax ? inr.format(project.priceMax) : ""}
                    </p>
                  )}
                </div>
              </Link>
              <label className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(project.id)}
                  disabled={!isSelected && selected.length >= MAX_COMPARE}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Add to compare
              </label>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">
              {selected.length} project{selected.length > 1 ? "s" : ""} selected to compare
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
              <Link
                href={`/projects/compare?ids=${selected.join(",")}`}
                className={`rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 ${
                  selected.length < 2 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Compare
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
