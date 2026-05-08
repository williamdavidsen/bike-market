import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  description: string;
};

export function ErrorState({ title = "Noe gikk galt", description }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-950">
      <div className="flex gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-red-600" size={20} />
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-red-800">{description}</p>
        </div>
      </div>
    </div>
  );
}
