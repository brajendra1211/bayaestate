import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/JsonLd";
import { Theme1 } from "@/components/home/Theme1";
import { Theme2 } from "@/components/home/Theme2";
import { getSiteSettings } from "@/lib/site-settings";
import { PUBLIC_LISTER_FILTER, notExpiredFilter } from "@/lib/propertyVisibility";
import { getLocationCookie } from "@/lib/location-context";
import { SITE_URL } from "@/lib/seo";

const HOME_THEMES = { theme1: Theme1, theme2: Theme2 } as const;

export default async function Home() {
  const [settings, location] = await Promise.all([getSiteSettings(), getLocationCookie()]);

  const baseFilter: Prisma.PropertyWhereInput = {
    approvalStatus: "APPROVED",
    status: "AVAILABLE",
    owner: PUBLIC_LISTER_FILTER,
    ...notExpiredFilter(),
  };
  const cityFilter: Prisma.PropertyWhereInput = location
    ? { city: { contains: location.cityName } }
    : {};

  const findHomepageProperties = (where: Prisma.PropertyWhereInput) =>
    prisma.property.findMany({
      where,
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

  let featuredProperties = await findHomepageProperties({ ...baseFilter, featured: true, ...cityFilter });
  let isCityScoped = Boolean(location);

  // Fall back to city-wide featured properties if there's nothing featured yet in the selected city.
  if (location && featuredProperties.length === 0) {
    featuredProperties = await findHomepageProperties({ ...baseFilter, featured: true });
    isCityScoped = false;
  }

  // Fall back to the latest listings if nothing has been marked featured yet,
  // so the homepage never looks empty while there are live listings.
  let usingLatestFallback = false;
  if (featuredProperties.length === 0) {
    usingLatestFallback = true;
    isCityScoped = Boolean(location);
    featuredProperties = await findHomepageProperties({ ...baseFilter, ...cityFilter });
  }

  // And if the selected city has no live listings at all, widen to the latest site-wide.
  if (location && usingLatestFallback && featuredProperties.length === 0) {
    isCityScoped = false;
    featuredProperties = await findHomepageProperties(baseFilter);
  }

  const findHomepageProjects = (where: Prisma.ProjectWhereInput) =>
    prisma.project.findMany({
      where,
      include: { images: { orderBy: { order: "asc" }, take: 1 }, developer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

  let featuredProjects = location
    ? await findHomepageProjects({ city: { contains: location.cityName } })
    : [];
  if (featuredProjects.length === 0) {
    featuredProjects = await findHomepageProjects({});
  }

  const featuredDealers = await prisma.user.findMany({
    where: { role: "DEALER", slug: { not: null }, verified: true },
    select: {
      id: true,
      name: true,
      company: true,
      slug: true,
      logoUrl: true,
      address: true,
      _count: { select: { properties: { where: { approvalStatus: "APPROVED", ...notExpiredFilter() } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const [totalListings, verifiedListers, distinctCities, cityGroups, slides] = await Promise.all([
    prisma.property.count({ where: baseFilter }),
    prisma.user.count({ where: { role: { in: ["DEALER", "OWNER"] }, verified: true } }),
    prisma.property.findMany({ where: baseFilter, select: { city: true }, distinct: ["city"] }),
    prisma.property.groupBy({
      by: ["city"],
      where: baseFilter,
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 6,
    }),
    prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, imageUrl: true, title: true, subtitle: true, ctaText: true, ctaLink: true },
    }),
  ]);

  const stats = { totalListings, totalCities: distinctCities.length, verifiedListers };
  const topCities = cityGroups.map((group) => ({ name: group.city, count: group._count.city }));

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: SITE_URL,
    logo: settings.logoUrl ? { "@type": "ImageObject", url: settings.logoUrl } : undefined,
    contactPoint: settings.contactPhone
      ? {
          "@type": "ContactPoint",
          telephone: settings.contactPhone,
          contactType: "customer service",
          email: settings.contactEmail ?? undefined,
        }
      : undefined,
    sameAs: [settings.instagramUrl, settings.facebookUrl, settings.youtubeUrl, settings.linkedinUrl].filter(
      Boolean
    ),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/properties?city={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const ThemeComponent = HOME_THEMES[settings.homeTheme as keyof typeof HOME_THEMES] ?? Theme1;

  return (
    <div>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <ThemeComponent
        settings={settings}
        featuredProperties={featuredProperties}
        location={location}
        usingLatestFallback={usingLatestFallback}
        isCityScoped={isCityScoped}
        stats={stats}
        topCities={topCities}
        slides={slides}
        featuredProjects={featuredProjects}
        featuredDealers={featuredDealers}
      />
    </div>
  );
}
