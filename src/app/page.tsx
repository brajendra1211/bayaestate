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
      />
    </div>
  );
}
