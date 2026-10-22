"use client";

import { useState } from "react";

export function FaqAccordion({ items }: { items: { id: string; question: string; answer: string }[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-slate-800"
            >
              {item.question}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {open && <p className="px-4 pb-4 text-sm text-slate-600">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
