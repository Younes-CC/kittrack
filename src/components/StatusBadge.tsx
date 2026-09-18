import clsx from "clsx";
import { bookAvailabilityLabel } from "@/lib/format";

export function StatusBadge({ stockAvailable }: { stockAvailable: number }) {
  const label = bookAvailabilityLabel(stockAvailable);

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        stockAvailable <= 0 && "bg-ink/5 text-ink-soft",
        stockAvailable === 1 && "bg-gold/15 text-accent-dark",
        stockAvailable > 1 && "bg-accent-soft text-accent-dark",
      )}
    >
      {label}
    </span>
  );
}
