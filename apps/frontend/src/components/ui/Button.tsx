import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-[var(--brand-green)] text-white hover:bg-[#128765]",
  secondary: "bg-[var(--brand-navy)] text-white hover:bg-[#101b2e]",
  ghost: "bg-white text-[var(--brand-navy)] ring-1 ring-slate-200 hover:bg-[var(--brand-mint)]"
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
