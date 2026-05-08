import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "green" | "blue" | "neutral";
};

const tones = {
  green: "bg-[var(--brand-mint)] text-[var(--brand-green)] ring-emerald-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  neutral: "bg-[var(--brand-gray)] text-slate-700 ring-slate-200"
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}
