"use client";

import { useState } from "react";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";

export function SearchBar() {
  const [listingType, setListingType] = useState<"SALE" | "RENT">("SALE");

  return (
    <form
      action="/properties"
      className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-3 shadow-lg"
    >
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setListingType("SALE")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            listingType === "SALE" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setListingType("RENT")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            listingType === "RENT" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Rent
        </button>
      </div>
      <input type="hidden" name="listingType" value={listingType} />

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          name="city"
          placeholder="City or locality (e.g. Bengaluru)"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <select
          name="propertyType"
          defaultValue=""
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Any property type</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
