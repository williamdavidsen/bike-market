import type { SVGProps } from "react";

type BrandLogoProps = {
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "inverse";
  className?: string;
};

const sizes = {
  sm: {
    mark: "h-8 w-11",
    text: "text-2xl"
  },
  md: {
    mark: "h-10 w-14",
    text: "text-3xl"
  },
  lg: {
    mark: "h-16 w-24",
    text: "text-5xl sm:text-6xl"
  }
};

function BicycleArrowMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 112 72" fill="none" {...props}>
      <circle cx="27" cy="51" r="17" stroke="currentColor" strokeWidth="9" />
      <circle cx="85" cy="51" r="17" stroke="currentColor" strokeWidth="9" />
      <path
        d="M27 51L47 25H66L85 51M47 25L58 51M54 25H87"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="9"
      />
      <path
        d="M73 10L91 27L73 44"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="9"
      />
    </svg>
  );
}

export function BrandLogo({ showWordmark = true, size = "md", tone = "default", className = "" }: BrandLogoProps) {
  const selectedSize = sizes[size];
  const wordmarkColor = tone === "inverse" ? "text-white" : "text-[var(--brand-navy)]";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <BicycleArrowMark className={`${selectedSize.mark} shrink-0 text-[var(--brand-green)]`} />
      {showWordmark ? (
        <span className={`brand-wordmark ${selectedSize.text} ${wordmarkColor}`}>
          Bike<span className="text-[var(--brand-green)]">market</span>
        </span>
      ) : null}
    </span>
  );
}
