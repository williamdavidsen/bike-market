import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "../../types/api";
import { Button } from "../ui/Button";

type PaginationControlsProps = {
  pagination: Pagination;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Produktpagination" className="mt-8 flex items-center justify-center gap-3">
      <Button
        className="gap-2"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
        type="button"
        variant="ghost"
      >
        <ChevronLeft size={18} /> Forrige
      </Button>
      <span className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
        {pagination.page} / {pagination.totalPages}
      </span>
      <Button
        className="gap-2"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => onPageChange(pagination.page + 1)}
        type="button"
        variant="ghost"
      >
        Neste <ChevronRight size={18} />
      </Button>
    </nav>
  );
}
