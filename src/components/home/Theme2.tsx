import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { NearMeButton } from "@/components/NearMeButton";
import type { HomeThemeProps } from "./types";

const TRUST_BADGES = [
  { label: "Verified listings", icon: "M5 13l4 4L19 7" },
  { label: "No hidden charges", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Direct owner & dealer contact", icon: "M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 8a3 3 0 110 6M21 20c0-2.8-2-5.1-4.7-5.8M12 8a3 3 0 110-6 3 3 0 010 6z" },
];

// A visually distinct alternate homepage design, selectable from the admin
// panel — split hero with a decorative photo panel, trust badges, and a
// gradient CTA banner instead of Theme 1's centered/plain layout. Reuses
// PropertyCard so listing cards stay consistent with the rest of the site.
export function Theme2({
  settings,
  featuredProperties,
  location,
  usingLatestFallback,
  isCityScoped,
}: HomeThemeProps) {
  return (
    <div>
      <section className="bg-slate-900">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
              {settings.siteName}
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {settings.heroTitle ?? "Find the right property, faster"}
            </h1>
            <p className="mt-4 max-w-lg text-slate-300">
              {settings.heroSubtitle ??
                "Buy, sell, and rent homes with verified agents across the city."}
            </p>
            <div className="mt-8">
              <SearchBar />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <NearMeButton />
              <Link
                href="/properties-in"
                className="text-sm font-medium text-slate-300 underline-offset-2 hover:text-white hover:underline"
              >
                Or browse by location
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {TRUST_BADGES.map((badge) => (
                <li key={badge.label} className="flex items-center gap-2 text-sm text-slate-300">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-amber-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                  </svg>
                  {badge.label}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-cover bg-center shadow-2xl ${
              settings.heroImage ? "" : "bg-gradient-to-br from-amber-600 via-slate-800 to-slate-900"
            }`}
            style={settings.heroImage ? { backgroundImage: `url(${settings.heroImage})` } : undefined}
          >
            {!settings.heroImage && (
              <div className="flex h-full items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-20 w-20 text-white/20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M4 21h16" />
                </svg>
              </div>
            )}
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
              <p className="text-xs font-medium text-slate-500">
                {usingLatestFallback ? "Latest listing" : "Featured listing"}
              </p>
              <p className="mt-0.5 truncate font-semibold text-slate-900">
                {featuredProperties[0]?.title ?? "New listings added every day"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="block h-1 w-10 rounded-full bg-amber-500" />
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                {usingLatestFallback ? "Latest properties" : "Featured properties"}
                {isCityScoped && location ? ` in ${location.cityName}` : ""}
              </h2>
            </div>
            <Link
              href={location ? `/properties?city=${encodeURIComponent(location.cityName)}` : "/properties"}
              className="text-sm font-semibold text-amber-600 hover:underline"
            >
              View all listings →
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
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 to-slate-900 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Are you an agent or owner?</h2>
          <p className="mx-auto mt-2 max-w-xl text-amber-50">
            List your properties on {settings.siteName} and reach buyers and tenants directly.
          </p>
          <Link
            href={settings.ctaLink ?? "/register"}
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-50"
          >
            {settings.ctaText ?? "List a property"}
          </Link>
        </div>
      </section>
    </div>
  );
}
