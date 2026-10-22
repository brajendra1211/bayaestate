import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { FaqAccordion } from "@/components/FaqAccordion";
import { EmiCalculator } from "@/components/EmiCalculator";
import { BudgetCalculator } from "@/components/BudgetCalculator";
import { AreaConverter } from "@/components/AreaConverter";
import { AmenitiesGrid } from "@/components/AmenitiesGrid";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ZoomableImage } from "@/components/ZoomableImage";
import { FloorPlanTabs } from "@/components/FloorPlanTabs";
import { absoluteUrl } from "@/lib/seo";
import { getYoutubeEmbedUrl } from "@/lib/format";
import { parseAmenitiesString } from "@/lib/amenities";
import { PUBLIC_LISTER_FILTER, notExpiredFilter } from "@/lib/propertyVisibility";
import { submitProjectEnquiry } from "./actions";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ enquiry?: string }>;

const PROJECT_STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const KEY_FACT_ICONS: Record<string, string> = {
  "Total units": "M4 21V8l8-5 8 5v13M9 21v-6h6v6M4 21h16",
  "Project type": "M7 7h.01M3 11l8-8h8a2 2 0 012 2v8l-8 8-10-10z",
  Status: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  "Project size": "M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6M3 3l7 7m11-7l-7 7M3 21l7-7m11 7l-7-7",
  "Launch date": "M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z",
  "Possession date": "M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zM9 16l2 2 4-4",
  "Total towers": "M4 21V10l5-4 5 4v11M4 21h16M14 21v-7l5-3v10M9 13h1m-1 4h1",
  default: "M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z",
};

function parseLines(value: string | null) {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function getProject(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      developer: true,
      floorPlans: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      landmarks: { orderBy: { order: "asc" } },
      reraPhases: { orderBy: { order: "asc" } },
      units: {
        where: { approvalStatus: "APPROVED", owner: PUBLIC_LISTER_FILTER, ...notExpiredFilter() },
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const place = [project.locality, project.city].filter(Boolean).join(", ");
  const title = project.metaTitle ?? `${project.name}, ${place} — by ${project.developer.name}`;
  const description =
    project.metaDescription ??
    `${project.name} in ${place} by ${project.developer.name}. ${project.description.slice(0, 140)}`;
  const image = project.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/projects/${slug}`) },
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
  };
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { enquiry } = await searchParams;
  const project = await getProject(slug);
  if (!project) notFound();

  const [ongoingProjectsCount, suggestedProjects] = await Promise.all([
    prisma.project.count({
      where: { developerId: project.developerId, status: { not: "READY_TO_MOVE" } },
    }),
    prisma.project.findMany({
      where: { city: project.city, id: { not: project.id } },
      include: { images: { orderBy: { order: "asc" }, take: 1 }, developer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const highlights = parseLines(project.highlights);
  const youtubeEmbedUrl = project.youtubeUrl ? getYoutubeEmbedUrl(project.youtubeUrl) : null;
  const landmarksByCategory = project.landmarks.reduce<Record<string, typeof project.landmarks>>((acc, landmark) => {
    (acc[landmark.category] ??= []).push(landmark);
    return acc;
  }, {});

  const keyFacts = [
    project.totalUnits ? { label: "Total units", value: project.totalUnits.toLocaleString("en-IN") } : null,
    project.projectType ? { label: "Project type", value: project.projectType } : null,
    { label: "Status", value: PROJECT_STATUS_LABELS[project.status] },
    project.projectSizeAcres ? { label: "Project size", value: `${project.projectSizeAcres} acres` } : null,
    project.launchDate
      ? { label: "Launch date", value: project.launchDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) }
      : null,
    project.possessionDate
      ? { label: "Possession date", value: project.possessionDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) }
      : null,
    project.totalTowers ? { label: "Total towers", value: project.totalTowers.toLocaleString("en-IN") } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  const unitsPerAcre =
    project.totalUnits && project.projectSizeAcres ? Math.round(project.totalUnits / project.projectSizeAcres) : null;

  const statTiles = [
    project.projectSizeAcres ? { label: "Acres", value: `${project.projectSizeAcres}` } : null,
    project.totalTowers ? { label: "Towers", value: `${project.totalTowers}` } : null,
    project.unitLiftRatio ? { label: "Unit : Lift ratio", value: project.unitLiftRatio } : null,
    project.carParkingSpaces ? { label: "Car parking", value: `~${project.carParkingSpaces.toLocaleString("en-IN")}` } : null,
    project.totalUnits ? { label: "Apartments", value: `~${project.totalUnits.toLocaleString("en-IN")}` } : null,
    unitsPerAcre ? { label: "Units / acre", value: `~${unitsPerAcre}` } : null,
  ].filter((tile): tile is { label: string; value: string } => tile !== null);

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: project.name,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: project.images.map((image) => image.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: project.locality ?? project.city,
      addressRegion: project.city,
      addressCountry: "IN",
    },
    developer: {
      "@type": "Organization",
      name: project.developer.name,
      url: absoluteUrl(`/developers/${project.developer.slug}`),
    },
  };

  const faqJsonLd =
    project.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: project.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Developers", href: "/developers" },
          { label: project.developer.name, href: `/developers/${project.developer.slug}` },
          { label: project.name, href: `/projects/${project.slug}` },
        ]}
      />
      <JsonLd data={projectJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6">
        <ProjectGallery images={project.images} title={project.name} />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
              {project.reraPhases.length > 0
                ? project.reraPhases.map((phase) => (
                    <span
                      key={phase.id}
                      className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                    >
                      RERA ({phase.label}): {phase.reraNumber}
                    </span>
                  ))
                : project.reraNumber && (
                    <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      RERA Registered
                    </span>
                  )}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">{project.name}</h1>
            <p className="mt-1 text-slate-500">
              {[project.locality, project.city].filter(Boolean).join(", ")}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              by{" "}
              <Link href={`/developers/${project.developer.slug}`} className="text-blue-600 hover:underline">
                {project.developer.name}
              </Link>
            </p>

            {(project.priceMin || project.priceMax) && (
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {project.priceMin ? inr.format(project.priceMin) : ""}
                {project.priceMin && project.priceMax ? " – " : ""}
                {project.priceMax ? inr.format(project.priceMax) : ""}
              </p>
            )}
            {project.pricePerSqft && (
              <p className="mt-1 text-sm text-slate-500">
                Base price: <span className="font-medium text-slate-700">₹{project.pricePerSqft.toLocaleString("en-IN")} / sqft</span>
              </p>
            )}

            {project.possessionDate && (
              <p className="mt-2 text-sm text-slate-500">
                Possession: {project.possessionDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              {project.brochureUrl && (
                <a
                  href={project.brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  Download Brochure (PDF)
                </a>
              )}
              {project.priceListUrl && (
                <a
                  href={project.priceListUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  Download Price List
                </a>
              )}
            </div>

            {keyFacts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">Key Facts</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {keyFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-[18px] w-[18px]">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={KEY_FACT_ICONS[fact.label] ?? KEY_FACT_ICONS.default} />
                        </svg>
                      </span>
                      <span className="min-w-0">
                        <p className="text-xs text-slate-500">{fact.label}</p>
                        <p className="truncate text-sm font-semibold text-slate-900">{fact.value}</p>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {highlights.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">{project.name} Highlights</h2>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {highlights.map((line) => (
                    <div
                      key={line}
                      className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50/60 p-3 text-sm text-slate-700"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="pt-0.5">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {statTiles.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {statTiles.map((tile) => (
                  <div key={tile.label} className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-lg font-bold text-slate-900">{tile.value}</p>
                    <p className="text-xs text-slate-500">{tile.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">About {project.name}</h2>
              <p className="mt-2 whitespace-pre-line text-slate-600">{project.description}</p>
            </div>

            {youtubeEmbedUrl && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">Video</h2>
                <div className="relative mt-2 aspect-video overflow-hidden rounded-2xl bg-black">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`${project.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            )}

            {project.floorPlans.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">
                  {project.name} Floor Plans & Pricing
                </h2>
                <div className="mt-3">
                  <FloorPlanTabs floorPlans={project.floorPlans} />
                </div>
              </div>
            )}

            {(project.constructionStatusNote || project.approvalDate) && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">Possession &amp; Construction Status</h2>
                {project.constructionStatusNote && (
                  <p className="mt-2 whitespace-pre-line text-slate-600">{project.constructionStatusNote}</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-400">Status</p>
                    <p className="text-sm font-semibold text-slate-800">{PROJECT_STATUS_LABELS[project.status]}</p>
                  </div>
                  {project.launchDate && (
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-400">Launch date</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {project.launchDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  )}
                  {project.possessionDate && (
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-400">Possession (per RERA)</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {project.possessionDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  )}
                  {project.approvalDate && (
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-400">Approval date</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {project.approvalDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {project.sitePlanUrl && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">Site Plan</h2>
                <ZoomableImage
                  src={project.sitePlanUrl}
                  alt={`${project.name} site plan`}
                  className="mt-3 aspect-[4/3] w-full rounded-2xl border border-slate-200 bg-slate-50 sm:aspect-[16/9]"
                  sizes="(min-width: 1024px) 700px, 100vw"
                />
              </div>
            )}

            {project.amenities && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
                <div className="mt-3">
                  <AmenitiesGrid amenities={parseAmenitiesString(project.amenities)} />
                </div>
              </div>
            )}

            {project.address && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">Address</h2>
                <p className="mt-2 text-slate-600">{project.address}</p>
              </div>
            )}

            {Object.keys(landmarksByCategory).length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">Around {project.name}</h2>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(landmarksByCategory).map(([category, items]) => (
                    <div key={category} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{category}</p>
                      <ul className="mt-2 space-y-1.5">
                        {items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between text-sm text-slate-600">
                            <span>{item.name}</span>
                            <span className="font-medium text-slate-800">{item.distanceKm} km</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900">About {project.developer.name}</h2>
              {project.developer.about && (
                <p className="mt-2 text-sm text-slate-600">{project.developer.about}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="font-bold text-slate-900">{ongoingProjectsCount}</p>
                  <p className="text-xs text-slate-500">Ongoing project{ongoingProjectsCount === 1 ? "" : "s"}</p>
                </div>
                {project.developer.verified && (
                  <div>
                    <p className="font-bold text-slate-900">✓</p>
                    <p className="text-xs text-slate-500">Verified developer</p>
                  </div>
                )}
              </div>
              <Link
                href={`/developers/${project.developer.slug}`}
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View developer profile
              </Link>
            </div>

            {project.faqs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h2>
                <div className="mt-3">
                  <FaqAccordion items={project.faqs} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-2xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900">Interested in this project?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Send an enquiry and {project.developer.name} will get in touch.
                </p>

                {enquiry === "sent" && (
                  <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                    Thanks! Your enquiry has been sent.
                  </p>
                )}
                {enquiry === "error" && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    Please fill in your name and phone number.
                  </p>
                )}

                <form action={submitProjectEnquiry} className="mt-3 space-y-3">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="slug" value={project.slug} />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email (optional)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Message (optional)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Send enquiry
                  </button>
                </form>
              </div>

              <EmiCalculator defaultPrice={project.priceMin ?? project.priceMax} />
              <BudgetCalculator />
              <AreaConverter />
            </div>
          </div>
        </div>

        {project.units.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-slate-900">Available units</h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {project.units.map((unit) => (
                <PropertyCard key={unit.slug} property={unit} />
              ))}
            </div>
          </div>
        )}

        {suggestedProjects.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">More projects in {project.city}</h2>
              <Link href={`/projects?city=${encodeURIComponent(project.city)}`} className="text-sm font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {suggestedProjects.map((suggested) => (
                <Link
                  key={suggested.id}
                  href={`/projects/${suggested.slug}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-100">
                    {suggested.images[0]?.url ? (
                      <Image
                        src={suggested.images[0].url}
                        alt={suggested.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="truncate font-semibold text-slate-900">{suggested.name}</h3>
                    <p className="text-sm text-slate-500">by {suggested.developer.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
