import type { ProfessionCode } from "$lib/types";

export const PROFESSIONS: Record<ProfessionCode, { name: string; color: string; bgColor: string }> =
  {
    w: { name: "Wojownik", color: "#ef4444", bgColor: "#7f1d1d" },
    t: { name: "Tropiciel", color: "#22c55e", bgColor: "#14532d" },
    h: { name: "Łowca", color: "#f97316", bgColor: "#7c2d12" },
    p: { name: "Paladyn", color: "#3b82f6", bgColor: "#1e3a8a" },
    m: { name: "Mag", color: "#8b5cf6", bgColor: "#5b21b6" },
    k: { name: "Kapłan", color: "#06b6d4", bgColor: "#155e75" },
  };

export function getProfessionStyle(code: ProfessionCode) {
  return PROFESSIONS[code] ?? { name: "Unknown", color: "#6b7280", bgColor: "#374151" };
}
