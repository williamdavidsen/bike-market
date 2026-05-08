import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/Button";

type MobileFilterDrawerProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export function MobileFilterDrawer({ children, isOpen, onClose }: MobileFilterDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Lukk filter"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-modal="true"
        className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl"
        role="dialog"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-950">Filtrer produkter</h2>
          <Button aria-label="Lukk filter" onClick={onClose} type="button" variant="ghost">
            <X size={18} />
          </Button>
        </div>
        {children}
      </aside>
    </div>
  );
}
