import { Check } from "lucide-react";

export function CompletionModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 backdrop-blur-xl">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        className="glass-panel w-full max-w-md animate-rise rounded-4xl p-10 text-center"
      >
        <div className="mx-auto flex h-20 w-20 animate-check-pop items-center justify-center rounded-full border border-neon-emerald/40 bg-neon-emerald/15 glow-emerald">
          <Check className="h-10 w-10 text-neon-emerald" strokeWidth={3} />
        </div>
        <h2 id="completion-title" className="mt-6 text-2xl font-bold tracking-tight">
          Interview Successfully Completed
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your interview is done. You can safely close this window. Our team will
          contact you within 24 hours.
        </p>
      </div>
    </div>
  );
}
