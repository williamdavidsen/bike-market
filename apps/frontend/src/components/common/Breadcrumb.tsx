import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {item.href && !isLast ? (
              <Link className="font-semibold hover:text-emerald-700" to={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-950">{item.label}</span>
            )}
            {!isLast ? <ChevronRight aria-hidden="true" size={14} /> : null}
          </span>
        );
      })}
    </nav>
  );
}
