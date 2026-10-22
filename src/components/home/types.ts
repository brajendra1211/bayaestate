import type { PropertyCardData } from "@/components/PropertyCard";
import type { LocationCookieValue } from "@/lib/location-context";
import type { getSiteSettings } from "@/lib/site-settings";
import type { Slide } from "@/components/HeroSlider";

export type HomeStats = {
  totalListings: number;
  totalCities: number;
  verifiedListers: number;
};

export type TopCity = { name: string; count: number };

export type HomeProject = {
  id: string;
  slug: string;
  name: string;
  status: string;
  priceMin: number | null;
  priceMax: number | null;
  images: { url: string }[];
  developer: { name: string };
};

export type HomeDealer = {
  id: string;
  name: string;
  company: string | null;
  slug: string | null;
  logoUrl: string | null;
  address: string | null;
  _count: { properties: number };
};

export type HomeThemeProps = {
  settings: Awaited<ReturnType<typeof getSiteSettings>>;
  featuredProperties: (PropertyCardData & { slug: string })[];
  location: LocationCookieValue | null;
  usingLatestFallback: boolean;
  isCityScoped: boolean;
  stats: HomeStats;
  topCities: TopCity[];
  slides: Slide[];
  featuredProjects: HomeProject[];
  featuredDealers: HomeDealer[];
};
