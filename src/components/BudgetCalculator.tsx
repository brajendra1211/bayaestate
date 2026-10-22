"use client";

import { useMemo, useState } from "react";

function formatInr(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

// The inverse of an EMI calculation: given what someone can pay each month,
// work out how large a loan that supports, then add the down payment back
// to get a total affordable property budget.
export function BudgetCalculator() {
  const [monthlyEmi, setMonthlyEmi] = useState(40000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [downPaymentPct, setDownPaymentPct] = useState(20);

  const { loanAmount, totalBudget } = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0 || months <= 0) return { loanAmount: 0, totalBudget: 0 };
    const factor = Math.pow(1 + monthlyRate, months);
    const loan = (monthlyEmi * (factor - 1)) / (monthlyRate * factor);
    const budget = downPaymentPct < 100 ? loan / (1 - downPaymentPct / 100) : loan;
    return { loanAmount: loan, totalBudget: budget };
  }, [monthlyEmi, rate, years, downPaymentPct]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">Budget Calculator</h3>
      <p className="mt-1 text-xs text-slate-500">Work out what property price fits your monthly budget.</p>

      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-slate-700">Monthly EMI you can pay</label>
            <span className="text-slate-600">{formatInr(monthlyEmi)}</span>
          </div>
          <input
            type="range"
            min={5000}
            max={300000}
            step={1000}
            value={monthlyEmi}
            onChange={(event) => setMonthlyEmi(Number(event.target.value))}
            className="mt-1 w-full accent-blue-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-slate-700">Down payment</label>
            <span className="text-slate-600">{downPaymentPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={downPaymentPct}
            onChange={(event) => setDownPaymentPct(Number(event.target.value))}
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
        <p className="text-xs text-slate-500">Estimated affordable budget</p>
        <p className="text-2xl font-bold text-slate-900">{formatInr(totalBudget)}</p>
        <p className="mt-2 text-xs text-slate-500">
          Loan amount: <span className="font-medium text-slate-700">{formatInr(loanAmount)}</span>
        </p>
      </div>
      <p className="mt-3 text-xs text-slate-400">Indicative only — actual eligibility depends on the lender.</p>
    </div>
  );
}
