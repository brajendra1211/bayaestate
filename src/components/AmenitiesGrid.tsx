const ICONS: { match: RegExp; path: string }[] = [
  { match: /swim|pool/i, path: "M3 16c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0M3 11h18M7 11V5a2 2 0 012-2h6a2 2 0 012 2v6" },
  { match: /gym|fitness/i, path: "M6.5 6.5l11 11M4 9l3-3M17 20l3-3M3 10l1-1 4 4-1 1-4-4zM16 7l4 4-1 1-4-4 1-1z" },
  { match: /club/i, path: "M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" },
  { match: /child|play\s*area|kids/i, path: "M12 3a2 2 0 110 4 2 2 0 010-4zM5 21v-6a4 4 0 014-4h6a4 4 0 014 4v6M9 11v4m6-4v4" },
  { match: /garden|landscap|park(?!ing)/i, path: "M12 21v-7m0 0c3 0 5-2 5-5-3 0-5 2-5 5zm0 0c-3 0-5-2-5-5 3 0 5 2 5 5zM12 3v4" },
  { match: /security|guard/i, path: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" },
  { match: /cctv|camera|surveillance/i, path: "M3 8h11l4-3v14l-4-3H3V8zM3 8v8" },
  { match: /power\s*back|generator/i, path: "M13 2L4 14h6l-1 8 9-12h-6l1-8z" },
  { match: /car\s*park|parking|garage/i, path: "M4 21V8l8-5 8 5v13M9 21v-6h6v6M4 21h16" },
  { match: /lift|elevator/i, path: "M8 7l4-4 4 4M8 17l4 4 4-4M12 3v18" },
  { match: /piped\s*gas|gas\s*pipeline/i, path: "M12 2v6m0 0a4 4 0 00-4 4c0 3 4 6 4 10 0-4 4-7 4-10a4 4 0 00-4-4z" },
  { match: /rain\s*water|harvest/i, path: "M12 3c3 4 6 7.5 6 11a6 6 0 01-12 0c0-3.5 3-7 6-11z" },
  { match: /indoor\s*games?|game\s*room/i, path: "M9 9h6m-6 3h3m5 6a2 2 0 002-2v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1a2 2 0 002 2h10z" },
  { match: /jogging|track|walking/i, path: "M13 4a2 2 0 110 4 2 2 0 010-4zM6 20l3-6 2 2 2-5 3 4M7 14l3-2" },
  { match: /amphitheat|theat/i, path: "M4 18c0-4.4 3.6-8 8-8s8 3.6 8 8M4 18h16M4 18v2h16v-2" },
  { match: /multipurpose\s*hall|banquet|hall/i, path: "M3 21h18M4 21V10l8-6 8 6v11M9 21v-5h6v5" },
  { match: /intercom|phone/i, path: "M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2" },
  { match: /fire\s*safety|fire\s*fighting/i, path: "M12 2c2 3-1 4-1 7a3 3 0 006 0c2 3 1 7-2 9a6 6 0 01-9-5c0-4 3-6 6-11z" },
  { match: /visitor\s*parking/i, path: "M4 21V8l8-5 8 5v13M9 21v-6h6v6M4 21h16M8 11h8" },
  { match: /water\s*supply|borewell/i, path: "M12 3c3 4 6 7.5 6 11a6 6 0 01-12 0c0-3.5 3-7 6-11z" },
  { match: /park\b/i, path: "M4 21V8l8-5 8 5v13M9 21v-6h6v6M4 21h16" },
  { match: /wifi|internet/i, path: "M5 12.5a11 11 0 0114 0M8 16a6.5 6.5 0 018 0M12 20h.01" },
  { match: /solar/i, path: "M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-6.5l-1.4 1.4M6.9 17.1l-1.4 1.4m0-13l1.4 1.4M17.1 17.1l1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z" },
];

const DEFAULT_ICON = "M5 13l4 4L19 7";

function iconFor(name: string) {
  return ICONS.find((icon) => icon.match.test(name))?.path ?? DEFAULT_ICON;
}

export function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {amenities.map((amenity) => (
        <div key={amenity} className="flex items-center gap-2 text-sm text-slate-700">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={iconFor(amenity)} />
            </svg>
          </span>
          <span className="truncate">{amenity}</span>
        </div>
      ))}
    </div>
  );
}
