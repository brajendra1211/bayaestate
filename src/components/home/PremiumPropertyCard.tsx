import Image from "next/image";
import Link from "next/link";
import { formatPrice, PROPERTY_TYPE_LABELS } from "@/lib/format";
import type { PropertyCardData } from "@/components/PropertyCard";

// Theme 2's own listing-card treatment — image with a gradient-overlaid price
// badge instead of Theme 1/PropertyCard's plain layout, gold hover border to
// match the theme's premium styling.
export function PremiumPropertyCard({ property }: { property: PropertyCardData & { slug: string } }) {
  const image = property.images[0]?.url;

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={property.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No photo</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {property.listingType === "SALE" ? "For Sale" : "For Rent"}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white shadow-sm">
          {formatPrice(property.price, property.listingType)}
        </span>
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="truncate font-semibold text-slate-900">{property.title}</h3>
        <p className="truncate text-sm text-slate-500">
          {[property.locality, property.city].filter(Boolean).join(", ")}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-slate-500">
          <span>{PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType}</span>
          {property.bedrooms != null && <span>{property.bedrooms} Bed</span>}
          {property.bathrooms != null && <span>{property.bathrooms} Bath</span>}
          {property.areaSqft != null && <span>{property.areaSqft} sqft</span>}
        </div>
      </div>
    </Link>
  );
}
