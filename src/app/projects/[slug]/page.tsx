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
import { AmenitiesGrid } from "@/components/AmenitiesGrid";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ZoomableImage } from "@/components/ZoomableImage";
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
              {project.reraNumber && (
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

            {project.possessionDate && (
              <p className="mt-2 text-sm text-slate-500">
                Possession: {project.possessionDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            )}

            {project.brochureUrl && (
              <a
                href={project.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
                Download Brochure (PDF)
              </a>
            )}

            {highlights.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">{project.name} Highlights</h2>
                <ul className="mt-2 space-y-1.5">
                  {highlights.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {line}
                    </li>
                  ))}
                </ul>
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
                <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5">Configuration</th>
                        <th className="px-4 py-2.5">Area</th>
                        <th className="px-4 py-2.5">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.floorPlans.map((plan) => (
                        <tr key={plan.id}>
                          <td className="px-4 py-3 font-medium text-slate-800">{plan.configuration}</td>
                          <td className="px-4 py-3 text-slate-600">{plan.areaSqft.toLocaleString("en-IN")} sqft</td>
                          <td className="px-4 py-3 text-slate-600">
                            {plan.price ? inr.format(plan.price) : "Price on request"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
