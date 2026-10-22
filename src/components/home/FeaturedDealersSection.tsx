import Link from "next/link";
import type { HomeDealer } from "./types";

export function FeaturedDealersSection({ dealers }: { dealers: HomeDealer[] }) {
  if (dealers.length === 0) return null;

  return (
    <section className="border-t border-slate-200 bg-slate-50 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured Dealers</h2>
          <Link href="/dealers" className="text-sm font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {dealers.map((dealer) => {
            const displayName = dealer.company ?? dealer.name;
            const content = (
              <>
                {dealer.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={dealer.logoUrl} alt={displayName} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-base font-bold text-blue-700">
                    {displayName.charAt(0)}
                  </div>
                )}
                <p className="mt-2 truncate text-sm font-semibold text-slate-900">{displayName}</p>
                {dealer.address && <p className="truncate text-xs text-slate-500">{dealer.address}</p>}
                <p className="mt-1 text-xs font-medium text-slate-600">
                  {dealer._count.properties} listing{dealer._count.properties === 1 ? "" : "s"}
                </p>
              </>
            );
            return dealer.slug ? (
              <Link
                key={dealer.id}
                href={`/dealers/${dealer.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {content}
              </Link>
            ) : (
              <div key={dealer.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
