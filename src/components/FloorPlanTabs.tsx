"use client";

import { useState } from "react";

export type FloorPlanRow = {
  id: string;
  configuration: string;
  areaSqft: number;
  price: number | null;
  imageUrl: string | null;
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function FloorPlanTabs({ floorPlans }: { floorPlans: FloorPlanRow[] }) {
  const configurations = Array.from(new Set(floorPlans.map((plan) => plan.configuration)));
  const [active, setActive] = useState(configurations[0] ?? "");

  if (configurations.length === 0) return null;

  const rows = floorPlans.filter((plan) => plan.configuration === active);
  const images = rows.filter((plan) => plan.imageUrl).map((plan) => plan.imageUrl as string);

  return (
    <div>
      {configurations.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {configurations.map((config) => (
            <button
              key={config}
              type="button"
              onClick={() => setActive(config)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active === config ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {config}
            </button>
          ))}
        </div>
      )}

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
            {rows.map((plan) => (
              <tr key={plan.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{plan.configuration}</td>
                <td className="px-4 py-3 text-slate-600">{plan.areaSqft.toLocaleString("en-IN")} sqft</td>
                <td className="px-4 py-3 text-slate-600">{plan.price ? inr.format(plan.price) : "Price on request"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt={`${active} floor plan`} className="w-full rounded-xl border border-slate-200 object-contain" />
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-slate-400">
        Dimensions and areas are as provided by the developer and are indicative, not guaranteed.
      </p>
    </div>
  );
}
