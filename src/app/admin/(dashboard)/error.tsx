"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h1 className="font-display text-xl text-ink">Etwas ist schiefgelaufen</h1>
      <p className="mt-2 text-sm text-ink-soft">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-border px-5 py-2 text-sm text-ink transition hover:border-accent/40"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
