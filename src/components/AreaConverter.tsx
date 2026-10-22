"use client";

import { useMemo, useState } from "react";

// All conversion factors expressed in square feet.
const UNITS: { key: string; label: string; perSqft: number }[] = [
  { key: "sqft", label: "Square Feet (sqft)", perSqft: 1 },
  { key: "sqyd", label: "Square Yards (sqyd)", perSqft: 1 / 9 },
  { key: "sqm", label: "Square Meters (sqm)", perSqft: 0.09290304 },
  { key: "acre", label: "Acres", perSqft: 1 / 43560 },
  { key: "hectare", label: "Hectares", perSqft: 1 / 107639.104 },
  { key: "bigha", label: "Bigha (North India, approx.)", perSqft: 1 / 27225 },
];

export function AreaConverter() {
  const [value, setValue] = useState(1000);
  const [unit, setUnit] = useState("sqft");

  const sqft = useMemo(() => {
    const factor = UNITS.find((u) => u.key === unit)?.perSqft ?? 1;
    return value / factor;
  }, [value, unit]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">Area Converter</h3>

      <div className="mt-4 flex gap-2">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {UNITS.map((u) => (
            <option key={u.key} value={u.key}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
        {UNITS.filter((u) => u.key !== unit).map((u) => (
          <div key={u.key} className="flex items-center justify-between">
            <span className="text-slate-500">{u.label}</span>
            <span className="font-medium text-slate-800">
              {(sqft * u.perSqft).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">Bigha varies by region — treat it as approximate.</p>
    </div>
  );
}
