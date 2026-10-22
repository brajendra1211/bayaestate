import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { NearMeButton } from "@/components/NearMeButton";
import { HeroSlider } from "@/components/HeroSlider";
import { FeaturedProjectsSection } from "./FeaturedProjectsSection";
import { FeaturedDealersSection } from "./FeaturedDealersSection";
import type { HomeThemeProps } from "./types";

// The original/default homepage design — kept exactly as it was before themes
// were introduced, so switching back to it from the admin panel is a safe,
// familiar fallback.
export function Theme1({
  settings,
  featuredProperties,
  location,
  usingLatestFallback,
  isCityScoped,
  slides,
  featuredProjects,
  featuredDealers,
}: HomeThemeProps) {
  return (
    <div>
      {slides.length > 0 ? (
        <div>
          <HeroSlider slides={slides} />
          {/* A clean, non-overlapping card right under the slider — pulled up
              just enough to visually "dock" onto the image without ever
              risking covering the slide's own bottom-anchored title/CTA. */}
          <div className="relative z-10 mx-auto -mt-6 max-w-xl px-4 sm:-mt-8 sm:px-6">
            <div className="rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-900/5 sm:p-5">
              <SearchBar />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <NearMeButton />
                <Link
                  href="/properties-in"
                  className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
                >
                  Or browse by location
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section
          className={`relative overflow-hidden bg-cover bg-center px-4 py-20 text-center text-white sm:px-6 ${
            settings.heroImage ? "" : "bg-gradient-to-b from-slate-900 to-slate-800"
          }`}
          style={settings.heroImage ? { backgroundImage: `url(${settings.heroImage})` } : undefined}
        >
          {settings.heroImage && <div className="absolute inset-0 bg-slate-900/55" />}
          <div className="relative">
            <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              {settings.heroTitle ?? "Find the right property, faster"}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              {settings.heroSubtitle ??
                "Buy, sell, and rent homes with verified agents across the city."}
            </p>
            <div className="mt-8">
              <SearchBar />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <NearMeButton />
              <Link
                href="/properties-in"
                className="text-sm font-medium text-slate-300 underline-offset-2 hover:text-white hover:underline"
              >
                Or browse by location
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {usingLatestFallback ? "Latest properties" : "Featured properties"}
            {isCityScoped && location ? ` in ${location.cityName}` : ""}
          </h2>
          <Link
            href={location ? `/properties?city=${encodeURIComponent(location.cityName)}` : "/properties"}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {featuredProperties.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No properties listed yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        )}
      </section>

      <FeaturedProjectsSection projects={featuredProjects} />
      <FeaturedDealersSection dealers={featuredDealers} />

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-14 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">Are you an agent or owner?</h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">
          List your properties on {settings.siteName} and reach buyers and tenants directly.
        </p>
        <Link
          href={settings.ctaLink ?? "/register"}
          className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {settings.ctaText ?? "List a property"}
        </Link>
      </section>
    </div>
  );
}
