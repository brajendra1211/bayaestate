import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { isPropertyExpired, daysUntil } from "@/lib/propertyVisibility";
import { renewPropertyAsAdmin, renewAllExpiredProperties } from "../actions";

const APPROVAL_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

const RENEW_WINDOW_DAYS = 7;

type SearchParams = Promise<{ renewed?: string }>;

export default async function AdminPropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { renewed } = await searchParams;

  const properties = await prisma.property.findMany({
    include: { owner: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const expiredCount = properties.filter((property) => isPropertyExpired(property.expiresAt)).length;

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All properties</h1>
          <p className="mt-1 text-sm text-slate-500">
            {properties.length} total listings
            {expiredCount > 0 && ` · ${expiredCount} expired`}
          </p>
        </div>
        {expiredCount > 0 && (
          <form action={renewAllExpiredProperties}>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Renew all {expiredCount} expired listings
            </button>
          </form>
        )}
      </div>

      {renewed === "1" && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Listing renewed for another 30 days.
        </p>
      )}
      {renewed === "all" && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          All expired listings renewed for another 30 days.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {properties.map((property) => {
          const expired = isPropertyExpired(property.expiresAt);
          const daysLeft = daysUntil(property.expiresAt);
          const showRenew = expired || (daysLeft !== null && daysLeft <= RENEW_WINDOW_DAYS);

          return (
            <div
              key={property.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{property.title}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${APPROVAL_STYLES[property.approvalStatus]}`}
                  >
                    {property.approvalStatus}
                  </span>
                  {expired ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Expired
                    </span>
                  ) : (
                    daysLeft !== null && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          daysLeft <= RENEW_WINDOW_DAYS ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        Expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                      </span>
                    )
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {[property.locality, property.city].filter(Boolean).join(", ")} ·{" "}
                  {formatPrice(property.price, property.listingType)}
                </p>
                <p className="text-xs text-slate-400">
                  by {property.owner.name} ({property.owner.email})
                </p>
              </div>
              <div className="flex items-center gap-2">
                {showRenew && (
                  <form action={renewPropertyAsAdmin}>
                    <input type="hidden" name="id" value={property.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-600"
                    >
                      Renew
                    </button>
                  </form>
                )}
                <Link
                  href={`/dashboard/properties/${property.id}/edit`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Manage
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
