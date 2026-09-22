import type { PropertyCardData } from "@/components/PropertyCard";
import type { LocationCookieValue } from "@/lib/location-context";
import type { getSiteSettings } from "@/lib/site-settings";

export type HomeThemeProps = {
  settings: Awaited<ReturnType<typeof getSiteSettings>>;
  featuredProperties: (PropertyCardData & { slug: string })[];
  location: LocationCookieValue | null;
  usingLatestFallback: boolean;
  isCityScoped: boolean;
};
