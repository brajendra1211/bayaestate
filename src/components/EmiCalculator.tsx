"use client";

import { useMemo, useState } from "react";

function formatInr(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function EmiCalculator({ defaultPrice }: { defaultPrice?: number | null }) {
  const [principal, setPrincipal] = useState(defaultPrice ? Math.round(defaultPrice * 0.8) : 5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0 || principal <= 0 || months <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: 0 };
    }
    const factor = Math.pow(1 + monthlyRate, months);
    const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
    const total = monthlyEmi * months;
    return { emi: monthlyEmi, totalInterest: total - principal, totalPayment: total };
  }, [principal, rate, years]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">EMI Calculator</h3>

      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-slate-700">Loan amount</label>
            <span className="text-slate-600">{formatInr(principal)}</span>
          </div>
          <input
            type="range"
            min={100000}
            max={50000000}
            step={100000}
            value={principal}
            onChange={(event) => setPrincipal(Number(event.target.value))}
            className="mt-1 w-full accent-blue-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-slate-700">Interest rate</label>
            <span className="text-slate-600">{rate}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={15}
            step={0.1}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="mt-1 w-full accent-blue-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-slate-700">Tenure</label>
            <span className="text-slate-600">{years} years</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(event) => setYears(Number(event.target.value))}
            className="mt-1 w-full accent-blue-600"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="text-xs text-slate-500">Monthly EMI</p>
        <p className="text-2xl font-bold text-slate-900">{formatInr(emi)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
          <div>
            <p>Total interest</p>
            <p className="font-medium text-slate-700">{formatInr(totalInterest)}</p>
          </div>
          <div>
            <p>Total payment</p>
            <p className="font-medium text-slate-700">{formatInr(totalPayment)}</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Indicative only — actual EMI depends on the lender&apos;s terms.
      </p>
    </div>
  );
}
