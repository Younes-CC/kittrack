export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent";

export const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50 disabled:pointer-events-none";

export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream disabled:opacity-50 disabled:pointer-events-none";

export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-accent-dark transition-colors hover:bg-accent-soft disabled:opacity-50 disabled:pointer-events-none";

export const cardClass = "rounded-2xl border border-border bg-surface shadow-sm";

export const STATUS_LABELS: Record<string, string> = {
  bestaetigt: "Bestätigt",
  angefragt: "Angefragt",
  storniert: "Storniert",
  erledigt: "Erledigt",
};

export const STATUS_STYLES: Record<string, string> = {
  bestaetigt: "bg-emerald-50 text-emerald-700 border-emerald-200",
  angefragt: "bg-amber-50 text-amber-700 border-amber-200",
  storniert: "bg-rose-50 text-rose-700 border-rose-200",
  erledigt: "bg-stone-100 text-stone-600 border-stone-200",
};
