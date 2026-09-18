export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function bookAvailabilityLabel(stockAvailable: number): string {
  if (stockAvailable <= 0) return "Vergriffen";
  if (stockAvailable === 1) return "Nur noch 1 verfügbar";
  return "Verfügbar";
}
